import {
  conAlfa,
  contraste,
  diferencia,
  esOscuro,
  hexARgb,
  masLegible,
  mezclar,
  rgbAHex,
  simular,
  tonoLegible,
} from "./tonos";

describe("hexARgb y rgbAHex", () => {
  it("van y vuelven sin perder el color", () => {
    expect(hexARgb("#C8F169")).toEqual({ r: 200, g: 241, b: 105 });
    expect(rgbAHex({ r: 200, g: 241, b: 105 })).toBe("#C8F169");
  });

  it("rechaza lo que no es #RRGGBB", () => {
    expect(() => hexARgb("lima")).toThrow("Color inválido");
    expect(() => hexARgb("#FFF")).toThrow();
  });
});

describe("conAlfa y mezclar", () => {
  it("arma un rgba con la transparencia pedida", () => {
    expect(conAlfa("#F6F1E7", 0.74)).toBe("rgba(246,241,231,0.74)");
  });

  it("mezcla en proporción y se limita entre 0 y 1", () => {
    expect(mezclar("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    expect(mezclar("#000000", "#FFFFFF", 0)).toBe("#000000");
    expect(mezclar("#000000", "#FFFFFF", 2)).toBe("#FFFFFF");
  });
});

describe("contraste", () => {
  it("negro sobre blanco es 21:1 y es simétrico", () => {
    expect(contraste("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contraste("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
  });

  it("un color contra sí mismo es 1:1", () => {
    expect(contraste("#C8F169", "#C8F169")).toBe(1);
  });

  it("distingue fondos oscuros de claros", () => {
    expect(esOscuro("#14231B")).toBe(true);
    expect(esOscuro("#F6F1E7")).toBe(false);
  });
});

describe("tonoLegible", () => {
  it("oscurece un color claro hasta leerse sobre fondos claros", () => {
    const tono = tonoLegible("#FF7A66", ["#FFFDF8"]);
    expect(contraste(tono, "#FFFDF8")).toBeGreaterThanOrEqual(4.5);
    expect(esOscuro(tono)).toBe(true);
  });

  it("aclara el color cuando los fondos son oscuros", () => {
    const tono = tonoLegible("#2A78D6", ["#14231B"]);
    expect(contraste(tono, "#14231B")).toBeGreaterThanOrEqual(4.5);
    expect(esOscuro(tono)).toBe(false);
  });
});

describe("masLegible", () => {
  it("toma el primer candidato que se lee bien sobre todos los fondos", () => {
    expect(masLegible(["#C8F169"], ["#F6F1E7", "#17231C"])).toBe("#17231C");
  });

  it("si ninguno llega al mínimo, devuelve el que más contrasta", () => {
    expect(masLegible(["#808080"], ["#999999", "#000000"], 21)).toBe("#000000");
  });
});

describe("diferencia y simular", () => {
  it("es 0 entre colores iguales y grande entre opuestos", () => {
    expect(diferencia("#FF7A66", "#FF7A66")).toBe(0);
    expect(diferencia("#000000", "#FFFFFF")).toBeCloseTo(100, 0);
  });

  it("con deuteranopia el rojo y el verde se acercan", () => {
    const normal = diferencia("#E34948", "#008300");
    const deutan = diferencia("#E34948", "#008300", "deutan");
    expect(deutan).toBeLessThan(normal / 2);
  });

  it("los grises no cambian con ningún tipo de visión", () => {
    for (const vision of ["protan", "deutan", "tritan"] as const) {
      expect(diferencia(simular("#808080", vision), "#808080")).toBeLessThan(1);
    }
  });
});
