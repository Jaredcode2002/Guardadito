import type { Fecha } from "./fechas";
import { formatearLempirasCompacto as L } from "./formato";
import { sumar, type Centavos } from "./money";

export const HORA_AVISO_PENDIENTE = 9;

export type Disparo =
  | { tipo: "diario"; hora: number; minuto: number }
  | { tipo: "fecha"; fecha: Date };

export type NotificacionPlaneada = {
  id: string;
  titulo: string;
  cuerpo: string;
  disparo: Disparo;
};

export type PendienteAvisable = {
  nombre: string;
  monto: Centavos;
  fechaVence: Fecha;
};

export type EntradaPlan = {
  ahora: Date;
  recordatorioActivo: boolean;
  horaRecordatorio: string;
  avisarPendientes: boolean;
  pendientes: readonly PendienteAvisable[];
};

export function unirNombres(nombres: readonly string[]): string {
  if (nombres.length <= 1) return nombres.join("");
  const conector = /^[iI]/.test(nombres[nombres.length - 1]) ? "e" : "y";
  return `${nombres.slice(0, -1).join(", ")} ${conector} ${nombres[nombres.length - 1]}`;
}

export function diaAntesALas(fecha: Fecha, hora: number): Date {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d - 1, hora, 0, 0, 0);
}

function avisoDePendientes(
  fecha: Fecha,
  grupo: readonly PendienteAvisable[],
): Omit<NotificacionPlaneada, "disparo"> {
  const total = L(sumar(grupo.map((p) => p.monto)));
  if (grupo.length === 1) {
    return {
      id: `pendientes-${fecha}`,
      titulo: `Mañana vence ${grupo[0].nombre}`,
      cuerpo: `Son ${total}. Márcalo como pagado en Guardadito cuando lo pagues.`,
    };
  }
  return {
    id: `pendientes-${fecha}`,
    titulo: `Mañana vencen ${grupo.length} pendientes`,
    cuerpo: `${unirNombres(grupo.map((p) => p.nombre))} · ${total} en total.`,
  };
}

export function planearNotificaciones(e: EntradaPlan): NotificacionPlaneada[] {
  const plan: NotificacionPlaneada[] = [];

  if (e.recordatorioActivo) {
    const [hora, minuto] = e.horaRecordatorio.split(":").map(Number);
    plan.push({
      id: "recordatorio",
      titulo: "¿Cómo te fue hoy?",
      cuerpo: "Anota lo que gastaste hoy para que tu libre siga al día.",
      disparo: { tipo: "diario", hora, minuto },
    });
  }

  if (e.avisarPendientes) {
    const porFecha = new Map<Fecha, PendienteAvisable[]>();
    for (const p of e.pendientes) {
      porFecha.set(p.fechaVence, [...(porFecha.get(p.fechaVence) ?? []), p]);
    }
    for (const fecha of [...porFecha.keys()].sort()) {
      const cuando = diaAntesALas(fecha, HORA_AVISO_PENDIENTE);
      if (cuando.getTime() <= e.ahora.getTime()) continue;
      plan.push({
        ...avisoDePendientes(fecha, porFecha.get(fecha) ?? []),
        disparo: { tipo: "fecha", fecha: cuando },
      });
    }
  }

  return plan;
}

export const PASO_MINUTOS = 15;

export function cambiarHora(
  hora24: string,
  campo: "hora" | "minuto",
  direccion: 1 | -1,
): string {
  const [h, m] = hora24.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (campo === "hora") return `${pad((h + direccion + 24) % 24)}:${pad(m)}`;
  const pasos = 60 / PASO_MINUTOS;
  const actual =
    direccion === 1
      ? Math.floor(m / PASO_MINUTOS)
      : Math.ceil(m / PASO_MINUTOS);
  const siguiente = (((actual + direccion) % pasos) + pasos) % pasos;
  return `${pad(h)}:${pad(siguiente * PASO_MINUTOS)}`;
}
