import {
  sonUmbralesValidos,
  UMBRALES_POR_DEFECTO,
  type Umbrales,
} from "../lib/alertas";
import type { Db } from "./tipos";

export type Ajustes = {
  umbrales: Umbrales;
  horaRecordatorio: string;
  recordatorioActivo: boolean;
  avisarPendientes: boolean;
};

const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function leerAjustes(db: Db): Promise<Ajustes> {
  const filas = await db.getAllAsync<{ clave: string; valor: string }>(
    "SELECT clave, valor FROM ajuste",
    [],
  );
  const mapa = new Map(filas.map((f) => [f.clave, f.valor]));
  const umbrales = {
    moderacion: Number(mapa.get("umbral_moderacion")),
    casiCero: Number(mapa.get("umbral_casi_cero")),
  };
  return {
    umbrales: sonUmbralesValidos(umbrales) ? umbrales : UMBRALES_POR_DEFECTO,
    horaRecordatorio: mapa.get("hora_recordatorio") ?? "21:00",
    recordatorioActivo: mapa.get("recordatorio_activo") !== "0",
    avisarPendientes: mapa.get("avisar_pendientes") !== "0",
  };
}

async function guardar(db: Db, clave: string, valor: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO ajuste (clave, valor) VALUES (?, ?)
     ON CONFLICT (clave) DO UPDATE SET valor = excluded.valor`,
    [clave, valor],
  );
}

export async function guardarUmbrales(db: Db, u: Umbrales): Promise<void> {
  if (!sonUmbralesValidos(u)) {
    throw new Error(
      `Umbrales inválidos: moderación ${u.moderacion} %, casi cero ${u.casiCero} %.`,
    );
  }
  await db.withTransactionAsync(async () => {
    await guardar(db, "umbral_moderacion", String(u.moderacion));
    await guardar(db, "umbral_casi_cero", String(u.casiCero));
  });
}

export async function guardarHoraRecordatorio(
  db: Db,
  hora: string,
): Promise<void> {
  if (!RE_HORA.test(hora)) throw new Error(`Hora inválida: "${hora}".`);
  await guardar(db, "hora_recordatorio", hora);
}

export async function guardarRecordatorioActivo(
  db: Db,
  activo: boolean,
): Promise<void> {
  await guardar(db, "recordatorio_activo", activo ? "1" : "0");
}

export async function guardarAvisarPendientes(
  db: Db,
  avisar: boolean,
): Promise<void> {
  await guardar(db, "avisar_pendientes", avisar ? "1" : "0");
}

export async function permisoNotificacionesPedido(db: Db): Promise<boolean> {
  const fila = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM ajuste WHERE clave = ?",
    ["permiso_notificaciones_pedido"],
  );
  return fila?.valor === "1";
}

export async function marcarPermisoNotificacionesPedido(db: Db): Promise<void> {
  await guardar(db, "permiso_notificaciones_pedido", "1");
}
