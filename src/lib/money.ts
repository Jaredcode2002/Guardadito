export type Centavos = number;

export function sumar(montos: readonly Centavos[]): Centavos {
  return montos.reduce((total, m) => total + m, 0);
}

export function calcularDinero(totalIngresos: Centavos, totalGastos: Centavos): Centavos {
  return totalIngresos - totalGastos;
}

export function calcularLibre(dinero: Centavos, pendientesSinPagar: Centavos): Centavos {
  return dinero - pendientesSinPagar;
}

export function calcularLibreInicial(
  libreAlEmpezarMes: Centavos,
  ingresosExtra: readonly Centavos[],
): Centavos {
  return libreAlEmpezarMes + sumar(ingresosExtra);
}

export function porcentajeRestante(libre: Centavos, libreInicial: Centavos): number {
  if (libreInicial <= 0) return libre > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, libre / libreInicial));
}

export function bajoUmbral(libre: Centavos, libreInicial: Centavos, umbralPct: number): boolean {
  return libre * 100 < umbralPct * libreInicial;
}

export function ahorroQueToca(
  gasto: Centavos,
  libre: Centavos,
  saldoAhorro: Centavos,
): Centavos {
  const faltante = Math.max(0, gasto - Math.max(libre, 0));
  return Math.min(faltante, Math.max(saldoAhorro, 0));
}

export type PlanDeGasto = {
  gasto: Centavos;
  desdeLibre: Centavos;
  desdeAhorro: Centavos;
  enNegativo: Centavos;
};

export function planificarGasto(
  gasto: Centavos,
  libre: Centavos,
  saldoAhorro: Centavos,
): PlanDeGasto {
  const desdeLibre = Math.min(gasto, Math.max(libre, 0));
  const desdeAhorro = ahorroQueToca(gasto, libre, saldoAhorro);
  return {
    gasto,
    desdeLibre,
    desdeAhorro,
    enNegativo: gasto - desdeLibre - desdeAhorro,
  };
}

export function esMontoValido(monto: number): boolean {
  return Number.isSafeInteger(monto) && monto > 0;
}
