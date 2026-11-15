import type { EstadoFrasco } from "@/lib/frasco";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { sumar, type Centavos } from "@/lib/money";
export const CHIP_ESTADO: Record<EstadoFrasco, string> = {
  ok: "En orden",
  mod: "Ve más despacio",
  crit: "Casi en cero",
  zero: "En cero",
  roto: "Ahorro tocado",
};

export function chipDelPanel(d: {
  estado: EstadoFrasco;
  libre: Centavos;
}): { texto: string; estado: EstadoFrasco } {
  if (d.estado === "roto" && d.libre < 0) return { texto: "En negativo", estado: "crit" };
  return { texto: CHIP_ESTADO[d.estado], estado: d.estado };
}

export type DatosPanel = {
  estado: EstadoFrasco;
  libre: Centavos;
  libreInicial: Centavos;
  porcentaje: number;
  saldoAhorro: Centavos;
};

export function textosPanel(d: DatosPanel): {
  detalle: string;
  aviso: string | null;
} {
  const debajo = d.libre < 0 ? `Estás ${L(-d.libre)} por debajo de cero` : null;

  if (d.estado === "roto" && debajo) {
    return { detalle: debajo, aviso: "Se repone con tu próximo ingreso" };
  }

  if (d.estado === "roto") {
    return {
      detalle: "Tu ahorro cubrió lo que faltaba",
      aviso: `Tu ahorro quedó en ${L(d.saldoAhorro)}`,
    };
  }

  if (d.estado === "zero") {
    return {
      detalle: debajo ?? "Ya gastaste todo tu libre",
      aviso:
        d.saldoAhorro > 0
          ? "Lo que gastes sale de tu ahorro"
          : "Sin ahorro: no podrás gastar hasta tu próximo ingreso",
    };
  }

  return {
    detalle: `Te queda el ${Math.round(d.porcentaje * 100)}% de tu libre · empezó en ${L(d.libreInicial)}`,
    aviso: null,
  };
}

export function resumenPendientes(montos: readonly Centavos[]): string {
  return `${montos.length} por pagar · ${L(sumar(montos))}`;
}
