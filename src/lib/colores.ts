export const COLORES_CATEGORIA = [
  { clave: "azul", nombre: "Azul", hex: "#2A78D6" },
  { clave: "naranja", nombre: "Naranja", hex: "#EB6834" },
  { clave: "aqua", nombre: "Aqua", hex: "#1BAF7A" },
  { clave: "amarillo", nombre: "Amarillo", hex: "#EDA100" },
  { clave: "rosa", nombre: "Rosa", hex: "#E87BA4" },
  { clave: "verde", nombre: "Verde", hex: "#008300" },
  { clave: "violeta", nombre: "Violeta", hex: "#6250D6" },
  { clave: "rojo", nombre: "Rojo", hex: "#E34948" },
] as const;

export type ColorCategoria = (typeof COLORES_CATEGORIA)[number]["clave"];

export const CLAVES_COLOR: readonly ColorCategoria[] = COLORES_CATEGORIA.map(
  (c) => c.clave,
);

export const COLOR_PENDIENTES = "#14231B";
export const COLOR_SIN_CATEGORIA = "#8C8573";

export function esColorCategoria(valor: string): valor is ColorCategoria {
  return (CLAVES_COLOR as readonly string[]).includes(valor);
}

export function hexDeColor(clave: string): string {
  return COLORES_CATEGORIA.find((c) => c.clave === clave)?.hex ?? COLOR_SIN_CATEGORIA;
}

export function siguienteColor(usados: readonly string[]): ColorCategoria {
  const veces = (clave: ColorCategoria) => usados.filter((u) => u === clave).length;
  const minimo = Math.min(...CLAVES_COLOR.map(veces));
  return CLAVES_COLOR.find((c) => veces(c) === minimo) ?? CLAVES_COLOR[0];
}
