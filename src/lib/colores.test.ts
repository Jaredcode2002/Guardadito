import {
  CLAVES_COLOR,
  COLOR_SIN_CATEGORIA,
  esColorCategoria,
  hexDeColor,
  siguienteColor,
} from "./colores";

describe("siguienteColor", () => {
  it("toma el primer color libre en el orden fijo", () => {
    expect(siguienteColor([])).toBe("azul");
    expect(siguienteColor(["azul", "naranja"])).toBe("aqua");
    expect(siguienteColor(["naranja"])).toBe("azul");
  });

  it("con los 8 usados, vuelve al menos repetido en orden", () => {
    expect(siguienteColor([...CLAVES_COLOR])).toBe("azul");
    expect(siguienteColor([...CLAVES_COLOR, "azul"])).toBe("naranja");
  });

  it("ignora valores que no son de la paleta", () => {
    expect(siguienteColor(["morado", "azul"])).toBe("naranja");
  });
});

describe("hexDeColor y esColorCategoria", () => {
  it("traduce la clave a su hex y cae en gris si no existe", () => {
    expect(hexDeColor("azul")).toBe("#2A78D6");
    expect(hexDeColor("morado")).toBe(COLOR_SIN_CATEGORIA);
  });

  it("reconoce solo las claves de la paleta", () => {
    expect(esColorCategoria("rojo")).toBe(true);
    expect(esColorCategoria("morado")).toBe(false);
  });
});
