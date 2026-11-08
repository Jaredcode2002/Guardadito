/**
 * Tipografías. Los nombres coinciden con como se registrarán las fuentes
 * al cargarlas (paso posterior; hoy aún no están instaladas, así que RN
 * usará la fuente del sistema mientras tanto).
 */
export const fonts = {
  /** Bricolage Grotesque: números y títulos. */
  display: 'BricolageGrotesque',
  displayBold: 'BricolageGrotesque-Bold',
  /** DM Sans: texto. */
  body: 'DMSans',
  bodyMedium: 'DMSans-Medium',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
  /** El número grande del Libre en el panel. */
  hero: 56,
} as const;
