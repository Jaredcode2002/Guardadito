import { bajoUmbral, type Centavos } from './money';

export type Umbrales = { moderacion: number; casiCero: number };

export const UMBRALES_POR_DEFECTO: Umbrales = { moderacion: 30, casiCero: 10 };

export const NIVELES = ['moderacion', 'casiCero', 'cero'] as const;
export type NivelAlerta = (typeof NIVELES)[number];

export function nivelesActivos(
  libre: Centavos,
  libreInicial: Centavos,
  umbrales: Umbrales = UMBRALES_POR_DEFECTO,
): NivelAlerta[] {
  const activos: NivelAlerta[] = [];
  if (bajoUmbral(libre, libreInicial, umbrales.moderacion)) activos.push('moderacion');
  if (bajoUmbral(libre, libreInicial, umbrales.casiCero)) activos.push('casiCero');
  if (libre <= 0) activos.push('cero');
  return activos;
}

export type ResultadoAlertas = {
  disparadas: NivelAlerta[];
  mostrar: NivelAlerta | null;
};

export function evaluarAlertas(
  disparadasAntes: readonly NivelAlerta[],
  libre: Centavos,
  libreInicial: Centavos,
  umbrales: Umbrales = UMBRALES_POR_DEFECTO,
): ResultadoAlertas {
  const activos = nivelesActivos(libre, libreInicial, umbrales);
  const nuevas = activos.filter((n) => !disparadasAntes.includes(n));
  return {
    disparadas: activos,
    mostrar: nuevas.length > 0 ? nuevas[nuevas.length - 1] : null,
  };
}

export function sonUmbralesValidos({ moderacion, casiCero }: Umbrales): boolean {
  return (
    Number.isInteger(moderacion) &&
    Number.isInteger(casiCero) &&
    casiCero > 0 &&
    moderacion <= 100 &&
    casiCero < moderacion
  );
}
