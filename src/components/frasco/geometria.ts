import type { EstadoFrasco, FormaFrasco } from "@/lib/frasco";
import { conAlfa, masLegible, mezclar } from "@/lib/tonos";
import type { Tema } from "@/theme/tema";

export const VIEWBOX = { ancho: 120, alto: 160 } as const;

export type Caja = { x1: number; y1: number; x2: number; y2: number };

export type Circulo = { cx: number; cy: number; r: number };

export type Dibujo = FormaFrasco | "elixirChico";

export const DIBUJOS: readonly Dibujo[] = [
  "frasco",
  "caguama",
  "pocion",
  "elixir",
  "elixirChico",
];

export type GeometriaDibujo = {
  contorno: string;
  tramo: { desde: number; hasta: number };
  llenado: { arriba: number; abajo: number };
  panza: Caja;
  tapa: string;
  tapaRota: string;
  alambre: string;
  sellos: string;
  detalles: string;
  brillo: string;
  destellos: string;
  vidrioAmbar: boolean;
  espuma: boolean;
  burbujas: readonly Circulo[];
  cara: { x: number; y: number; escala: number };
  grieta: string;
  monedas: readonly Circulo[];
};

export const CENTRO_CARA = { x: 60, y: 86 } as const;

export const CAJA_CARA: Caja = { x1: 38, y1: 56, x2: 100, y2: 110 };

export const ZONA_OJOS = 66;
export const ZONA_BOCA = 92;
export const ZONA_GOTA = 58;
export const ALTURA_OJOS = 80;

export const GROSOR_ESPUMA = 6;

export const CAMBIO_ELIXIR = 0.5;

const COMPLETO = { desde: 0, hasta: 1 } as const;

const BASE = {
  tramo: COMPLETO,
  alambre: "",
  sellos: "",
  detalles: "",
  destellos: "",
  vidrioAmbar: false,
  espuma: false,
  burbujas: [],
} as const;

