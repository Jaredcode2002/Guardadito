import {
  ahorroQueToca,
  bajoUmbral,
  calcularDinero,
  calcularLibre,
  calcularLibreInicial,
  planificarGasto,
  porcentajeRestante,
  sumar,
} from './money';

describe('sumar', () => {
  it('una lista vacía suma 0', () => {
    expect(sumar([])).toBe(0);
  });

  it('suma centavos sin errores de punto flotante', () => {
    // En lempiras con decimales, 0.1 + 0.2 daría 0.30000000000000004.
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
  it('justo en el umbral NO está por debajo (es "<", no "≤")', () => {
    expect(bajoUmbral(300_000, 1_000_000, 30)).toBe(false);
  });

  it('un centavo menos ya está por debajo', () => {
    expect(bajoUmbral(299_999, 1_000_000, 30)).toBe(true);
  });
});

describe('ahorroQueToca: X = gasto − max(Libre, 0)', () => {
  it('gasto menor al Libre → no toca ahorro', () => {
    expect(ahorroQueToca(100_000, 500_000)).toBe(0);
  });

  it('gasto exacto al Libre → no toca ahorro', () => {
    expect(ahorroQueToca(500_000, 500_000)).toBe(0);
  });

  it('gasto mayor al Libre → toca solo la diferencia', () => {
    expect(ahorroQueToca(800_000, 500_000)).toBe(300_000);
  });

  it('Libre en 0 → el gasto entero sale del ahorro', () => {
    expect(ahorroQueToca(80_000, 0)).toBe(80_000);
  });

  it('Libre negativo cuenta como 0 (no cobra la deuda al ahorro)', () => {
    expect(ahorroQueToca(80_000, -200_000)).toBe(80_000);
  });
});

describe('planificarGasto', () => {
  it('gasto exacto al Libre → solo el gasto', () => {
    expect(planificarGasto(500_000, 500_000)).toEqual({ tocaAhorro: false, gasto: 500_000 });
  });

  it('gasto mayor al Libre → ingreso desde ahorro por X y movimiento de −X', () => {
    expect(planificarGasto(800_000, 500_000)).toEqual({
      tocaAhorro: true,
      gasto: 800_000,
      ingresoDesdeAhorro: 300_000,
      movimientoAhorro: -300_000,
    });
  });

  it('después de aplicar el plan, el Libre queda exactamente en 0', () => {
    const libre = 500_000;
    const plan = planificarGasto(800_000, libre);
    if (!plan.tocaAhorro) throw new Error('debía tocar ahorro');
    expect(libre - plan.gasto + plan.ingresoDesdeAhorro).toBe(0);
  });
});
