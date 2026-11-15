export type EstadoLiquido = "ok" | "mod" | "crit";

export type Paleta = {
  nombre: string;
  fondo: string;
  superficie: string;
  borde: string;
  bordeFuerte: string;
  texto: string;
  textoSecundario: string;
  panel: string;
  panelSecundario: string;
  textoSobrePanel: string;
  acento: string;
  liquido: Record<EstadoLiquido, string>;
};

export const PALETAS = {
  guardadito: {
    nombre: "Guardadito",
    fondo: "#F6F1E7",
    superficie: "#FFFDF8",
    borde: "#EAE2D0",
    bordeFuerte: "#C9BFA8",
    texto: "#17231C",
    textoSecundario: "#4A5850",
    panel: "#14231B",
    panelSecundario: "#1F3328",
    textoSobrePanel: "#F6F1E7",
    acento: "#C8F169",
    liquido: { ok: "#C8F169", mod: "#F5B83D", crit: "#FF7A66" },
  },
  noche: {
    nombre: "Noche",
    fondo: "#0F1813",
    superficie: "#18241D",
    borde: "#26372D",
    bordeFuerte: "#3A4F42",
    texto: "#EEF2E6",
    textoSecundario: "#A9B6AC",
    panel: "#203428",
    panelSecundario: "#2B4536",
    textoSobrePanel: "#EEF2E6",
    acento: "#C8F169",
    liquido: { ok: "#C8F169", mod: "#F5B83D", crit: "#FF7A66" },
  },
  mar: {
    nombre: "Mar",
    fondo: "#EDF3F4",
    superficie: "#FBFDFD",
    borde: "#D6E2E5",
    bordeFuerte: "#A9BEC4",
    texto: "#0F2229",
    textoSecundario: "#46606A",
    panel: "#0E2A35",
    panelSecundario: "#1A3D4B",
    textoSobrePanel: "#EDF3F4",
    acento: "#6FE0CF",
    liquido: { ok: "#6FE0CF", mod: "#FFC857", crit: "#FF7A85" },
  },
  ciruela: {
    nombre: "Ciruela",
    fondo: "#F5F0F6",
    superficie: "#FDFBFE",
    borde: "#E5DBE9",
    bordeFuerte: "#BFAFC7",
    texto: "#24172B",
    textoSecundario: "#5C4D66",
    panel: "#2B1B36",
    panelSecundario: "#3C2A4A",
    textoSobrePanel: "#F5F0F6",
    acento: "#E3B8FF",
    liquido: { ok: "#9FE2B0", mod: "#FFC65C", crit: "#FF8A73" },
  },
} as const satisfies Record<string, Paleta>;

export type ClavePaleta = keyof typeof PALETAS;

export const PALETA_POR_DEFECTO: ClavePaleta = "guardadito";

export const CLAVES_PALETA = Object.keys(PALETAS) as ClavePaleta[];

export function esClavePaleta(valor: unknown): valor is ClavePaleta {
  return typeof valor === "string" && (CLAVES_PALETA as string[]).includes(valor);
}
