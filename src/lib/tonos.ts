export type Rgb = { r: number; g: number; b: number };

const RE_HEX = /^#([0-9a-f]{6})$/i;

export function hexARgb(hex: string): Rgb {
  const m = RE_HEX.exec(hex);
  if (!m) throw new Error(`Color inválido: "${hex}".`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function canal(v: number): string {
  return Math.round(Math.min(255, Math.max(0, v)))
    .toString(16)
    .padStart(2, "0");
}

export function rgbAHex({ r, g, b }: Rgb): string {
  return `#${canal(r)}${canal(g)}${canal(b)}`.toUpperCase();
}

export function conAlfa(hex: string, alfa: number): string {
  const { r, g, b } = hexARgb(hex);
  return `rgba(${r},${g},${b},${alfa})`;
}

export function mezclar(base: string, otro: string, cantidad: number): string {
  const a = hexARgb(base);
  const b = hexARgb(otro);
  const t = Math.min(1, Math.max(0, cantidad));
  return rgbAHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

function aLineal(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function deLineal(v: number): number {
  const c = Math.min(1, Math.max(0, v));
  return 255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
}

export function luminancia(hex: string): number {
  const { r, g, b } = hexARgb(hex);
  return 0.2126 * aLineal(r) + 0.7152 * aLineal(g) + 0.0722 * aLineal(b);
}

export function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

export function esOscuro(hex: string): boolean {
  return luminancia(hex) < 0.18;
}

type Hsl = { h: number; s: number; l: number };

function aHsl({ r, g, b }: Rgb): Hsl {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function deHsl({ h, s, l }: Hsl): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function tonoLegible(
  color: string,
  fondos: readonly string[],
  minimo = 4.5,
): string {
  const hsl = aHsl(hexARgb(color));
  const s = Math.min(hsl.s, 0.7);
  const haciaClaro = fondos.every(esOscuro);
  const legible = (hex: string) => fondos.every((f) => contraste(hex, f) >= minimo);
  for (let paso = 0; paso <= 100; paso++) {
    const l = haciaClaro ? hsl.l + (paso / 100) * (1 - hsl.l) : hsl.l * (1 - paso / 100);
    const hex = rgbAHex(deHsl({ h: hsl.h, s, l }));
    if (legible(hex)) return hex;
  }
  return haciaClaro ? "#FFFFFF" : "#000000";
}

export function masLegible(
  fondos: readonly string[],
  candidatos: readonly string[],
  minimo = 4.5,
): string {
  const peor = (c: string) => Math.min(...fondos.map((f) => contraste(c, f)));
  const suficiente = candidatos.find((c) => peor(c) >= minimo);
  if (suficiente) return suficiente;
  return candidatos.reduce((mejor, c) => (peor(c) > peor(mejor) ? c : mejor));
}

type Lab = { L: number; a: number; b: number };

function rgbLinealALab([r, g, b]: readonly number[]): Lab {
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return {
    L: 116 * f(y) - 16,
    a: 500 * (f(x) - f(y)),
    b: 200 * (f(y) - f(z)),
  };
}

export type VisionColor = "normal" | "protan" | "deutan" | "tritan";

const MATRICES: Record<Exclude<VisionColor, "normal">, readonly number[][]> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

function linealVisto(hex: string, vision: VisionColor): number[] {
  const { r, g, b } = hexARgb(hex);
  const lin = [aLineal(r), aLineal(g), aLineal(b)];
  if (vision === "normal") return lin;
  return MATRICES[vision].map((fila) =>
    Math.min(1, Math.max(0, fila[0] * lin[0] + fila[1] * lin[1] + fila[2] * lin[2])),
  );
}

export function simular(hex: string, vision: VisionColor): string {
  const [r, g, b] = linealVisto(hex, vision);
  return rgbAHex({ r: deLineal(r), g: deLineal(g), b: deLineal(b) });
}

export function diferencia(a: string, b: string, vision: VisionColor = "normal"): number {
  const la = rgbLinealALab(linealVisto(a, vision));
  const lb = rgbLinealALab(linealVisto(b, vision));
  return Math.hypot(la.L - lb.L, la.a - lb.a, la.b - lb.b);
}
