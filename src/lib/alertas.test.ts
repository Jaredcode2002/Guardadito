import { evaluarAlertas, nivelesActivos, sonUmbralesValidos } from './alertas';

const INICIAL = 1_000_000;

describe('nivelesActivos', () => {
  it('ninguno con el Libre arriba de 30 %', () => {
    expect(nivelesActivos(500_000, INICIAL)).toEqual([]);
  });

  it('Libre en 0 activa los tres niveles', () => {
    expect(nivelesActivos(0, INICIAL)).toEqual(['moderacion', 'casiCero', 'cero']);
  });
});

describe('evaluarAlertas', () => {
  it('al cruzar 30 % dispara "moderacion"', () => {
    const r = evaluarAlertas([], 250_000, INICIAL);
    expect(r.mostrar).toBe('moderacion');
    expect(r.disparadas).toEqual(['moderacion']);
  });

  it('no se repite si el Libre sigue bajo el mismo umbral', () => {
    const r = evaluarAlertas(['moderacion'], 200_000, INICIAL);
    expect(r.mostrar).toBeNull();
    expect(r.disparadas).toEqual(['moderacion']);
  });

  it('un gasto que cruza varios umbrales muestra solo el más grave', () => {
    const r = evaluarAlertas([], 0, INICIAL);
    expect(r.mostrar).toBe('cero');
    expect(r.disparadas).toEqual(['moderacion', 'casiCero', 'cero']);
  });

  it('un ingreso que sube el Libre arriba de 30 % re-arma todas', () => {
    const r = evaluarAlertas(['moderacion', 'casiCero', 'cero'], 400_000, INICIAL);
    expect(r.mostrar).toBeNull();
    expect(r.disparadas).toEqual([]);
  });

  it('tras re-armarse, la alerta vuelve a dispararse al cruzar otra vez', () => {
    const rearmada = evaluarAlertas(['moderacion'], 400_000, INICIAL);
    const r = evaluarAlertas(rearmada.disparadas, 250_000, INICIAL);
    expect(r.mostrar).toBe('moderacion');
  });

  it('un ingreso parcial re-arma solo los umbrales que superó', () => {
    const r = evaluarAlertas(['moderacion', 'casiCero', 'cero'], 200_000, INICIAL);
    expect(r.mostrar).toBeNull();
    expect(r.disparadas).toEqual(['moderacion']);

    const despues = evaluarAlertas(r.disparadas, 50_000, INICIAL);
    expect(despues.mostrar).toBe('casiCero');
  });
});

describe("sonUmbralesValidos", () => {
  it("acepta los de por defecto y otros ordenados", () => {
    expect(sonUmbralesValidos({ moderacion: 30, casiCero: 10 })).toBe(true);
    expect(sonUmbralesValidos({ moderacion: 50, casiCero: 20 })).toBe(true);
  });

  it("rechaza casiCero ≥ moderacion, fuera de rango o decimales", () => {
    expect(sonUmbralesValidos({ moderacion: 10, casiCero: 10 })).toBe(false);
    expect(sonUmbralesValidos({ moderacion: 30, casiCero: 0 })).toBe(false);
    expect(sonUmbralesValidos({ moderacion: 120, casiCero: 10 })).toBe(false);
    expect(sonUmbralesValidos({ moderacion: 30, casiCero: 7.5 })).toBe(false);
  });
});
