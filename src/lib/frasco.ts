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
