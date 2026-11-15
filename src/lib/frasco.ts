import { UMBRALES_POR_DEFECTO, type Umbrales } from './alertas';
import { bajoUmbral, type Centavos } from './money';

export type EstadoFrasco = 'ok' | 'mod' | 'crit' | 'zero' | 'roto';

export type EntradaFrasco = {
  libre: Centavos;
  libreInicial: Centavos;
  ahorroTocadoSinReponer: boolean;
  umbrales?: Umbrales;
};

export function estadoFrasco({
  libre,
  libreInicial,
  ahorroTocadoSinReponer,
  umbrales = UMBRALES_POR_DEFECTO,
}: EntradaFrasco): EstadoFrasco {
  if (libre <= 0) return ahorroTocadoSinReponer ? 'roto' : 'zero';
  if (bajoUmbral(libre, libreInicial, umbrales.casiCero)) return 'crit';
  if (bajoUmbral(libre, libreInicial, umbrales.moderacion)) return 'mod';
  return 'ok';
}

export const FORMAS_FRASCO = ['frasco', 'caguama', 'pocion', 'elixir'] as const;

export type FormaFrasco = (typeof FORMAS_FRASCO)[number];

export const FORMA_FRASCO_POR_DEFECTO: FormaFrasco = 'frasco';

export const NOMBRES_FORMA: Record<FormaFrasco, string> = {
  frasco: 'Frasco',
  caguama: 'Caguama',
  pocion: 'Poción',
  elixir: 'Elixir',
};

export function esFormaFrasco(valor: unknown): valor is FormaFrasco {
  return (FORMAS_FRASCO as readonly unknown[]).includes(valor);
}
