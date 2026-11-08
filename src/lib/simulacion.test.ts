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
      plan: { desdeAhorro: 0, enNegativo: 0 },
    });
  });

  it("un gasto que cruza el 30 % cambia el frasco a mod", () => {
    expect(simularMovimiento(BASE, "gasto", 200_000).estado).toBe("mod");
  });

  it("un gasto mayor al Libre toca ahorro, deja el Libre en 0 y rompe el frasco", () => {
    expect(simularMovimiento(BASE, "gasto", 300_000)).toMatchObject({
      libre: 0,
      estado: "roto",
      plan: { desdeAhorro: 50_000, enNegativo: 0 },
    });
  });

  it("sin ahorro suficiente, el resto queda en negativo", () => {
    const sinAhorro = { ...BASE, saldoAhorro: 20_000 };
    expect(simularMovimiento(sinAhorro, "gasto", 300_000)).toMatchObject({
      libre: -30_000,
      estado: "roto",
      plan: { desdeAhorro: 20_000, enNegativo: 30_000 },
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
