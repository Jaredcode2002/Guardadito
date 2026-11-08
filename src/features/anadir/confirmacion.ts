import { formatearLempirasCompacto as L } from "@/lib/formato";
import type { Centavos, PlanDeGasto } from "@/lib/money";

export type TextosConfirmacion = {
  titulo: string;
  destacado: string;
  negativo: string | null;
  detalle: string;
};

export function requiereConfirmacion(plan: PlanDeGasto): boolean {
  return plan.desdeAhorro > 0 || plan.enNegativo > 0;
}

function inicio(plan: PlanDeGasto): string {
  return plan.desdeLibre > 0
    ? `Tu libre es ${L(plan.desdeLibre)} y el gasto es ${L(plan.gasto)}.`
    : `Ya no te queda libre y el gasto es ${L(plan.gasto)}.`;
}

export function textosConfirmacion(
  plan: PlanDeGasto,
  saldoAhorro: Centavos,
): TextosConfirmacion {
  const negativo =
    plan.enNegativo > 0 ? `y quedarás ${L(plan.enNegativo)} en negativo` : null;

  if (plan.desdeAhorro === 0) {
    return {
      titulo: "Este gasto te dejará en negativo",
      destacado: L(plan.enNegativo),
      negativo: null,
      detalle: `${inicio(plan)} No tienes ahorro que lo cubra: el faltante se repone con tu próximo ingreso.`,
    };
  }

  const cuanto =
    plan.desdeLibre > 0
      ? `Los ${L(plan.desdeAhorro)} que faltan`
      : `Los ${L(plan.desdeAhorro)}`;
  const detalle =
    plan.enNegativo > 0
      ? `${inicio(plan)} Tu ahorro solo alcanza para ${L(plan.desdeAhorro)} y quedaría en L 0. Lo demás se repone con tu próximo ingreso.`
      : `${inicio(plan)} ${cuanto} saldrán de tu ahorro, que quedaría en ${L(saldoAhorro - plan.desdeAhorro)}.`;

  return {
    titulo: "Este gasto tocará tu ahorro",
    destacado: L(plan.desdeAhorro),
    negativo,
    detalle,
  };
}
