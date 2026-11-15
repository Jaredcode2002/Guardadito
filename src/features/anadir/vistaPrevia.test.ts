import { UMBRALES_POR_DEFECTO } from "@/lib/alertas";
import { simularMovimiento } from "@/lib/simulacion";

import {
  descripcionMovimiento,
  estadoVistaPrevia,
  lineasVistaPrevia,
} from "./vistaPrevia";

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

  it("gasto que cabe usando ahorro: Libre en 0 y cuánto toca", () => {
    expect(
      lineasVistaPrevia(simularMovimiento(BASE, "gasto", 270_000)),
    ).toEqual(["Libre después: L 0", "Tocará L 200 de tu ahorro"]);
  });

  it("gasto que no cabe ni con ahorro: dice cuánto falta", () => {
    expect(
      lineasVistaPrevia(simularMovimiento(BASE, "gasto", 300_000)),
    ).toEqual([
      "No te alcanza: te faltan L 300",
      "Ni usando tu ahorro cubres este gasto",
    ]);
  });

  it("gasto que no cabe y sin ahorro", () => {
    const sinAhorro = { ...BASE, saldoAhorro: 0 };
    expect(
      lineasVistaPrevia(simularMovimiento(sinAhorro, "gasto", 260_000)),
    ).toEqual(["No te alcanza: te faltan L 100", "No tienes ahorro que lo cubra"]);
  });

  it("ingreso: sube el Libre", () => {
    expect(
      lineasVistaPrevia(simularMovimiento(BASE, "ingreso", 50_000)),
    ).toEqual(["Libre después: L 3,000 · te queda el 100%"]);
  });
});

describe("estadoVistaPrevia", () => {
  it("usa el estado simulado si el gasto cabe", () => {
    expect(estadoVistaPrevia(simularMovimiento(BASE, "gasto", 200_000))).toBe(
      "mod",
    );
  });

  it("muestra el frasco roto si el gasto no cabe", () => {
    expect(estadoVistaPrevia(simularMovimiento(BASE, "gasto", 300_000))).toBe(
      "roto",
    );
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
