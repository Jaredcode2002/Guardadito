import {
  formatearHora,
  parsearDiaDelMes,
  partesHora,
  siguienteUmbral,
  textoDiaDelMes,
} from "./logica";

describe("siguienteUmbral", () => {
  const base = { moderacion: 30, casiCero: 10 };

  it("sube y baja de 5 en 5", () => {
    expect(siguienteUmbral(base, "moderacion", 1)).toEqual({
      moderacion: 35,
      casiCero: 10,
    });
    expect(siguienteUmbral(base, "casiCero", -1)).toEqual({
      moderacion: 30,
      casiCero: 5,
    });
  });

  it("no deja que casi cero alcance a moderación", () => {
    expect(
      siguienteUmbral({ moderacion: 15, casiCero: 10 }, "casiCero", 1),
    ).toBeNull();
    expect(
      siguienteUmbral({ moderacion: 15, casiCero: 10 }, "moderacion", -1),
    ).toBeNull();
  });

  it("no baja casi cero de 5 ni sube moderación de 100", () => {
    expect(siguienteUmbral({ moderacion: 30, casiCero: 5 }, "casiCero", -1)).toBeNull();
    expect(
      siguienteUmbral({ moderacion: 100, casiCero: 10 }, "moderacion", 1),
    ).toBeNull();
  });
});

describe("formatearHora", () => {
  it.each([
    ["21:00", "9:00 p. m."],
    ["09:05", "9:05 a. m."],
    ["00:30", "12:30 a. m."],
    ["12:00", "12:00 p. m."],
  ])("%s → %s", (hora, texto) => {
    expect(formatearHora(hora)).toBe(texto);
  });
});

describe("día del mes", () => {
  it("texto para la lista", () => {
    expect(textoDiaDelMes(10)).toBe("Día 10 de cada mes");
  });

  it("acepta 1 a 31 y rechaza lo demás", () => {
    expect(parsearDiaDelMes("1")).toBe(1);
    expect(parsearDiaDelMes(" 31 ")).toBe(31);
    expect(parsearDiaDelMes("0")).toBeNull();
    expect(parsearDiaDelMes("32")).toBeNull();
    expect(parsearDiaDelMes("1.5")).toBeNull();
    expect(parsearDiaDelMes("")).toBeNull();
  });
});

describe("partesHora", () => {
  it.each([
    ["21:00", "9 p. m.", ":00"],
    ["00:45", "12 a. m.", ":45"],
    ["12:15", "12 p. m.", ":15"],
  ])("%s → %s %s", (hora24, hora, minutos) => {
    expect(partesHora(hora24)).toEqual({ hora, minutos });
  });
});
