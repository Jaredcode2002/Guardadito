/**
 * Cálculos de dinero. Todo en centavos enteros (L 1.00 = 100) para evitar
 * errores de punto flotante (0.1 + 0.2 !== 0.3). Funciones puras: mismas
 * entradas => misma salida, sin leer base de datos ni fecha actual.
 */

/** Monto en centavos de lempira. Siempre entero. */
export type Centavos = number;

export function sumar(montos: readonly Centavos[]): Centavos {
  return montos.reduce((total, m) => total + m, 0);
}

/** Dinero = ingresos − gastos. */
export function calcularDinero(totalIngresos: Centavos, totalGastos: Centavos): Centavos {
  return totalIngresos - totalGastos;
}

/**
 * Libre = Dinero − pendientes sin pagar.
 * Puede ser negativo (los pendientes superan lo que hay); quien lo muestre
 * decide si lo enseña como 0.
 */
export function calcularLibre(dinero: Centavos, pendientesSinPagar: Centavos): Centavos {
  return dinero - pendientesSinPagar;
}

/**
 * Libre inicial = Libre al empezar el mes + cada ingreso extra registrado.
 * Ojo: los ingresos con origen "ahorro" NO deben pasarse aquí (no son
 * ganancia, solo tapan un hueco); eso lo filtra quien llama.
 */
export function calcularLibreInicial(
  libreAlEmpezarMes: Centavos,
  ingresosExtra: readonly Centavos[],
): Centavos {
  return libreAlEmpezarMes + sumar(ingresosExtra);
}

/**
 * % restante = Libre ÷ Libre inicial, como fracción entre 0 y 1
 * (0.25 = 25 %). Se acota a [0, 1] porque alimenta el nivel del frasco.
 */
export function porcentajeRestante(libre: Centavos, libreInicial: Centavos): number {
  if (libreInicial <= 0) return libre > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, libre / libreInicial));
}

/**
 * ¿Libre está por debajo de `umbralPct` % del Libre inicial?
 * Se compara con enteros (libre·100 < pct·inicial) en vez de dividir, así
 * un caso exacto como 3 000 / 10 000 contra 30 % no depende de redondeos.
 */
export function bajoUmbral(libre: Centavos, libreInicial: Centavos, umbralPct: number): boolean {
  return libre * 100 < umbralPct * libreInicial;
}

/** Cuánto ahorro toca un gasto: X = gasto − max(Libre, 0), nunca negativo. */
export function ahorroQueToca(gasto: Centavos, libre: Centavos): Centavos {
  return Math.max(0, gasto - Math.max(libre, 0));
}

/**
 * Qué hay que registrar al confirmar un gasto (regla de CLAUDE.md):
 * el gasto completo y, si toca ahorro, un ingreso de origen "ahorro" por X
 * y un ahorro_movimiento de −X. Así el Libre queda exactamente en 0.
 */
export type PlanDeGasto =
  | { tocaAhorro: false; gasto: Centavos }
  | {
      tocaAhorro: true;
      gasto: Centavos;
      ingresoDesdeAhorro: Centavos;
      movimientoAhorro: Centavos;
    };

export function planificarGasto(gasto: Centavos, libre: Centavos): PlanDeGasto {
  const x = ahorroQueToca(gasto, libre);
  if (x === 0) return { tocaAhorro: false, gasto };
  return { tocaAhorro: true, gasto, ingresoDesdeAhorro: x, movimientoAhorro: -x };
}