function estrella(x: number, y: number, r: number): string {
  return `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;
}

export const GEOMETRIAS: Record<Dibujo, GeometriaDibujo> = {
  frasco: {
    ...BASE,
    contorno:
      "M36 22 H84 A26 26 0 0 1 110 48 V128 A26 26 0 0 1 84 154 H36 A26 26 0 0 1 10 128 V48 A26 26 0 0 1 36 22 Z",
    llenado: { arriba: 22, abajo: 154 },
    panza: { x1: 10, y1: 22, x2: 110, y2: 154 },
    tapa: "M38 6 H82 A6 6 0 0 1 88 12 V17 A6 6 0 0 1 82 23 H38 A6 6 0 0 1 32 17 V12 A6 6 0 0 1 38 6 Z",
    tapaRota: "rotate(-14 60 14)",
    brillo: "M24 46 q-3 24 0 48",
    cara: { x: 60, y: 86, escala: 1 },
    grieta: "M92 22 L84 42 L96 56 L84 76 L94 96",
    monedas: [
      { cx: 98, cy: 150, r: 6 },
      { cx: 112, cy: 141, r: 4.5 },
    ],
  },
  caguama: {
    ...BASE,
    contorno:
      "M49 16 H71 V22 L69 24 V48 C69 62 94 66 94 84 V142 Q94 154 82 154 H38 Q26 154 26 142 V84 C26 66 51 62 51 48 V24 L49 22 Z",
    llenado: { arriba: 44, abajo: 154 },
    panza: { x1: 26, y1: 84, x2: 94, y2: 154 },
    tapa: "M46 7 Q46 4 49 4 H71 Q74 4 74 7 V14 L72 17 L69 14 L66 17 L63 14 L60 17 L57 14 L54 17 L51 14 L48 17 L46 14 Z",
    tapaRota: "rotate(-26 74 16)",
    sellos: "M51 29 H69 V39 H51 Z",
    detalles: "M27 91 H93 M27 147 H93",
    brillo: "M33 98 q-2 20 0 40",
    vidrioAmbar: true,
    espuma: true,
    burbujas: [
      { cx: 38, cy: 140, r: 2 },
      { cx: 45, cy: 126, r: 1.5 },
      { cx: 36, cy: 110, r: 1.5 },
      { cx: 80, cy: 136, r: 2 },
      { cx: 74, cy: 146, r: 1.5 },
      { cx: 84, cy: 104, r: 2 },
      { cx: 62, cy: 70, r: 1.5 },
      { cx: 44, cy: 86, r: 1.5 },
    ],
    cara: { x: 60, y: 119, escala: 0.78 },
    grieta: "M88 70 L80 90 L90 104 L80 122 L88 138",
    monedas: [
      { cx: 104, cy: 148, r: 6 },
      { cx: 114, cy: 136, r: 4.5 },
    ],
  },
  pocion: {
    ...BASE,
    contorno:
      "M48 24 H72 V30 L70 31 V61.1 A46 46 0 1 1 50 61.1 V31 L48 30 Z",
    llenado: { arriba: 62, abajo: 152 },
    panza: { x1: 28, y1: 74, x2: 92, y2: 138 },
    tapa: "M52 8 Q52 4 56 4 H64 Q68 4 68 8 V26 H52 Z",
    tapaRota: "translate(9 -5) rotate(24 60 26)",
    detalles: "M50 37 H70",
    brillo: "M28 96 q3 -18 17 -27",
    destellos: `${estrella(102, 42, 7)} ${estrella(18, 50, 4.5)} ${estrella(110, 64, 3.5)}`,
    cara: { x: 60, y: 106, escala: 0.78 },
    grieta: "M86 66 L78 82 L90 96 L80 114 L88 130",
    monedas: [
      { cx: 100, cy: 148, r: 6 },
      { cx: 112, cy: 136, r: 4.5 },
    ],
  },
  elixir: {
    ...BASE,
    contorno:
      "M30 42 H90 C90 52 110 58 110 92 C110 130 90 154 60 154 C30 154 10 130 10 92 C10 58 30 52 30 42 Z",
    tramo: { desde: CAMBIO_ELIXIR, hasta: 1 },
    llenado: { arriba: 46, abajo: 154 },
    panza: { x1: 24, y1: 62, x2: 96, y2: 136 },
    tapa: "M26 42 Q23 42 23 39 V34 Q23 26 34 24 H86 Q97 26 97 34 V39 Q97 42 94 42 Z",
    tapaRota: "rotate(-24 97 40)",
    alambre: "M90 30 L106 40 L101 64 M99 62 L105 64",
    detalles: "M31 47 H89",
    brillo: "M22 84 q1 -16 12 -26",
    destellos: `${estrella(112, 20, 6)} ${estrella(9, 30, 4)}`,
    cara: { x: 60, y: 100, escala: 0.9 },
    grieta: "M96 60 L86 78 L98 92 L86 110 L94 126",
    monedas: [
      { cx: 104, cy: 150, r: 6 },
      { cx: 114, cy: 138, r: 4.5 },
    ],
  },
  elixirChico: {
    ...BASE,
    contorno:
      "M48 58 H72 V64 L70 65 V70 C70 76 86 76 86 90 V142 Q86 154 74 154 H46 Q34 154 34 142 V90 C34 76 50 76 50 70 V65 L48 64 Z",
    tramo: { desde: 0, hasta: CAMBIO_ELIXIR },
    llenado: { arriba: 76, abajo: 154 },
    panza: { x1: 34, y1: 92, x2: 86, y2: 150 },
    tapa: "M51 48 Q51 44 55 44 H65 Q69 44 69 48 V62 H51 Z",
    tapaRota: "translate(8 -6) rotate(22 60 62)",
    brillo: "M41 100 v30",
    destellos: `${estrella(98, 68, 5)} ${estrella(22, 84, 3.5)}`,
    cara: { x: 60, y: 122, escala: 0.62 },
    grieta: "M80 92 L74 106 L84 116 L76 130 L82 144",
    monedas: [
      { cx: 98, cy: 150, r: 5 },
      { cx: 108, cy: 139, r: 4 },
    ],
  },
};

export function dibujoPara(
  forma: FormaFrasco,
  porcentaje: number,
  estado: EstadoFrasco,
): Dibujo {
  if (forma !== "elixir") return forma;
  return tieneLiquido(estado) && porcentaje >= CAMBIO_ELIXIR
    ? "elixir"
    : "elixirChico";
}

export function dibujoLleno(forma: FormaFrasco): Dibujo {
  return dibujoPara(forma, 1, "ok");
}

function transformarX(dibujo: Dibujo, x: number): number {
  const { cara } = GEOMETRIAS[dibujo];
  return cara.x + cara.escala * (x - CENTRO_CARA.x);
}

function transformarY(dibujo: Dibujo, y: number): number {
  const { cara } = GEOMETRIAS[dibujo];
  return cara.y + cara.escala * (y - CENTRO_CARA.y);
}

export function transformacionCara(dibujo: Dibujo): string {
  const { cara } = GEOMETRIAS[dibujo];
  const tx = cara.x - cara.escala * CENTRO_CARA.x;
  const ty = cara.y - cara.escala * CENTRO_CARA.y;
  return `translate(${tx} ${ty}) scale(${cara.escala})`;
}

export function cajaCara(dibujo: Dibujo): Caja {
  return {
    x1: transformarX(dibujo, CAJA_CARA.x1),
    y1: transformarY(dibujo, CAJA_CARA.y1),
    x2: transformarX(dibujo, CAJA_CARA.x2),
    y2: transformarY(dibujo, CAJA_CARA.y2),
  };
}

export function zonasCara(dibujo: Dibujo) {
  return {
    ojos: transformarY(dibujo, ZONA_OJOS),
    boca: transformarY(dibujo, ZONA_BOCA),
    gota: transformarY(dibujo, ZONA_GOTA),
  };
}

export function alturaOjos(dibujo: Dibujo): number {
  return transformarY(dibujo, ALTURA_OJOS);
}

export type EstadoConLiquido = Extract<EstadoFrasco, "ok" | "mod" | "crit">;

export function tieneLiquido(estado: EstadoFrasco): estado is EstadoConLiquido {
  return estado === "ok" || estado === "mod" || estado === "crit";
}

const acotar = (v: number) => Math.min(1, Math.max(0, v));

export function nivelLiquido(porcentaje: number, dibujo: Dibujo): number {
  const { tramo, llenado } = GEOMETRIAS[dibujo];
  const local = acotar((porcentaje - tramo.desde) / (tramo.hasta - tramo.desde));
  return llenado.abajo - (llenado.abajo - llenado.arriba) * local;
}

export function porcentajeParaNivel(nivelY: number, dibujo: Dibujo): number {
  const { tramo, llenado } = GEOMETRIAS[dibujo];
  const local = acotar((llenado.abajo - nivelY) / (llenado.abajo - llenado.arriba));
  return tramo.desde + local * (tramo.hasta - tramo.desde);
}

export function nivelSegunEstado(
  estado: EstadoFrasco,
  porcentaje: number,
  dibujo: Dibujo,
) {
  return tieneLiquido(estado)
    ? nivelLiquido(porcentaje, dibujo)
    : GEOMETRIAS[dibujo].llenado.abajo;
}

export function burbujaSumergida(burbuja: Circulo, nivelY: number): boolean {
  return burbuja.cy - burbuja.r > nivelY + GROSOR_ESPUMA;
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
  vidrioAmbar: string;
  cuerpoBorde: string;
  tapa: string;
  rasgoSobreVidrio: string;
  rasgoSobreLiquido: string;
  liquido: Record<EstadoConLiquido, string>;
  espuma: Record<EstadoConLiquido, string>;
  opacidadLiquido: number;
  grieta: string;
  moneda: string;
  bordeMoneda: string;
  destello: string;
};

export function coloresFrasco(t: Tema, variante: VarianteFrasco): ColoresFrasco {
  if (variante === "toast") {
    const tinta = t.sobreLiquido;
    const espuma = conAlfa(tinta, 0.45);
    return {
      cuerpoRelleno: "none",
      vidrioAmbar: "none",
      cuerpoBorde: tinta,
      tapa: tinta,
      rasgoSobreVidrio: tinta,
      rasgoSobreLiquido: masLegible([tinta], [t.textoSobrePanel, t.fondo, t.texto, t.panel]),
      liquido: { ok: tinta, mod: tinta, crit: tinta },
      espuma: { ok: espuma, mod: espuma, crit: espuma },
      opacidadLiquido: 0.85,
      grieta: tinta,
      moneda: tinta,
      bordeMoneda: "none",
      destello: tinta,
    };
  }
  const trazo = variante === "panel" ? t.textoSobrePanel : t.texto;
  const espuma = (color: string) => mezclar(color, t.textoSobrePanel, 0.6);
  return {
    cuerpoRelleno: conAlfa(trazo, variante === "panel" ? 0.07 : 0.05),
    vidrioAmbar: conAlfa(t.liquido.mod, variante === "panel" ? 0.16 : 0.2),
    cuerpoBorde: conAlfa(trazo, 0.42),
    tapa: variante === "panel" ? t.textoSobrePanel : t.panel,
    rasgoSobreVidrio: trazo,
    rasgoSobreLiquido: t.sobreLiquido,
    liquido: t.liquido,
    espuma: {
      ok: espuma(t.liquido.ok),
      mod: espuma(t.liquido.mod),
      crit: espuma(t.liquido.crit),
    },
    opacidadLiquido: 1,
    grieta: trazo,
    moneda: t.acento,
    bordeMoneda: t.sobreAcento,
    destello: conAlfa(trazo, 0.6),
  };
}

export function colorRasgo(
  nivelY: number,
  yRasgo: number,
  colores: ColoresFrasco,
): string {
  return nivelY < yRasgo ? colores.rasgoSobreLiquido : colores.rasgoSobreVidrio;
}
