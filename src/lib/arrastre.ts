import { mesSiguiente, type Fecha, type MesId } from './fechas';
import type { Centavos } from './money';

export type NetoBorrado = {
  ingresos: Centavos;
  gastos: Centavos;
  ahorro: Centavos;
};

export type PlanDeArrastre = {
  fecha: Fecha;
  movimiento: { tipo: 'ingreso' | 'gasto'; monto: Centavos } | null;
  ahorro: Centavos | null;
};

export function puedeBorrarHasta(hasta: MesId, mesActual: MesId): boolean {
  return hasta < mesActual;
}

export function mesesBorrablesDe(meses: readonly MesId[], mesActual: MesId): MesId[] {
  return meses.filter((m) => puedeBorrarHasta(m, mesActual)).sort();
}

export function mesesHasta(meses: readonly MesId[], hasta: MesId): MesId[] {
  return meses.filter((m) => m <= hasta);
}

export function planDeArrastre(hasta: MesId, neto: NetoBorrado): PlanDeArrastre {
  const dinero = neto.ingresos - neto.gastos;
  return {
    fecha: `${mesSiguiente(hasta)}-01`,
    movimiento:
      dinero === 0
        ? null
        : { tipo: dinero > 0 ? 'ingreso' : 'gasto', monto: Math.abs(dinero) },
    ahorro: neto.ahorro === 0 ? null : neto.ahorro,
  };
}
