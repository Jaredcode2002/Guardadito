import {
  BOM,
  escaparCampo,
  etiquetaOrigen,
  generarCsv,
  montoCsv,
  type FilaCsv,
} from './csv';

const fila = (extra: Partial<FilaCsv> = {}): FilaCsv => ({
  fecha: '2026-11-05',
  tipo: 'gasto',
  origen: 'normal',
  categoria: 'Comida',
  descripcion: 'Baleadas',
  monto: 4_550,
  ...extra,
});

describe('montoCsv', () => {
  it('convierte centavos a lempiras con 2 decimales y sin separador de miles', () => {
    expect(montoCsv(4_550)).toBe('45.50');
    expect(montoCsv(5)).toBe('0.05');
    expect(montoCsv(0)).toBe('0.00');
    expect(montoCsv(123_456_789)).toBe('1234567.89');
    expect(montoCsv(-1_000)).toBe('-10.00');
  });
});

describe('escaparCampo', () => {
  it('deja igual el texto simple', () => {
    expect(escaparCampo('Pulpería')).toBe('Pulpería');
  });

  it('pone entre comillas lo que tiene comas, comillas o saltos de línea', () => {
    expect(escaparCampo('pan, leche')).toBe('"pan, leche"');
    expect(escaparCampo('el "bueno"')).toBe('"el ""bueno"""');
    expect(escaparCampo('línea 1\nlínea 2')).toBe('"línea 1\nlínea 2"');
    expect(escaparCampo('a\r\nb')).toBe('"a\r\nb"');
  });
});

describe('etiquetaOrigen', () => {
  it('nombra cada origen; ahorro depende del tipo', () => {
    expect(etiquetaOrigen('gasto', 'normal')).toBe('Normal');
    expect(etiquetaOrigen('gasto', 'pendiente')).toBe('Gasto fijo');
    expect(etiquetaOrigen('gasto', 'sobrante')).toBe('Sobrante al ahorro');
    expect(etiquetaOrigen('ingreso', 'arrastre')).toBe('Arrastre');
    expect(etiquetaOrigen('ingreso', 'ahorro')).toBe('Desde el ahorro');
    expect(etiquetaOrigen('gasto', 'ahorro')).toBe('Al ahorro');
  });
});

describe('generarCsv', () => {
  it('empieza con BOM, usa CRLF y trae el encabezado aunque no haya filas', () => {
    expect(generarCsv([])).toBe(
      `${BOM}Mes,Fecha,Tipo,Origen,Categoría,Descripción,Monto (L)\r\n`,
    );
  });

  it('una fila por movimiento, con el mes sacado de la fecha', () => {
    const csv = generarCsv([
      fila(),
      fila({
        fecha: '2026-10-31',
        tipo: 'ingreso',
        origen: 'ahorro',
        categoria: null,
        descripcion: '',
        monto: 100_000,
      }),
    ]);
    expect(csv.slice(BOM.length).split('\r\n')).toEqual([
      'Mes,Fecha,Tipo,Origen,Categoría,Descripción,Monto (L)',
      '2026-11,2026-11-05,Gasto,Normal,Comida,Baleadas,45.50',
      '2026-10,2026-10-31,Ingreso,Desde el ahorro,,,1000.00',
      '',
    ]);
  });

  it('escapa la categoría y la descripción', () => {
    const csv = generarCsv([
      fila({ categoria: 'Casa, luz', descripcion: 'dijo "ya"\nmañana' }),
    ]);
    expect(csv).toContain(
      '2026-11,2026-11-05,Gasto,Normal,"Casa, luz","dijo ""ya""\nmañana",45.50\r\n',
    );
  });
});
