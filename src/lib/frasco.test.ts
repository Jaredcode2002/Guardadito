import { esFormaFrasco, estadoFrasco } from './frasco';

const INICIAL = 1_000_000;

function estado(libre: number, ahorroTocadoSinReponer = false) {
  return estadoFrasco({ libre, libreInicial: INICIAL, ahorroTocadoSinReponer });
}

describe('estadoFrasco', () => {
  it('ok con 30 % o más', () => {
    expect(estado(INICIAL)).toBe('ok');
    expect(estado(300_000)).toBe('ok');
  });

  it('mod por debajo de 30 %', () => {
    expect(estado(299_999)).toBe('mod');
    expect(estado(100_000)).toBe('mod');
  });

  it('crit por debajo de 10 %', () => {
    expect(estado(99_999)).toBe('crit');
    expect(estado(1)).toBe('crit');
  });

  it('zero con Libre en 0', () => {
    expect(estado(0)).toBe('zero');
  });

  it('zero con Libre negativo si no se tocó el ahorro', () => {
    expect(estado(-50_000)).toBe('zero');
    expect(estado(-1)).toBe('zero');
  });

  it('zero si el mes empieza en negativo por los pendientes, sin gastar nada', () => {
    expect(
      estadoFrasco({ libre: -100_000, libreInicial: -100_000, ahorroTocadoSinReponer: false }),
    ).toBe('zero');
  });

  it('zero si un pendiente agregado a mitad de mes deja el Libre bajo el inicial', () => {
    expect(
      estadoFrasco({ libre: -150_000, libreInicial: -100_000, ahorroTocadoSinReponer: false }),
    ).toBe('zero');
  });

  it('roto con Libre negativo si además se tocó el ahorro', () => {
    expect(estado(-50_000, true)).toBe('roto');
  });

  it('deja de estar roto cuando un ingreso saca el Libre del negativo', () => {
    expect(estado(500_000, true)).toBe('ok');
  });

  it('roto si se usó ahorro y el Libre sigue en 0', () => {
    expect(estado(0, true)).toBe('roto');
  });

  it('deja de estar roto cuando un ingreso repone el Libre', () => {
    expect(estado(200_000, true)).toBe('mod');
  });

  it('respeta umbrales editados', () => {
    expect(
      estadoFrasco({
        libre: 400_000,
        libreInicial: INICIAL,
        ahorroTocadoSinReponer: false,
        umbrales: { moderacion: 50, casiCero: 20 },
      }),
    ).toBe('mod');
  });
});

describe('esFormaFrasco', () => {
  it('acepta las tres formas y rechaza lo demás', () => {
    expect(esFormaFrasco('frasco')).toBe(true);
    expect(esFormaFrasco('caguama')).toBe(true);
    expect(esFormaFrasco('pocion')).toBe(true);
    expect(esFormaFrasco('elixir')).toBe(true);
    expect(esFormaFrasco('poción')).toBe(false);
    expect(esFormaFrasco(undefined)).toBe(false);
  });
});
