import {
  COLOR_SIN_CATEGORIA,
  COLORES_CATEGORIA,
} from "@/lib/colores";
import { contraste, diferencia, type VisionColor } from "@/lib/tonos";

import {
  CLAVES_PALETA,
  esClavePaleta,
  PALETA_POR_DEFECTO,
  PALETAS,
} from "./paletas";
import { colorDeEstado, crearTema } from "./tema";

const TEXTO = 4.5;
const GRAFICO = 3;
const VISIONES: VisionColor[] = ["protan", "deutan", "tritan"];

describe("catálogo de paletas", () => {
  it("Guardadito es la de por defecto y conserva los colores de siempre", () => {
    expect(PALETA_POR_DEFECTO).toBe("guardadito");
    expect(PALETAS.guardadito).toMatchObject({
      fondo: "#F6F1E7",
      texto: "#17231C",
      panel: "#14231B",
      panelSecundario: "#1F3328",
      acento: "#C8F169",
      liquido: { ok: "#C8F169", mod: "#F5B83D", crit: "#FF7A66" },
    });
  });

  it("reconoce solo las claves del catálogo", () => {
    expect(esClavePaleta("noche")).toBe(true);
    expect(esClavePaleta("arcoiris")).toBe(false);
    expect(esClavePaleta(undefined)).toBe(false);
  });

  it("los nombres no se repiten", () => {
    const nombres = CLAVES_PALETA.map((c) => PALETAS[c].nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });
});

describe.each(CLAVES_PALETA)("paleta %s", (clave) => {
  const t = crearTema(clave);

  it("el texto se lee sobre el fondo y las tarjetas", () => {
    for (const fondo of [t.fondo, t.superficie]) {
      expect(contraste(t.texto, fondo)).toBeGreaterThanOrEqual(TEXTO);
      expect(contraste(t.textoSecundario, fondo)).toBeGreaterThanOrEqual(TEXTO);
      expect(contraste(t.peligroTexto, fondo)).toBeGreaterThanOrEqual(TEXTO);
      expect(contraste(t.ingresoTexto, fondo)).toBeGreaterThanOrEqual(TEXTO);
    }
  });

  it("el texto se lee sobre el panel y el panel secundario", () => {
    for (const panel of [t.panel, t.panelSecundario]) {
      expect(contraste(t.textoSobrePanel, panel)).toBeGreaterThanOrEqual(TEXTO);
      expect(contraste(t.acento, panel)).toBeGreaterThanOrEqual(TEXTO);
    }
  });

  it("los líquidos resaltan sobre el panel y llevan texto legible encima", () => {
    for (const estado of ["ok", "mod", "crit"] as const) {
      expect(contraste(t.liquido[estado], t.panel)).toBeGreaterThanOrEqual(TEXTO);
      expect(contraste(t.sobreLiquido, t.liquido[estado])).toBeGreaterThanOrEqual(TEXTO);
      expect(contraste(t.tono[estado].texto, t.tono[estado].suave)).toBeGreaterThanOrEqual(
        TEXTO,
      );
    }
    expect(contraste(t.sobreAcento, t.acento)).toBeGreaterThanOrEqual(TEXTO);
  });

  it("los 3 estados del líquido se distinguen entre sí, también con daltonismo", () => {
    const { ok, mod, crit } = t.liquido;
    const pares: [string, string][] = [
      [ok, mod],
      [mod, crit],
      [ok, crit],
    ];
    for (const [a, b] of pares) {
      expect(diferencia(a, b)).toBeGreaterThanOrEqual(20);
      for (const vision of VISIONES) {
        expect(diferencia(a, b, vision)).toBeGreaterThanOrEqual(10);
      }
    }
  });

  it("los colores de categoría se ven sobre el fondo y las tarjetas", () => {
    for (const fondo of [t.fondo, t.superficie]) {
      for (const c of COLORES_CATEGORIA) {
        expect(contraste(c.hex, fondo)).toBeGreaterThanOrEqual(1.8);
      }
      expect(contraste(COLOR_SIN_CATEGORIA, fondo)).toBeGreaterThanOrEqual(GRAFICO);
      expect(contraste(t.texto, fondo)).toBeGreaterThanOrEqual(GRAFICO);
    }
  });

  it("colorDeEstado usa el coral del líquido para cero y roto", () => {
    expect(colorDeEstado(t, "ok")).toBe(t.liquido.ok);
    expect(colorDeEstado(t, "mod")).toBe(t.liquido.mod);
    expect(colorDeEstado(t, "zero")).toBe(t.liquido.crit);
    expect(colorDeEstado(t, "roto")).toBe(t.liquido.crit);
  });
});
