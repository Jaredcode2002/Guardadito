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

export function colorRasgo(nivelY: number, yRasgo: number): string {
  return nivelY < yRasgo ? palette.tinta : palette.crema;
}
