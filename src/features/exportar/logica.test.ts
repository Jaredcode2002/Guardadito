import type { Movimiento } from "@/db";

import {
  esCancelacion,
  filasCsv,
  nombreArchivoCsv,
  rangoExportar,
  textoResumenExportar,
} from "./logica";

const MESES = ["2026-08", "2026-09", "2026-10", "2026-11"];
const ELEGIDO = { desde: "2026-09", hasta: "2026-10" };

describe("rangoExportar", () => {
  it("mes actual", () => {
    expect(rangoExportar("mes", MESES, "2026-11", ELEGIDO)).toEqual({
      desde: "2026-11",
      hasta: "2026-11",
    });
  });

  it("todo va del mes más viejo al actual", () => {
    expect(rangoExportar("todo", MESES, "2026-11", ELEGIDO)).toEqual({
      desde: "2026-08",
      hasta: "2026-11",
    });
    expect(rangoExportar("todo", [], "2026-11", ELEGIDO)).toEqual({
      desde: "2026-11",
      hasta: "2026-11",
    });
  });

  it("un rango al revés se ordena", () => {
    expect(rangoExportar("rango", MESES, "2026-11", ELEGIDO)).toEqual(ELEGIDO);
    expect(
      rangoExportar("rango", MESES, "2026-11", {
        desde: "2026-10",
        hasta: "2026-08",
      }),
    ).toEqual({ desde: "2026-08", hasta: "2026-10" });
  });
});

describe("nombreArchivoCsv", () => {
  it("guardadito-AAAA-MM_AAAA-MM.csv", () => {
    expect(nombreArchivoCsv(ELEGIDO)).toBe("guardadito-2026-09_2026-10.csv");
    expect(nombreArchivoCsv({ desde: "2026-11", hasta: "2026-11" })).toBe(
      "guardadito-2026-11_2026-11.csv",
    );
  });
});

describe("textoResumenExportar", () => {
  it("cuenta movimientos y nombra el rango", () => {
    expect(textoResumenExportar(ELEGIDO, 12)).toBe(
      "De Septiembre 2026 a Octubre 2026: 12 movimientos.",
    );
    expect(
      textoResumenExportar({ desde: "2026-11", hasta: "2026-11" }, 1),
    ).toBe("Noviembre 2026: 1 movimiento.");
  });
});

describe("filasCsv", () => {
  it("toma solo lo que va en el CSV", () => {
    const m: Movimiento = {
      id: 7,
      tipo: "gasto",
      monto: 4_550,
      fecha: "2026-11-05",
      descripcion: "Baleadas",
      categoriaId: 2,
      categoria: "Comida",
      categoriaColor: "#000000",
      origen: "normal",
      creadoEn: "2026-11-05T12:00:00.000Z",
    };
    expect(filasCsv([m])).toEqual([
      {
        fecha: "2026-11-05",
        tipo: "gasto",
        origen: "normal",
        categoria: "Comida",
        descripcion: "Baleadas",
        monto: 4_550,
      },
    ]);
  });
});

describe("esCancelacion", () => {
  it("reconoce cuando el usuario cierra el selector de carpeta", () => {
    expect(esCancelacion({ code: "ERR_PICKER_CANCELLED" })).toBe(true);
    expect(
      esCancelacion(new Error("The file picker was cancelled by the user")),
    ).toBe(true);
    expect(esCancelacion(new Error("Sin permiso"))).toBe(false);
    expect(esCancelacion(null)).toBe(false);
  });
});
