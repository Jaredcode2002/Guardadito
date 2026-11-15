import {
  mensajeConfirmarBorrado,
  textoRango,
  textoResumenBorrado,
  tituloConfirmarBorrado,
} from "./logica";

describe("textos de Borrar historial", () => {
  it("rango de un mes o de varios", () => {
    expect(textoRango(["2026-09"])).toBe("Septiembre 2026");
    expect(textoRango(["2025-12", "2026-01", "2026-02"])).toBe(
      "de Diciembre 2025 a Febrero 2026",
    );
  });

  it("singular y plural", () => {
    expect(textoResumenBorrado(["2026-09"], 1)).toBe(
      "Se borrarán 1 mes (Septiembre 2026) y 1 movimiento.",
    );
    expect(textoResumenBorrado(["2026-09", "2026-10"], 8)).toBe(
      "Se borrarán 2 meses (de Septiembre 2026 a Octubre 2026) y 8 movimientos.",
    );
    expect(tituloConfirmarBorrado(1)).toBe("¿Borrar 1 mes?");
    expect(tituloConfirmarBorrado(3)).toBe("¿Borrar 3 meses?");
  });

  it("la confirmación avisa que no se puede deshacer", () => {
    expect(mensajeConfirmarBorrado(["2026-09"], 4)).toMatch(/no se puede deshacer/);
  });
});
