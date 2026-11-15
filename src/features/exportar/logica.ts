import type { Movimiento } from "@/db";
import type { FilaCsv } from "@/lib/csv";
import { nombreMes, type MesId } from "@/lib/fechas";

export type ModoRango = "mes" | "rango" | "todo";

export type Rango = { desde: MesId; hasta: MesId };

export function rangoExportar(
  modo: ModoRango,
  meses: readonly MesId[],
  mesActual: MesId,
  elegido: Rango,
): Rango {
  if (modo === "mes") return { desde: mesActual, hasta: mesActual };
  if (modo === "todo") {
    const orden = [...meses, mesActual].sort();
    return { desde: orden[0], hasta: orden[orden.length - 1] };
  }
  return elegido.desde <= elegido.hasta
    ? elegido
    : { desde: elegido.hasta, hasta: elegido.desde };
}

export function nombreArchivoCsv(r: Rango): string {
  return `guardadito-${r.desde}_${r.hasta}.csv`;
}

export function textoRangoExportar(r: Rango): string {
  return r.desde === r.hasta
    ? nombreMes(r.desde)
    : `De ${nombreMes(r.desde)} a ${nombreMes(r.hasta)}`;
}

export function textoResumenExportar(r: Rango, movimientos: number): string {
  const cuantos =
    movimientos === 1 ? "1 movimiento" : `${movimientos} movimientos`;
  return `${textoRangoExportar(r)}: ${cuantos}.`;
}

export function filasCsv(movimientos: readonly Movimiento[]): FilaCsv[] {
  return movimientos.map((m) => ({
    fecha: m.fecha,
    tipo: m.tipo,
    origen: m.origen,
    categoria: m.categoria,
    descripcion: m.descripcion,
    monto: m.monto,
  }));
}

export function esCancelacion(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const { code, message } = e as { code?: unknown; message?: unknown };
  return (
    (typeof code === "string" && code.includes("CANCEL")) ||
    (typeof message === "string" && /cancel/i.test(message))
  );
}
