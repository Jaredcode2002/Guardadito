import {
  chipDelPanel,
  resumenPendientes,
  textosPanel,
  type DatosPanel,
} from "./textos";

const datos = (d: Partial<DatosPanel>): DatosPanel => ({
  estado: "ok",
  libre: 170_000,
  libreInicial: 250_000,
  porcentaje: 0.68,
  saldoAhorro: 600_000,
  ...d,
});

describe("textosPanel", () => {
  it("con Libre: porcentaje y de dónde empezó, como en el diseño", () => {
    expect(textosPanel(datos({}))).toEqual({
      detalle: "Te queda el 68% de tu libre · empezó en L 2,500",
      aviso: null,
    });
  });

  it("en cero con ahorro avisa que lo que gaste sale del ahorro", () => {
    expect(
      textosPanel(datos({ estado: "zero", libre: 0, porcentaje: 0 })),
    ).toEqual({
      detalle: "Ya gastaste todo tu libre",
      aviso: "Lo que gastes sale de tu ahorro",
    });
  });

  it("en cero sin ahorro avisa que quedará en negativo", () => {
    expect(
      textosPanel(
        datos({ estado: "zero", libre: 0, porcentaje: 0, saldoAhorro: 0 }),
      ).aviso,
    ).toBe("Sin ahorro: lo que gastes quedará en negativo");
  });

  it("roto en negativo dice cuánto falta y cuándo se repone", () => {
    expect(
      textosPanel(
        datos({ estado: "roto", libre: -70_000, porcentaje: 0, saldoAhorro: 0 }),
      ),
    ).toEqual({
      detalle: "Estás L 700 por debajo de cero",
      aviso: "Se repone con tu próximo ingreso",
    });
  });

  it("roto muestra cómo quedó el ahorro", () => {
    expect(
      textosPanel(
        datos({ estado: "roto", libre: 0, porcentaje: 0, saldoAhorro: 575_000 }),
      ),
    ).toEqual({
      detalle: "Tu ahorro cubrió lo que faltaba",
      aviso: "Tu ahorro quedó en L 5,750",
    });
  });
});

describe("resumenPendientes", () => {
  it("cuenta y suma los pendientes", () => {
    expect(resumenPendientes([450_000, 60_000, 120_000, 200_000])).toBe(
      "4 por pagar · L 8,300",
    );
  });
});

describe("chipDelPanel", () => {
  it("usa el chip del estado", () => {
    expect(chipDelPanel({ estado: "roto", libre: 0 }).texto).toBe("Ahorro tocado");
    expect(chipDelPanel({ estado: "ok", libre: 170_000 }).texto).toBe("En orden");
  });

  it("en negativo dice En negativo aunque no se haya tocado ahorro", () => {
    expect(chipDelPanel({ estado: "roto", libre: -1 }).texto).toBe("En negativo");
    expect(chipDelPanel({ estado: "zero", libre: -1 }).texto).toBe("En cero");
  });
});
