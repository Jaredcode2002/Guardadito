import type { EstadoFrasco } from "@/lib/frasco";
import { conAlfa, masLegible } from "@/lib/tonos";
import type { Tema } from "@/theme/tema";

export const VIEWBOX = { ancho: 120, alto: 160 } as const;

export const CUERPO = { x: 10, y: 22, ancho: 100, alto: 132, radio: 26 } as const;

export const FONDO_CUERPO = CUERPO.y + CUERPO.alto;

export const ZONA_OJOS = 66;
export const ZONA_BOCA = 92;
export const ZONA_GOTA = 58;

export type EstadoConLiquido = Extract<EstadoFrasco, "ok" | "mod" | "crit">;

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

export type VarianteFrasco = "panel" | "fondo" | "toast";

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

export function coloresFrasco(t: Tema, variante: VarianteFrasco): ColoresFrasco {
  if (variante === "toast") {
    const tinta = t.sobreLiquido;
    return {
      cuerpoRelleno: "none",
      cuerpoBorde: tinta,
      tapa: tinta,
      rasgoSobreVidrio: tinta,
      rasgoSobreLiquido: masLegible([tinta], [t.textoSobrePanel, t.fondo, t.texto, t.panel]),
      liquido: { ok: tinta, mod: tinta, crit: tinta },
      opacidadLiquido: 0.85,
      grieta: tinta,
      moneda: tinta,
      bordeMoneda: "none",
    };
  }
  const trazo = variante === "panel" ? t.textoSobrePanel : t.texto;
  return {
    cuerpoRelleno: conAlfa(trazo, variante === "panel" ? 0.07 : 0.05),
    cuerpoBorde: conAlfa(trazo, 0.42),
    tapa: variante === "panel" ? t.textoSobrePanel : t.panel,
    rasgoSobreVidrio: trazo,
    rasgoSobreLiquido: t.sobreLiquido,
    liquido: t.liquido,
    opacidadLiquido: 1,
    grieta: trazo,
    moneda: t.acento,
    bordeMoneda: t.sobreAcento,
  };
}

export function colorRasgo(
  nivelY: number,
  yRasgo: number,
  colores: ColoresFrasco,
): string {
  return nivelY < yRasgo ? colores.rasgoSobreLiquido : colores.rasgoSobreVidrio;
}
