import { formatearLempirasCompacto as L } from "@/lib/formato";
import { gastoPermitido, type Centavos, type PlanDeGasto } from "@/lib/money";

export type TextosConfirmacion = {
  permitido: boolean;
  titulo: string;
  destacado: string;
  nota: string | null;
  detalle: string;
};

export function requiereConfirmacion(plan: PlanDeGasto): boolean {
  return plan.desdeAhorro > 0 || !gastoPermitido(plan);
}

function inicio(plan: PlanDeGasto): string {
  return plan.desdeLibre > 0
    ? `Tu libre es ${L(plan.desdeLibre)} y el gasto es ${L(plan.gasto)}.`
    : `Ya no te queda libre y el gasto es ${L(plan.gasto)}.`;
}

function recursos(plan: PlanDeGasto): string {
  const libre =
    plan.desdeLibre > 0 ? `Tu libre es ${L(plan.desdeLibre)}` : "Ya no te queda libre";
  const ahorro =
    plan.desdeAhorro > 0 ? `tu ahorro es ${L(plan.desdeAhorro)}` : "no tienes ahorro";
  return `${libre}, ${ahorro} y el gasto es ${L(plan.gasto)}.`;
}

export function textosConfirmacion(
  plan: PlanDeGasto,
  saldoAhorro: Centavos,
): TextosConfirmacion {
  if (!gastoPermitido(plan)) {
    return {
      permitido: false,
      titulo: "No te alcanza para este gasto",
      destacado: L(plan.faltante),
      nota:
        plan.desdeAhorro > 0
          ? "es lo que te falta, aun usando tu ahorro"
          : "es lo que te falta",
      detalle: `${recursos(plan)} No se registrará: espera tu próximo ingreso o elige un monto menor.`,
    };
  }

  const cuanto =
    plan.desdeLibre > 0
      ? `Los ${L(plan.desdeAhorro)} que faltan`
      : `Los ${L(plan.desdeAhorro)}`;

  return {
    permitido: true,
    titulo: "Este gasto tocará tu ahorro",
    destacado: L(plan.desdeAhorro),
    nota: null,
    detalle: `${inicio(plan)} ${cuanto} saldrán de tu ahorro, que quedaría en ${L(saldoAhorro - plan.desdeAhorro)}.`,
  };
}
