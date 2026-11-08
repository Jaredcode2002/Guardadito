import { ultimaFechaDelMes, type MesId } from './fechas';
import type { Centavos } from './money';

/**
 * Qué registrar al cerrar un mes: si sobró Libre, se mueve al ahorro con un
 * gasto "sobrante" fechado el último día del mes (así Dinero baja y el
 * Libre del mes nuevo empieza sin él). Si el Libre es 0 o negativo, no se
 * mueve nada: el ahorro nunca cubre un faltante automáticamente.
 */
export type PlanDeCierre = { sobrante: Centavos; fecha: string } | null;

export function planDeCierre(mes: MesId, libre: Centavos): PlanDeCierre {
  if (libre <= 0) return null;
  return { sobrante: libre, fecha: ultimaFechaDelMes(mes) };
}
