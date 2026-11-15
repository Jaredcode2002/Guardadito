import { FORMAS_FRASCO } from "@/lib/frasco";
import { CLAVES_PALETA, PALETAS } from "@/theme/paletas";
import { crearTema } from "@/theme/tema";

import {
  alturaOjos,
  burbujaSumergida,
  cajaCara,
  caminoOla,
  CAMBIO_ELIXIR,
  coloresFrasco,
  colorRasgo,
  DIBUJOS,
  dibujoLleno,
  dibujoPara,
  GEOMETRIAS,
  GROSOR_ESPUMA,
  nivelLiquido,
  nivelSegunEstado,
  porcentajeParaNivel,
  tieneLiquido,
  transformacionCara,
  VIEWBOX,
  ZONA_BOCA,
  ZONA_OJOS,
  zonasCara,
  type Caja,
} from "./geometria";

const dentro = (a: Caja, b: Caja) =>
  a.x1 >= b.x1 && a.x2 <= b.x2 && a.y1 >= b.y1 && a.y2 <= b.y2;

const FONDO_FRASCO = GEOMETRIAS.frasco.llenado.abajo;

describe("nivelLiquido", () => {
  it.each([
    [0.68, 64.24],
    [0.28, 117.04],
    [0.08, 143.44],
  ])("%p coincide con el diseño de referencia (y = %p)", (p, y) => {
    expect(nivelLiquido(p, "frasco")).toBeCloseTo(y, 2);
  });

  it("lleno toca el borde de arriba y vacío el fondo", () => {
    expect(nivelLiquido(1, "frasco")).toBe(22);
    expect(nivelLiquido(0, "frasco")).toBe(FONDO_FRASCO);
  });

  it("se acota fuera de [0, 1]", () => {
    expect(nivelLiquido(1.5, "frasco")).toBe(22);
    expect(nivelLiquido(-0.2, "frasco")).toBe(FONDO_FRASCO);
  });

  it.each(DIBUJOS)("en %s va del fondo a lo más alto de su tramo", (dibujo) => {
    const { tramo, llenado } = GEOMETRIAS[dibujo];
    expect(nivelLiquido(tramo.desde, dibujo)).toBe(llenado.abajo);
    expect(nivelLiquido(tramo.hasta, dibujo)).toBe(llenado.arriba);
    expect(
      nivelLiquido((tramo.desde + tramo.hasta) / 2, dibujo),
    ).toBeCloseTo((llenado.arriba + llenado.abajo) / 2, 10);
  });
});

