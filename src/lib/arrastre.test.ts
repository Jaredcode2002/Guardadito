import {
  mesesBorrablesDe,
  mesesHasta,
  planDeArrastre,
  puedeBorrarHasta,
} from './arrastre';

describe('puedeBorrarHasta', () => {
  it('solo meses anteriores al actual', () => {
    expect(puedeBorrarHasta('2026-10', '2026-11')).toBe(true);
    expect(puedeBorrarHasta('2025-12', '2026-01')).toBe(true);
    expect(puedeBorrarHasta('2026-11', '2026-11')).toBe(false);
    expect(puedeBorrarHasta('2026-12', '2026-11')).toBe(false);
  });
});

describe('mesesBorrablesDe', () => {
  it('quita el mes actual y ordena del más antiguo al más nuevo', () => {
    expect(mesesBorrablesDe(['2026-11', '2026-10', '2026-08', '2026-09'], '2026-11')).toEqual([
      '2026-08',
      '2026-09',
      '2026-10',
    ]);
  });

  it('sin meses anteriores no hay nada que borrar', () => {
    expect(mesesBorrablesDe(['2026-11'], '2026-11')).toEqual([]);
  });
});

describe('mesesHasta', () => {
  it('incluye desde el más antiguo hasta el elegido', () => {
    expect(mesesHasta(['2026-08', '2026-09', '2026-10'], '2026-09')).toEqual([
      '2026-08',
      '2026-09',
    ]);
  });
});

describe('planDeArrastre', () => {
  it('va el primer día del mes que queda, aunque cambie el año', () => {
    expect(planDeArrastre('2025-12', { ingresos: 0, gastos: 0, ahorro: 0 }).fecha).toBe(
      '2026-01-01',
    );
  });

  it('un neto positivo es un ingreso', () => {
    expect(planDeArrastre('2026-10', { ingresos: 50_000, gastos: 30_000, ahorro: 0 })).toEqual({
      fecha: '2026-11-01',
      movimiento: { tipo: 'ingreso', monto: 20_000 },
      ahorro: null,
    });
  });

  it('un neto negativo es un gasto por el valor absoluto', () => {
    expect(
      planDeArrastre('2026-10', { ingresos: 10_000, gastos: 25_000, ahorro: 7_000 }),
    ).toEqual({
      fecha: '2026-11-01',
      movimiento: { tipo: 'gasto', monto: 15_000 },
      ahorro: 7_000,
    });
  });

  it('si todo se compensa no hay filas que insertar', () => {
    expect(planDeArrastre('2026-10', { ingresos: 9_000, gastos: 9_000, ahorro: 0 })).toEqual({
      fecha: '2026-11-01',
      movimiento: null,
      ahorro: null,
    });
  });
});
