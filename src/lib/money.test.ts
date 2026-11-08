import {
  ahorroQueToca,
  bajoUmbral,
  calcularDinero,
  calcularLibre,
  calcularLibreInicial,
  esMontoValido,
  planificarGasto,
  porcentajeRestante,
  sumar,
} from './money';

const MUCHO_AHORRO = 10_000_000;

describe('sumar', () => {
  it('una lista vacía suma 0', () => {
    expect(sumar([])).toBe(0);
  });

  it('suma centavos sin errores de punto flotante', () => {
    expect(sumar([10, 20])).toBe(30);
  });
});

describe('Dinero y Libre', () => {
  it('Dinero = ingresos − gastos', () => {
    expect(calcularDinero(2_000_000, 450_000)).toBe(1_550_000);
  });

  it('Libre = Dinero − pendientes sin pagar', () => {
    expect(calcularLibre(1_550_000, 550_000)).toBe(1_000_000);
  });

  it('Libre puede ser negativo si los pendientes superan el Dinero', () => {
    expect(calcularLibre(100_000, 300_000)).toBe(-200_000);
  });
});

describe('calcularLibreInicial', () => {
  it('suma el Libre al empezar el mes y cada ingreso extra', () => {
    expect(calcularLibreInicial(1_000_000, [50_000, 25_000])).toBe(1_075_000);
  });

  it('sin ingresos extra es el Libre al empezar el mes', () => {
    expect(calcularLibreInicial(1_000_000, [])).toBe(1_000_000);
  });
});

describe('porcentajeRestante', () => {
  it('devuelve la fracción del Libre inicial', () => {
    expect(porcentajeRestante(250_000, 1_000_000)).toBe(0.25);
  });

  it('Libre en 0 → 0 %', () => {
    expect(porcentajeRestante(0, 1_000_000)).toBe(0);
  });

  it('Libre negativo se acota a 0 %', () => {
    expect(porcentajeRestante(-50_000, 1_000_000)).toBe(0);
  });

  it('nunca pasa de 100 %', () => {
    expect(porcentajeRestante(1_200_000, 1_000_000)).toBe(1);
  });

  it('Libre inicial en 0 no divide entre cero', () => {
    expect(porcentajeRestante(0, 0)).toBe(0);
  });
});

describe('bajoUmbral', () => {
  it('justo en el umbral NO está por debajo', () => {
    expect(bajoUmbral(300_000, 1_000_000, 30)).toBe(false);
  });

  it('un centavo menos ya está por debajo', () => {
    expect(bajoUmbral(299_999, 1_000_000, 30)).toBe(true);
  });
});

describe('ahorroQueToca', () => {
  it('gasto menor al Libre → no toca ahorro', () => {
    expect(ahorroQueToca(100_000, 500_000, MUCHO_AHORRO)).toBe(0);
  });

  it('gasto exacto al Libre → no toca ahorro', () => {
    expect(ahorroQueToca(500_000, 500_000, MUCHO_AHORRO)).toBe(0);
  });

  it('gasto mayor al Libre → toca solo la diferencia', () => {
    expect(ahorroQueToca(800_000, 500_000, MUCHO_AHORRO)).toBe(300_000);
  });

  it('Libre en 0 → el gasto entero sale del ahorro', () => {
    expect(ahorroQueToca(80_000, 0, MUCHO_AHORRO)).toBe(80_000);
  });

  it('Libre negativo cuenta como 0', () => {
    expect(ahorroQueToca(80_000, -200_000, MUCHO_AHORRO)).toBe(80_000);
  });

  it('nunca toca más ahorro del que hay', () => {
    expect(ahorroQueToca(800_000, 500_000, 100_000)).toBe(100_000);
  });

  it('sin ahorro no toca nada', () => {
    expect(ahorroQueToca(800_000, 500_000, 0)).toBe(0);
    expect(ahorroQueToca(800_000, 500_000, -5_000)).toBe(0);
  });
});

describe('planificarGasto', () => {
  it('gasto exacto al Libre → todo sale del Libre', () => {
    expect(planificarGasto(500_000, 500_000, MUCHO_AHORRO)).toEqual({
      gasto: 500_000,
      desdeLibre: 500_000,
      desdeAhorro: 0,
      enNegativo: 0,
    });
  });

  it('gasto mayor al Libre con ahorro suficiente → el ahorro cubre la diferencia', () => {
    expect(planificarGasto(800_000, 500_000, MUCHO_AHORRO)).toEqual({
      gasto: 800_000,
      desdeLibre: 500_000,
      desdeAhorro: 300_000,
      enNegativo: 0,
    });
  });

  it('si el ahorro no alcanza, se vacía y el resto queda en negativo', () => {
    expect(planificarGasto(800_000, 500_000, 100_000)).toEqual({
      gasto: 800_000,
      desdeLibre: 500_000,
      desdeAhorro: 100_000,
      enNegativo: 200_000,
    });
  });

  it('con Libre negativo y sin ahorro, todo el gasto queda en negativo', () => {
    expect(planificarGasto(80_000, -20_000, 0)).toEqual({
      gasto: 80_000,
      desdeLibre: 0,
      desdeAhorro: 0,
      enNegativo: 80_000,
    });
  });

  it('las tres partes siempre suman el gasto y el Libre queda en −enNegativo', () => {
    const libre = 500_000;
    const p = planificarGasto(800_000, libre, 100_000);
    expect(p.desdeLibre + p.desdeAhorro + p.enNegativo).toBe(p.gasto);
    expect(libre - p.gasto + p.desdeAhorro).toBe(-p.enNegativo);
  });
});

describe('esMontoValido', () => {
  it('acepta enteros positivos de centavos', () => {
    expect(esMontoValido(1)).toBe(true);
    expect(esMontoValido(2_000_000)).toBe(true);
  });

  it('rechaza 0, negativos, decimales y NaN', () => {
    expect(esMontoValido(0)).toBe(false);
    expect(esMontoValido(-100)).toBe(false);
    expect(esMontoValido(10.5)).toBe(false);
    expect(esMontoValido(Number.NaN)).toBe(false);
  });
});