describe("nivelSegunEstado", () => {
  it("zero y roto no tienen líquido aunque el % no sea 0", () => {
    expect(tieneLiquido("zero")).toBe(false);
    expect(tieneLiquido("roto")).toBe(false);
    expect(nivelSegunEstado("roto", 0.5, "frasco")).toBe(FONDO_FRASCO);
  });

  it("ok, mod y crit usan el %", () => {
    expect(nivelSegunEstado("mod", 0.28, "frasco")).toBeCloseTo(117.04, 2);
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

  it("con el desfase máximo sigue cubriendo todo el ancho de cualquier dibujo", () => {
    const inicio = -60 + 50;
    const fin = inicio + 25 * 9;
    expect(inicio).toBeLessThanOrEqual(0);
    expect(fin).toBeGreaterThanOrEqual(VIEWBOX.ancho);
  });
});

describe("dibujoPara", () => {
  it("frasco, caguama y poción no cambian de dibujo", () => {
    for (const p of [1, 0.4, 0]) {
      expect(dibujoPara("frasco", p, "ok")).toBe("frasco");
      expect(dibujoPara("caguama", p, "crit")).toBe("caguama");
      expect(dibujoPara("pocion", p, "mod")).toBe("pocion");
    }
    expect(dibujoPara("pocion", 0, "roto")).toBe("pocion");
  });

  it("el elixir grande pasa al chico por debajo del 50 %", () => {
    expect(dibujoPara("elixir", 0.68, "ok")).toBe("elixir");
    expect(dibujoPara("elixir", CAMBIO_ELIXIR, "ok")).toBe("elixir");
    expect(dibujoPara("elixir", 0.49, "ok")).toBe("elixirChico");
    expect(dibujoPara("elixir", 0.28, "mod")).toBe("elixirChico");
  });

  it("sin líquido el elixir es el chico (vacío o quebrado)", () => {
    expect(dibujoPara("elixir", 0, "zero")).toBe("elixirChico");
    expect(dibujoPara("elixir", 0, "roto")).toBe("elixirChico");
  });

  it("al cambiar, el grande queda vacío y el chico lleno", () => {
    expect(nivelLiquido(CAMBIO_ELIXIR, "elixir")).toBe(
      GEOMETRIAS.elixir.llenado.abajo,
    );
    expect(nivelLiquido(CAMBIO_ELIXIR, "elixirChico")).toBe(
      GEOMETRIAS.elixirChico.llenado.arriba,
    );
  });

  it("los tramos de los dos elixires cubren de 0 a 1 sin huecos", () => {
    expect(GEOMETRIAS.elixirChico.tramo).toEqual({ desde: 0, hasta: CAMBIO_ELIXIR });
    expect(GEOMETRIAS.elixir.tramo).toEqual({ desde: CAMBIO_ELIXIR, hasta: 1 });
  });

  it("dibujoLleno da el dibujo de cada forma al 100 %", () => {
    expect(dibujoLleno("elixir")).toBe("elixir");
    expect(dibujoLleno("pocion")).toBe("pocion");
    expect(dibujoLleno("caguama")).toBe("caguama");
  });
});

describe("dibujos", () => {
  it("el frasco conserva la cara del diseño original", () => {
    expect(transformacionCara("frasco")).toBe("translate(0 0) scale(1)");
    expect(zonasCara("frasco")).toEqual({ ojos: 66, boca: 92, gota: 58 });
    expect(alturaOjos("frasco")).toBe(80);
  });

  describe.each(DIBUJOS)("%s", (dibujo) => {
    const g = GEOMETRIAS[dibujo];
    const lienzo: Caja = { x1: 0, y1: 0, x2: VIEWBOX.ancho, y2: VIEWBOX.alto };

    it("el llenado y la panza caben en el dibujo", () => {
      expect(g.llenado.arriba).toBeGreaterThanOrEqual(0);
      expect(g.llenado.abajo).toBeLessThanOrEqual(VIEWBOX.alto);
      expect(g.llenado.arriba).toBeLessThan(g.llenado.abajo);
      expect(dentro(g.panza, lienzo)).toBe(true);
    });

    it("la cara completa (con la gota de sudor) cabe en la panza", () => {
      expect(dentro(cajaCara(dibujo), g.panza)).toBe(true);
    });

    it("los rasgos quedan dentro del llenado, para que cambien de color", () => {
      const { gota, ojos, boca } = zonasCara(dibujo);
      expect(gota).toBeLessThan(ojos);
      expect(ojos).toBeLessThan(boca);
      for (const y of [gota, ojos, boca, alturaOjos(dibujo)]) {
        expect(y).toBeGreaterThan(g.llenado.arriba);
        expect(y).toBeLessThan(g.llenado.abajo);
      }
    });

    it("las monedas escapan: fuera de la panza pero dentro del dibujo", () => {
      expect(g.monedas.length).toBeGreaterThan(0);
      for (const { cx, cy, r } of g.monedas) {
        const moneda = { x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r };
        expect(dentro(moneda, lienzo)).toBe(true);
        expect(dentro(moneda, g.panza)).toBe(false);
      }
    });

    it("tiene contorno, tapa chueca y grieta", () => {
      expect(g.contorno).toMatch(/^M.* Z$/);
      expect(g.tapa).toMatch(/^M.* Z$/);
      expect(g.tapaRota).toMatch(/rotate\(-?\d+ \d+ \d+\)/);
      expect(g.grieta).toMatch(/^M/);
    });
  });

  it("la poción y el elixir llevan destellos", () => {
    expect(GEOMETRIAS.pocion.destellos).not.toBe("");
    expect(GEOMETRIAS.elixir.destellos).not.toBe("");
    expect(GEOMETRIAS.elixirChico.destellos).not.toBe("");
    expect(GEOMETRIAS.frasco.destellos).toBe("");
    expect(GEOMETRIAS.caguama.destellos).toBe("");
  });

  it("solo el elixir grande lleva broche de alambre", () => {
    for (const d of DIBUJOS) {
      expect(GEOMETRIAS[d].alambre !== "").toBe(d === "elixir");
    }
  });

  it("solo la caguama lleva espuma, burbujas y vidrio ámbar", () => {
    for (const d of DIBUJOS) {
      const esCaguama = d === "caguama";
      expect(GEOMETRIAS[d].espuma).toBe(esCaguama);
      expect(GEOMETRIAS[d].vidrioAmbar).toBe(esCaguama);
      expect(GEOMETRIAS[d].burbujas.length > 0).toBe(esCaguama);
    }
  });
});

describe("burbujaSumergida", () => {
  const burbuja = { cx: 40, cy: 120, r: 2 };

  it("se ve si queda debajo de la espuma", () => {
    expect(burbujaSumergida(burbuja, 100)).toBe(true);
  });

  it("se esconde si queda en la espuma o sobre el líquido", () => {
    expect(burbujaSumergida(burbuja, 118 - GROSOR_ESPUMA)).toBe(false);
    expect(burbujaSumergida(burbuja, 130)).toBe(false);
  });

  it("con la caguama al 8 % casi no quedan burbujas", () => {
    const nivel = nivelLiquido(0.08, "caguama");
    const visibles = GEOMETRIAS.caguama.burbujas.filter((b) =>
      burbujaSumergida(b, nivel),
    );
    expect(visibles.length).toBeLessThanOrEqual(1);
  });
});

describe("colorRasgo", () => {
  const tema = crearTema("guardadito");
  const { texto: tinta, fondo: crema } = PALETAS.guardadito;
  const panel = coloresFrasco(tema, "panel");
  const nivel = (p: number) => nivelLiquido(p, "frasco");

  it("oscuro cuando el líquido cubre el rasgo", () => {
    expect(colorRasgo(nivel(0.68), ZONA_OJOS, panel)).toBe(tinta);
  });

  it("claro cuando el rasgo queda sobre el vidrio vacío", () => {
    expect(colorRasgo(nivel(0.28), ZONA_OJOS, panel)).toBe(crema);
  });

  it("sobre el fondo claro los rasgos siempre son oscuros", () => {
    const fondo = coloresFrasco(tema, "fondo");
    expect(colorRasgo(nivel(0.28), ZONA_OJOS, fondo)).toBe(tinta);
    expect(colorRasgo(nivel(0.9), ZONA_OJOS, fondo)).toBe(tinta);
  });

  it("en el toast los rasgos se aclaran sobre el líquido oscuro", () => {
    const toast = coloresFrasco(tema, "toast");
    expect(colorRasgo(nivel(0.9), ZONA_OJOS, toast)).toBe(crema);
  });

  it("al 45 % toda la cara está fuera; al 55 % la boca ya queda en el líquido", () => {
    expect(colorRasgo(nivel(0.45), ZONA_OJOS, panel)).toBe(crema);
    expect(colorRasgo(nivel(0.45), ZONA_BOCA, panel)).toBe(crema);
    expect(colorRasgo(nivel(0.55), ZONA_BOCA, panel)).toBe(tinta);
  });

  it("en la caguama los ojos cambian de color cuando el líquido los alcanza", () => {
    const { ojos } = zonasCara("caguama");
    const p = porcentajeParaNivel(ojos, "caguama");
    expect(colorRasgo(nivelLiquido(p + 0.02, "caguama"), ojos, panel)).toBe(tinta);
    expect(colorRasgo(nivelLiquido(p - 0.02, "caguama"), ojos, panel)).toBe(crema);
  });
});

describe("coloresFrasco", () => {
  it.each(CLAVES_PALETA)("en %s el panel usa el líquido de la paleta", (clave) => {
    expect(coloresFrasco(crearTema(clave), "panel").liquido).toEqual(
      PALETAS[clave].liquido,
    );
  });

  it.each(CLAVES_PALETA)("en %s la espuma se distingue del líquido", (clave) => {
    const c = coloresFrasco(crearTema(clave), "panel");
    for (const e of ["ok", "mod", "crit"] as const) {
      expect(c.espuma[e]).not.toBe(c.liquido[e]);
    }
  });
});

describe("porcentajeParaNivel", () => {
  it.each(DIBUJOS)("en %s es el inverso de nivelLiquido", (dibujo) => {
    const { desde, hasta } = GEOMETRIAS[dibujo].tramo;
    for (const t of [0, 0.08, 0.28, 0.5, 0.68, 1]) {
      const p = desde + t * (hasta - desde);
      expect(porcentajeParaNivel(nivelLiquido(p, dibujo), dibujo)).toBeCloseTo(p, 10);
    }
  });

  it("a la altura de los ojos el frasco se llena un 56 %", () => {
    const p = porcentajeParaNivel(alturaOjos("frasco"), "frasco");
    expect(nivelLiquido(p, "frasco")).toBeCloseTo(80, 10);
    expect(Math.round(p * 100)).toBe(56);
  });

  it.each(FORMAS_FRASCO)(
    "en %s la bienvenida llena hasta los ojos sin cambiar de dibujo",
    (forma) => {
      const dibujo = dibujoLleno(forma);
      const p = porcentajeParaNivel(alturaOjos(dibujo), dibujo);
      const { desde } = GEOMETRIAS[dibujo].tramo;
      expect(p).toBeGreaterThan(desde);
      expect(p).toBeLessThan(1);
      expect(dibujoPara(forma, p, "ok")).toBe(dibujo);
      expect(dibujoPara(forma, desde, "ok")).toBe(dibujo);
    },
  );

  it("se limita al tramo fuera del cuerpo", () => {
    expect(porcentajeParaNivel(0, "frasco")).toBe(1);
    expect(porcentajeParaNivel(200, "frasco")).toBe(0);
    expect(porcentajeParaNivel(200, "pocion")).toBe(0);
    expect(porcentajeParaNivel(200, "elixir")).toBe(CAMBIO_ELIXIR);
  });
});
