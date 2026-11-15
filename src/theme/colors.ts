export const palette = {
  crema: '#F6F1E7',
  tinta: '#17231C',
  panel: '#14231B',
  panelSecundario: '#1F3328',
  lima: '#C8F169',
  ambar: '#F5B83D',
  coral: '#FF7A66',
} as const;

export const GRIS = '#4A5850';
export const PAPEL = '#FFFDF8';
export const BORDE = '#EAE2D0';
export const TEXTO_SUAVE = 'rgba(246,241,231,0.74)';

export type Acento = { fuerte: string; suave: string; oscuro: string };

export const ACENTO_TIPO = {
  gasto: { fuerte: palette.coral, suave: '#FFE1DB', oscuro: '#8A2A1B' },
  ingreso: { fuerte: palette.lima, suave: '#E4F3C4', oscuro: '#2C5A12' },
} as const satisfies Record<string, Acento>;

export const colors = {
  fondo: palette.crema,
  texto: palette.tinta,
  panel: palette.panel,
  panelSecundario: palette.panelSecundario,
  textoSobrePanel: palette.crema,
  acento: palette.lima,
  advertencia: palette.ambar,
  peligro: palette.coral,
} as const;
