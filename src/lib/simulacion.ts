import type { Umbrales } from "./alertas";
import { estadoFrasco, type EstadoFrasco } from "./frasco";
import {
  planificarGasto,
  porcentajeRestante,
  type Centavos,
  type PlanDeGasto,
} from "./money";

export type SituacionActual = {
  libre: Centavos;
  libreInicial: Centavos;
  saldoAhorro: Centavos;
  ahorroTocadoSinReponer: boolean;
  umbrales: Umbrales;
};

export type TipoMovimientoNuevo = "gasto" | "ingreso";

export type Simulacion = {
  libre: Centavos;
  libreInicial: Centavos;
  porcentaje: number;
  estado: EstadoFrasco;
  plan: PlanDeGasto | null;
};

export function simularMovimiento(
  s: SituacionActual,
  tipo: TipoMovimientoNuevo,
  monto: Centavos,
): Simulacion {
  if (tipo === "ingreso") {
    const libre = s.libre + monto;
    const libreInicial = s.libreInicial + monto;
    return {
      libre,
      libreInicial,
      porcentaje: porcentajeRestante(libre, libreInicial),
      estado: estadoFrasco({
        libre,
        libreInicial,
        ahorroTocadoSinReponer: false,
        umbrales: s.umbrales,
      }),
      plan: null,
    };
  }

  const plan = planificarGasto(monto, s.libre, s.saldoAhorro);
  const libre = s.libre - monto + plan.desdeAhorro;
  return {
    libre,
    libreInicial: s.libreInicial,
    porcentaje: porcentajeRestante(libre, s.libreInicial),
    estado: estadoFrasco({
      libre,
      libreInicial: s.libreInicial,
      ahorroTocadoSinReponer: s.ahorroTocadoSinReponer || plan.desdeAhorro > 0,
      umbrales: s.umbrales,
    }),
    plan,
  };
}
