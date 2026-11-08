import { LARGO_MAXIMO_NOMBRE, normalizarNombre } from "./nombres";

describe("normalizarNombre", () => {
  it("quita espacios de los bordes y junta los repetidos", () => {
    expect(normalizarNombre("  Comida   de la calle ")).toBe(
      "Comida de la calle",
    );
  });

  it("rechaza vacío o solo espacios", () => {
    expect(normalizarNombre("")).toBeNull();
    expect(normalizarNombre("   ")).toBeNull();
  });

  it("acepta hasta el largo máximo y rechaza uno más", () => {
    expect(normalizarNombre("a".repeat(LARGO_MAXIMO_NOMBRE))).not.toBeNull();
    expect(normalizarNombre("a".repeat(LARGO_MAXIMO_NOMBRE + 1))).toBeNull();
  });
});
