import { ultimaFechaDelMes, type MesId } from './fechas';
import type { Centavos } from './money';

export type PlanDeCierre = { sobrante: Centavos; fecha: string } | null;

export function planDeCierre(mes: MesId, libre: Centavos): PlanDeCierre {
  if (libre <= 0) return null;
  return { sobrante: libre, fecha: ultimaFechaDelMes(mes) };
}
