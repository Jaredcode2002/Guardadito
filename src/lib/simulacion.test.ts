import { UMBRALES_POR_DEFECTO } from "./alertas";
import { simularMovimiento, type SituacionActual } from "./simulacion";

const BASE: SituacionActual = {
  libre: 250_000,
  libreInicial: 250_000,
  saldoAhorro: 600_000,
  ahorroTocadoSinReponer: false,
  umbrales: UMBRALES_POR_DEFECTO,
};

describe("simularMovimiento", () => {
  it("un gasto normal baja el Libre y deja igual el Libre inicial", () => {
    expect(simularMovimiento(BASE, "gasto", 125_000)).toMatchObject({
      libre: 125_000,
      libreInicial: 250_000,
      porcentaje: 0.5,
      estado: "ok",
      plan: { desdeAhorro: 0, faltante: 0 },
    });
  });

  it("un gasto que cruza el 30 % cambia el frasco a mod", () => {
    expect(simularMovimiento(BASE, "gasto", 200_000).estado).toBe("mod");
  });

  it("un gasto mayor al Libre toca ahorro, deja el Libre en 0 y rompe el frasco", () => {
    expect(simularMovimiento(BASE, "gasto", 300_000)).toMatchObject({
      libre: 0,
      estado: "roto",
      plan: { desdeAhorro: 50_000, faltante: 0 },
    });
  });

  it("sin ahorro suficiente, el gasto no cabe y nada cambia", () => {
    const pocoAhorro = { ...BASE, saldoAhorro: 20_000 };
    expect(simularMovimiento(pocoAhorro, "gasto", 300_000)).toMatchObject({
      libre: 250_000,
      porcentaje: 1,
      estado: "ok",
      plan: { desdeAhorro: 20_000, faltante: 30_000 },
    });
  });

  it("un gasto que no cabe no marca el ahorro como tocado", () => {
    const enCero = { ...BASE, libre: 0, saldoAhorro: 0 };
    expect(simularMovimiento(enCero, "gasto", 10_000)).toMatchObject({
      libre: 0,
      estado: "zero",
      plan: { faltante: 10_000 },
    });
  });

  it("un ingreso sube el Libre y el Libre inicial, y repara el frasco", () => {
    const rota = { ...BASE, libre: 0, ahorroTocadoSinReponer: true };
    expect(simularMovimiento(rota, "ingreso", 100_000)).toMatchObject({
      libre: 100_000,
      libreInicial: 350_000,
      estado: "mod",
      plan: null,
    });
  });
});
