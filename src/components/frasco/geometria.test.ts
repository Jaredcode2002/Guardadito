import { palette } from "@/theme";

import {
  caminoOla,
  colorRasgo,
  FONDO_CUERPO,
  nivelLiquido,
  nivelSegunEstado,
  tieneLiquido,
  ZONA_BOCA,
  ZONA_OJOS,
} from "./geometria";

describe("nivelLiquido", () => {
  it.each([
    [0.68, 64.24],
    [0.28, 117.04],
    [0.08, 143.44],
  ])("%p coincide con el diseño de referencia (y = %p)", (p, y) => {
    expect(nivelLiquido(p)).toBeCloseTo(y, 2);
  });

  it("lleno toca el borde de arriba y vacío el fondo", () => {
    expect(nivelLiquido(1)).toBe(22);
    expect(nivelLiquido(0)).toBe(FONDO_CUERPO);
  });

  it("se acota fuera de [0, 1]", () => {
    expect(nivelLiquido(1.5)).toBe(22);
    expect(nivelLiquido(-0.2)).toBe(FONDO_CUERPO);
  });
});

describe("nivelSegunEstado", () => {
  it("zero y roto no tienen líquido aunque el % no sea 0", () => {
    expect(tieneLiquido("zero")).toBe(false);
    expect(tieneLiquido("roto")).toBe(false);
    expect(nivelSegunEstado("roto", 0.5)).toBe(FONDO_CUERPO);
  });

  it("ok, mod y crit usan el %", () => {
    expect(nivelSegunEstado("mod", 0.28)).toBeCloseTo(117.04, 2);
  });
});

describe("caminoOla", () => {
  it("es la misma ola del diseño", () => {
    expect(caminoOla(64.2, 0)).toBe(
      "M-60 64.2 q12.5 -7 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V160 H-60 Z",
    );
  });

  it("el desfase mueve la ola sin cambiar su forma", () => {
    expect(caminoOla(100, 50)).toMatch(/^M-10 100 q12\.5 -7 25 0/);
    expect(caminoOla(100, 50)).toMatch(/H-10 Z$/);
  });

  it("con el desfase máximo sigue cubriendo todo el ancho del frasco", () => {
    const inicio = -60 + 50;
    const fin = inicio + 25 * 9;
    expect(inicio).toBeLessThanOrEqual(10);
    expect(fin).toBeGreaterThanOrEqual(110);
  });
});

describe("colorRasgo", () => {
  it("oscuro cuando el líquido cubre el rasgo", () => {
    expect(colorRasgo(nivelLiquido(0.68), ZONA_OJOS)).toBe(palette.tinta);
  });

  it("claro cuando el rasgo queda sobre el vidrio vacío", () => {
    expect(colorRasgo(nivelLiquido(0.28), ZONA_OJOS)).toBe(palette.crema);
  });

  it("al 45 % toda la cara está fuera; al 55 % la boca ya queda en el líquido", () => {
    const nivel = nivelLiquido(0.45);
    expect(colorRasgo(nivel, ZONA_OJOS)).toBe(palette.crema);
    expect(colorRasgo(nivel, ZONA_BOCA)).toBe(palette.crema);
    expect(colorRasgo(nivelLiquido(0.55), ZONA_BOCA)).toBe(palette.tinta);
  });
});
