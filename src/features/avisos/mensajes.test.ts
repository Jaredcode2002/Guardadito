import { avisoDeGasto, type SituacionParaAviso } from "./mensajes";

const SIN_NADA = { ahorroUsado: 0, enNegativo: 0, alerta: null };

const situacion = (s: Partial<SituacionParaAviso>): SituacionParaAviso => ({
  libre: 70_000,
  porcentaje: 0.28,
  estado: "mod",
  saldoAhorro: 600_000,
  ...s,
});

describe("avisoDeGasto", () => {
  it("gasto normal sin alerta: aviso oscuro corto", () => {
    expect(avisoDeGasto({ monto: 45_000, ...SIN_NADA }, situacion({}))).toEqual({
      tono: "oscuro",
      texto: "Gasto de L 450 registrado",
    });
  });

  it("moderación: ámbar con el texto del diseño", () => {
    const a = avisoDeGasto(
      { monto: 45_000, ...SIN_NADA, alerta: "moderacion" },
      situacion({}),
    );
    expect(a).toMatchObject({
      tono: "ambar",
      titulo: "Ve más despacio",
      texto: "Ya gastaste el 72% de tu libre del mes. Te quedan L 700.",
      frasco: { estado: "mod", porcentaje: 0.28 },
    });
  });

  it("casi en cero: coral", () => {
    const a = avisoDeGasto(
      { monto: 45_000, ...SIN_NADA, alerta: "casiCero" },
      situacion({ libre: 20_000, porcentaje: 0.08, estado: "crit" }),
    );
    expect(a).toMatchObject({
      tono: "coral",
      texto: "Te quedan L 200 de libre (8%). Piénsalo dos veces antes de gastar.",
    });
  });

  it("en cero sin ahorro no promete que saldrá del ahorro", () => {
    const a = avisoDeGasto(
      { monto: 45_000, ...SIN_NADA, alerta: "cero" },
      situacion({ libre: 0, porcentaje: 0, estado: "zero", saldoAhorro: 0 }),
    );
    expect(a.texto).toBe("Ya no te queda libre este mes.");
  });

  it("tocar el ahorro tiene prioridad sobre la alerta de cero", () => {
    const a = avisoDeGasto(
      { monto: 45_000, ahorroUsado: 25_000, enNegativo: 0, alerta: "cero" },
      situacion({ libre: 0, porcentaje: 0, estado: "roto", saldoAhorro: 575_000 }),
    );
    expect(a).toMatchObject({
      tono: "coral",
      titulo: "Tocaste tu ahorro",
      texto:
        "Se registró el gasto de L 450 y L 250 salieron de tu ahorro. Tu ahorro quedó en L 5,750.",
    });
  });

  it("si el ahorro no alcanzó, dice cuánto faltó", () => {
    const a = avisoDeGasto(
      { monto: 45_000, ahorroUsado: 10_000, enNegativo: 5_000, alerta: null },
      situacion({ libre: -5_000, porcentaje: 0, estado: "roto", saldoAhorro: 0 }),
    );
    expect(a.texto).toContain("Tu ahorro quedó en L 0 y te faltaron L 50.");
  });

  it("negativo sin ahorro", () => {
    const a = avisoDeGasto(
      { monto: 45_000, ahorroUsado: 0, enNegativo: 15_000, alerta: null },
      situacion({ libre: -15_000, porcentaje: 0, estado: "roto", saldoAhorro: 0 }),
    );
    expect(a).toMatchObject({
      titulo: "Quedaste en negativo",
      texto: "Te faltaron L 150. Se repondrá con tu próximo ingreso.",
    });
  });
});
