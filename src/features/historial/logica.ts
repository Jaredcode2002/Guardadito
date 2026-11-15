import { nombreMes, type MesId } from "@/lib/fechas";

function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

export function textoMeses(n: number): string {
  return plural(n, "mes", "meses");
}

export function textoMovimientos(n: number): string {
  return plural(n, "movimiento", "movimientos");
}

export function textoRango(meses: readonly MesId[]): string {
  if (meses.length === 0) return "";
  const primero = nombreMes(meses[0]);
  if (meses.length === 1) return primero;
  return `de ${primero} a ${nombreMes(meses[meses.length - 1])}`;
}

export function textoResumenBorrado(
  meses: readonly MesId[],
  movimientos: number,
): string {
  return `Se borrarán ${textoMeses(meses.length)} (${textoRango(meses)}) y ${textoMovimientos(movimientos)}.`;
}

export function tituloConfirmarBorrado(meses: number): string {
  return `¿Borrar ${textoMeses(meses)}?`;
}

export function mensajeConfirmarBorrado(
  meses: readonly MesId[],
  movimientos: number,
): string {
  return `${textoResumenBorrado(meses, movimientos)} Tu Dinero, tu Libre y tu ahorro de hoy no cambian. Esto no se puede deshacer.`;
}
