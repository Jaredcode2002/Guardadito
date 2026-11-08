import type { EstadoFrasco } from "@/lib/frasco";
import { palette } from "@/theme";

export const VIEWBOX = { ancho: 120, alto: 160 } as const;

export const CUERPO = { x: 10, y: 22, ancho: 100, alto: 132, radio: 26 } as const;

export const FONDO_CUERPO = CUERPO.y + CUERPO.alto;

export const ZONA_OJOS = 66;
export const ZONA_BOCA = 92;
export const ZONA_GOTA = 58;

export type EstadoConLiquido = Extract<EstadoFrasco, "ok" | "mod" | "crit">;

export const COLOR_LIQUIDO: Record<EstadoConLiquido, string> = {
  ok: palette.lima,
  mod: palette.ambar,
  crit: palette.coral,
};

export function tieneLiquido(estado: EstadoFrasco): estado is EstadoConLiquido {
  return estado === "ok" || estado === "mod" || estado === "crit";
}

export function nivelLiquido(porcentaje: number): number {
  const p = Math.min(1, Math.max(0, porcentaje));
  return CUERPO.y + CUERPO.alto * (1 - p);
}

export const ALTURA_OJOS = 80;

export function porcentajeParaNivel(nivelY: number): number {
  const p = (CUERPO.y + CUERPO.alto - nivelY) / CUERPO.alto;
  return Math.min(1, Math.max(0, p));
}

export function nivelSegunEstado(estado: EstadoFrasco, porcentaje: number) {
  return tieneLiquido(estado) ? nivelLiquido(porcentaje) : FONDO_CUERPO;
}

export function caminoOla(nivelY: number, desfase: number): string {
  "worklet";
  const x = -60 + desfase;
  let d = `M${x} ${nivelY} q12.5 -7 25 0`;
  for (let i = 0; i < 8; i++) d += " t25 0";
  return `${d} V${VIEWBOX.alto} H${x} Z`;
}

export type TemaFrasco = "panel" | "claro" | "toast";

export type ColoresFrasco = {
  cuerpoRelleno: string;
  cuerpoBorde: string;
  tapa: string;
  rasgoSobreVidrio: string;
  rasgoSobreLiquido: string;
  liquido: Record<EstadoConLiquido, string>;
  opacidadLiquido: number;
  grieta: string;
  moneda: string;
  bordeMoneda: string;
};

export const TEMAS_FRASCO: Record<TemaFrasco, ColoresFrasco> = {
  panel: {
    cuerpoRelleno: "rgba(246,241,231,0.07)",
    cuerpoBorde: "rgba(246,241,231,0.42)",
    tapa: palette.crema,
    rasgoSobreVidrio: palette.crema,
    rasgoSobreLiquido: palette.tinta,
    liquido: COLOR_LIQUIDO,
    opacidadLiquido: 1,
    grieta: palette.crema,
    moneda: palette.lima,
    bordeMoneda: palette.tinta,
  },
  claro: {
    cuerpoRelleno: "rgba(23,35,28,0.05)",
    cuerpoBorde: "rgba(23,35,28,0.42)",
    tapa: palette.panel,
    rasgoSobreVidrio: palette.tinta,
    rasgoSobreLiquido: palette.tinta,
    liquido: COLOR_LIQUIDO,
    opacidadLiquido: 1,
    grieta: palette.tinta,
    moneda: palette.lima,
    bordeMoneda: palette.tinta,
  },
  toast: {
    cuerpoRelleno: "none",
    cuerpoBorde: palette.tinta,
    tapa: palette.tinta,
    rasgoSobreVidrio: palette.tinta,
    rasgoSobreLiquido: palette.crema,
    liquido: { ok: palette.tinta, mod: palette.tinta, crit: palette.tinta },
    opacidadLiquido: 0.85,
    grieta: palette.tinta,
    moneda: palette.tinta,
    bordeMoneda: "none",
  },
};

export function colorRasgo(
  nivelY: number,
  yRasgo: number,
  tema: TemaFrasco = "panel",
): string {
  const colores = TEMAS_FRASCO[tema];
  return nivelY < yRasgo ? colores.rasgoSobreLiquido : colores.rasgoSobreVidrio;
}
