export const LARGO_MAXIMO_NOMBRE = 40;

export function normalizarNombre(texto: string): string | null {
  const limpio = texto.trim().replace(/\s+/g, " ");
  if (limpio.length === 0 || limpio.length > LARGO_MAXIMO_NOMBRE) return null;
  return limpio;
}
