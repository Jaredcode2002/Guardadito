import type { EstadoFrasco } from "@/lib/frasco";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { sumar, type Centavos } from "@/lib/money";
import { palette } from "@/theme";

export const CHIP_ESTADO: Record<EstadoFrasco, { texto: string; color: string }> =
  {
    ok: { texto: "En orden", color: palette.lima },
    mod: { texto: "Ve más despacio", color: palette.ambar },
    crit: { texto: "Casi en cero", color: palette.coral },
    zero: { texto: "En cero", color: palette.coral },
    roto: { texto: "Ahorro tocado", color: palette.coral },
  };

export const COLOR_LIBRE: Record<EstadoFrasco, string> = {
  ok: palette.lima,
  mod: palette.ambar,
  crit: palette.coral,
  zero: palette.coral,
  roto: palette.coral,
};

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

  if (d.estado === "roto") {
    return {
      detalle: debajo ?? "Tu ahorro cubrió lo que faltaba",
      aviso: `Tu ahorro quedó en ${L(d.saldoAhorro)}`,
    };
  }

  if (d.estado === "zero") {
    return {
      detalle: debajo ?? "Ya gastaste todo tu libre",
      aviso:
        d.saldoAhorro > 0
          ? "Lo que gastes sale de tu ahorro"
          : "Sin ahorro: lo que gastes quedará en negativo",
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
