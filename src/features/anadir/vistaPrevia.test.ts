import { UMBRALES_POR_DEFECTO } from "@/lib/alertas";
import { simularMovimiento } from "@/lib/simulacion";

import { descripcionMovimiento, lineasVistaPrevia } from "./vistaPrevia";

const BASE = {
  libre: 250_000,
  libreInicial: 250_000,
  saldoAhorro: 20_000,
  ahorroTocadoSinReponer: false,
  umbrales: UMBRALES_POR_DEFECTO,
};

describe("lineasVistaPrevia", () => {
  it("gasto normal: Libre y % que quedan, como en el diseño", () => {
    expect(
      lineasVistaPrevia(simularMovimiento(BASE, "gasto", 125_000)),
    ).toEqual(["Libre después: L 1,250 · te queda el 50%"]);
  });

  it("gasto que toca ahorro y deja negativo: tres líneas", () => {
    expect(
      lineasVistaPrevia(simularMovimiento(BASE, "gasto", 300_000)),
    ).toEqual([
      "Libre después: −L 300",
      "Tocará L 200 de tu ahorro",
      "Quedarás L 300 en negativo",
    ]);
  });

  it("ingreso: sube el Libre", () => {
    expect(
      lineasVistaPrevia(simularMovimiento(BASE, "ingreso", 50_000)),
    ).toEqual(["Libre después: L 3,000 · te queda el 100%"]);
  });
});

describe("descripcionMovimiento", () => {
  it("la nota gana sobre la categoría", () => {
    expect(descripcionMovimiento("  tacos  ", "Ocio")).toBe("tacos");
  });

  it("sin nota usa la categoría, y sin nada queda vacía", () => {
    expect(descripcionMovimiento("", "Ocio")).toBe("Ocio");
    expect(descripcionMovimiento(" ", null)).toBe("");
  });
});
