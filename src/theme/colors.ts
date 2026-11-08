/**
 * Paleta de Guardadito (ver CLAUDE.md).
 * `palette` son los colores crudos; `colors` les da un nombre según su uso,
 * así las pantallas dicen "fondo" o "texto" y no un hex suelto.
 */
export const palette = {
  crema: '#F6F1E7',
  tinta: '#17231C',
  panel: '#14231B',
  panelSecundario: '#1F3328',
  lima: '#C8F169',
  ambar: '#F5B83D',
  coral: '#FF7A66',
} as const;

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
