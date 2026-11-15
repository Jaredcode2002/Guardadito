import {
  formatearHora,
  parsearDiaDelMes,
  partesHora,
  siguienteUmbral,
  textoDiaDelMes,
  textoConfirmarRestaurar,
  textoUltimoRespaldo,
} from "./logica";

describe("textoUltimoRespaldo", () => {
  const ahora = new Date(2026, 10, 15, 22, 0);
  const iso = (...p: [number, number, number, number, number]) =>
    new Date(...p).toISOString();

  it("sin respaldo (o con fecha dañada) lo dice", () => {
    expect(textoUltimoRespaldo(null, ahora)).toBe("Todavía no has respaldado");
    expect(textoUltimoRespaldo("nunca", ahora)).toBe("Todavía no has respaldado");
  });

  it("dice hoy, ayer o la fecha", () => {
    expect(textoUltimoRespaldo(iso(2026, 10, 15, 20, 5), ahora)).toBe(
      "Último respaldo: hoy a las 8:05 p. m.",
    );
    expect(textoUltimoRespaldo(iso(2026, 10, 14, 9, 30), ahora)).toBe(
      "Último respaldo: ayer a las 9:30 a. m.",
    );
    expect(textoUltimoRespaldo(iso(2026, 9, 3, 0, 15), ahora)).toBe(
      "Último respaldo: el 3 de octubre a las 12:15 a. m.",
    );
    expect(textoUltimoRespaldo(iso(2025, 11, 31, 12, 0), ahora)).toBe(
      "Último respaldo: el 31 de diciembre de 2025 a las 12:00 p. m.",
    );
  });
});

describe("textoConfirmarRestaurar", () => {
  const ahora = new Date(2026, 10, 15, 22, 0);

  it("avisa que reemplaza todo y dice de cuándo es el respaldo", () => {
    const texto = textoConfirmarRestaurar(
      new Date(2026, 10, 14, 9, 30).toISOString(),
      ahora,
    );
    expect(texto).toContain("Esto reemplaza todos los datos de este teléfono");
    expect(texto).toContain("respaldo creado ayer a las 9:30 a. m.");
  });

  it("con fecha dañada no inventa una", () => {
    expect(textoConfirmarRestaurar("nunca", ahora)).toContain(
      "por los del respaldo. No se puede deshacer",
    );
  });
});

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
