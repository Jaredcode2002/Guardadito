import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

import {
  leerAjustes,
  marcarPermisoNotificacionesPedido,
  momentoActual,
  pendientesParaAvisar,
  permisoNotificacionesPedido,
  type Db,
} from "@/db";
import {
  planearNotificaciones,
  type Disparo,
} from "@/lib/notificaciones";
import { palette } from "@/theme";

const CANAL = "recordatorios";

export type EstadoPermiso = {
  concedido: boolean;
  puedePedir: boolean;
};

export function configurarNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

let canalDisponible: boolean | null = null;

async function asegurarCanal(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if (canalDisponible !== null) return canalDisponible;
  try {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: "Recordatorios",
      description: "Recordatorio nocturno y avisos de pendientes",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: palette.lima,
    });
    canalDisponible = true;
  } catch {
    canalDisponible = false;
  }
  return canalDisponible;
}

function canal(conCanal: boolean): { channelId?: string } {
  return conCanal ? { channelId: CANAL } : {};
}

export async function leerPermiso(): Promise<EstadoPermiso> {
  const p = await Notifications.getPermissionsAsync();
  return { concedido: p.granted, puedePedir: p.canAskAgain };
}

export async function pedirPermiso(): Promise<EstadoPermiso> {
  await asegurarCanal();
  const actual = await leerPermiso();
  if (actual.concedido) return actual;
  if (!actual.puedePedir) {
    await Linking.openSettings();
    return actual;
  }
  const p = await Notifications.requestPermissionsAsync();
  return { concedido: p.granted, puedePedir: p.canAskAgain };
}

export async function pedirPermisoLaPrimeraVez(db: Db): Promise<void> {
  if (await permisoNotificacionesPedido(db)) return;
  await marcarPermisoNotificacionesPedido(db);
  await asegurarCanal();
  const actual = await leerPermiso();
  if (!actual.concedido && actual.puedePedir) {
    await Notifications.requestPermissionsAsync();
  }
}

function aTrigger(
  d: Disparo,
  conCanal: boolean,
): Notifications.NotificationTriggerInput {
  if (d.tipo === "diario") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: d.hora,
      minute: d.minuto,
      ...canal(conCanal),
    };
  }
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: d.fecha,
    ...canal(conCanal),
  };
}

async function programarAhora(db: Db): Promise<void> {
  const { concedido } = await leerPermiso();
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!concedido) return;
  const conCanal = await asegurarCanal();
  const momento = momentoActual();
  const [ajustes, pendientes] = await Promise.all([
    leerAjustes(db),
    pendientesParaAvisar(db, momento.hoy),
  ]);
  const plan = planearNotificaciones({
    ahora: new Date(),
    recordatorioActivo: ajustes.recordatorioActivo,
    horaRecordatorio: ajustes.horaRecordatorio,
    avisarPendientes: ajustes.avisarPendientes,
    pendientes,
  });
  for (const n of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: n.id,
      content: { title: n.titulo, body: n.cuerpo, color: palette.panel },
      trigger: aTrigger(n.disparo, conCanal),
    });
  }
}

let cola: Promise<void> = Promise.resolve();

export function reprogramar(db: Db): Promise<void> {
  cola = cola.then(
    () => programarAhora(db),
    () => programarAhora(db),
  );
  return cola.catch((e) => {
    console.warn("No se pudieron programar las notificaciones", e);
  });
}
