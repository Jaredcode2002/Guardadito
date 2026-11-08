import { bajoUmbral, type Centavos } from './money';

/** Umbrales editables, en % enteros. */
export type Umbrales = { moderacion: number; casiCero: number };

export const UMBRALES_POR_DEFECTO: Umbrales = { moderacion: 30, casiCero: 10 };

/** De menos a más grave. */
export const NIVELES = ['moderacion', 'casiCero', 'cero'] as const;
export type NivelAlerta = (typeof NIVELES)[number];

/** ¿Qué niveles se cumplen ahora mismo? */
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
  /** Niveles ya disparados; esto es lo que se guarda para la próxima vez. */
  disparadas: NivelAlerta[];
  /** La alerta a mostrar ahora (la más grave recién cruzada) o null. */
  mostrar: NivelAlerta | null;
};

/**
 * Cada alerta se dispara UNA vez al cruzar su umbral. Si el Libre vuelve a
 * subir por encima (p. ej. llega un ingreso), se quita de `disparadas`
 * (se "re-arma") y podrá dispararse otra vez. Si un gasto cruza varios
 * umbrales a la vez, se muestra solo la más grave para no apilar toasts.
 */
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
