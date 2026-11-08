import {
  abreviaturaMes,
  diaDe,
  fechaLarga,
  fechaLocal,
  fechaVence,
  mesAnterior,
  mesCorto,
  mesDe,
  mesesPorAbrir,
  mesSiguiente,
  nombreMes,
  ultimaFechaDelMes,
  ultimoDiaDelMes,
} from './fechas';

describe('fechaLocal y mesDe', () => {
  it('usa la fecha local, con ceros a la izquierda', () => {
    expect(fechaLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('mesDe recorta el día', () => {
    expect(mesDe('2026-11-07')).toBe('2026-11');
  });
});

describe('ultimoDiaDelMes', () => {
  it.each([
    ['2026-01', 31],
    ['2026-04', 30],
    ['2026-02', 28],
    ['2028-02', 29],
    ['2026-12', 31],
  ])('%s tiene %i días', (mes, dias) => {
    expect(ultimoDiaDelMes(mes)).toBe(dias);
  });

  it('rechaza un mes mal escrito', () => {
    expect(() => ultimoDiaDelMes('2026-13')).toThrow('Mes inválido');
    expect(() => ultimoDiaDelMes('nov-2026')).toThrow('Mes inválido');
  });
});

describe('fechaVence', () => {
  it('día normal', () => {
    expect(fechaVence('2026-11', 5)).toBe('2026-11-05');
  });

  it('un pendiente del día 31 vence el último día de febrero', () => {
    expect(fechaVence('2026-02', 31)).toBe('2026-02-28');
    expect(fechaVence('2028-02', 31)).toBe('2028-02-29');
  });

  it('ultimaFechaDelMes', () => {
    expect(ultimaFechaDelMes('2026-11')).toBe('2026-11-30');
  });
});

describe('mesSiguiente y mesAnterior', () => {
  it('cruzan el cambio de año', () => {
    expect(mesSiguiente('2026-12')).toBe('2027-01');
    expect(mesAnterior('2027-01')).toBe('2026-12');
  });

  it('meses normales', () => {
    expect(mesSiguiente('2026-09')).toBe('2026-10');
    expect(mesAnterior('2026-10')).toBe('2026-09');
  });
});

describe('mesesPorAbrir', () => {
  it('primera vez que se abre la app: solo el mes actual', () => {
    expect(mesesPorAbrir(null, '2026-11')).toEqual(['2026-11']);
  });

  it('mes ya abierto: nada que hacer', () => {
    expect(mesesPorAbrir('2026-11', '2026-11')).toEqual([]);
  });

  it('la app no se abrió en dos meses: abre cada uno en orden', () => {
    expect(mesesPorAbrir('2026-11', '2027-02')).toEqual(['2026-12', '2027-01', '2027-02']);
  });

  it('si el reloj del teléfono retrocede, no abre nada', () => {
    expect(mesesPorAbrir('2026-11', '2026-10')).toEqual([]);
  });
});

describe("nombreMes, abreviaturaMes y diaDe", () => {
  it("nombre completo con año", () => {
    expect(nombreMes("2026-11")).toBe("Noviembre 2026");
    expect(nombreMes("2027-01")).toBe("Enero 2027");
  });

  it("abreviatura de tres letras en mayúsculas para la ficha", () => {
    expect(abreviaturaMes("2026-11-10")).toBe("NOV");
    expect(abreviaturaMes("2026-09-01")).toBe("SEP");
  });

  it("día del mes sin cero a la izquierda", () => {
    expect(diaDe("2026-11-05")).toBe(5);
    expect(diaDe("2026-11-30")).toBe(30);
  });
});

describe("fechaLarga y mesCorto", () => {
  it("fecha con día y mes en minúscula", () => {
    expect(fechaLarga("2026-10-28")).toBe("28 de octubre");
    expect(fechaLarga("2026-11-05")).toBe("5 de noviembre");
  });

  it("mes corto sin año si es del año actual", () => {
    expect(mesCorto("2026-10", "2026-11")).toBe("Oct");
    expect(mesCorto("2025-12", "2026-01")).toBe("Dic 25");
  });
});
