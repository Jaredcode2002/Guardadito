/** Escala de espaciado en múltiplos de 4 dp. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

/** Ancho a partir del cual usamos el diseño de tablet (dos columnas). */
export const TABLET_BREAKPOINT = 600;

/** Duraciones de animación (CLAUDE.md: 150–300 ms). */
export const durations = {
  fast: 150,
  normal: 220,
  slow: 300,
} as const;
