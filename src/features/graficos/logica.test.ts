import type { Movimiento } from "@/db";
import { COLOR_PENDIENTES, COLOR_SIN_CATEGORIA } from "@/lib/colores";

import {
  caminoSector,
  gastosPorCategoria,
  sectoresDona,
  textoPorcentaje,
  totalGastado,
} from "./logica";

let siguienteId = 1;

function mov(m: Partial<Movimiento>): Movimiento {
  return {
    id: siguienteId++,
    tipo: "gasto",
    monto: 10_000,
    fecha: "2026-10-28",
    descripcion: "",
    categoriaId: null,
    categoria: null,
    categoriaColor: null,
    origen: "normal",
    creadoEn: "2026-10-28T12:00:00.000Z",
    ...m,
  };
}

const OCIO = { categoriaId: 2, categoria: "Ocio", categoriaColor: "naranja" };
const COMIDA = {
  categoriaId: 1,
  categoria: "Comida de la calle",
  categoriaColor: "azul",
};

describe("gastosPorCategoria", () => {
  const MES = [
    mov({ monto: 120_000, ...OCIO }),
    mov({ monto: 120_000, ...OCIO }),
    mov({ monto: 310_000, ...COMIDA }),
    mov({ monto: 830_000, origen: "pendiente", descripcion: "Renta" }),
    mov({ monto: 60_000 }),
    mov({ monto: 50_000, origen: "ahorro" }),
    mov({ monto: 30_000, origen: "sobrante" }),
    mov({ tipo: "ingreso", monto: 900_000, categoriaId: 5, categoria: "Sueldo" }),
    mov({ tipo: "ingreso", monto: 25_000, origen: "ahorro" }),
  ];

  it("agrupa los gastos reales y los ordena de mayor a menor", () => {
    const grupos = gastosPorCategoria(MES);
    expect(grupos.map((g) => [g.nombre, g.monto, g.color])).toEqual([
      ["Pendientes", 830_000, COLOR_PENDIENTES],
      ["Comida de la calle", 310_000, "#2A78D6"],
      ["Ocio", 240_000, "#EB6834"],
      ["Sin categoría", 60_000, COLOR_SIN_CATEGORIA],
    ]);
  });

  it("no cuenta lo que fue al ahorro ni los ingresos", () => {
    expect(totalGastado(gastosPorCategoria(MES))).toBe(1_440_000);
  });

  it("los porcentajes suman 1", () => {
    const suma = gastosPorCategoria(MES).reduce((s, g) => s + g.porcentaje, 0);
    expect(suma).toBeCloseTo(1, 10);
  });

  it("un mes sin gastos no da grupos", () => {
    expect(gastosPorCategoria([mov({ tipo: "ingreso" })])).toEqual([]);
  });
});

describe("textoPorcentaje", () => {
  it.each([
    [0.54, "54%"],
    [0.004, "<1%"],
    [0, "0%"],
    [1, "100%"],
  ])("%d → %s", (p, texto) => {
    expect(textoPorcentaje(p)).toBe(texto);
  });
});

describe("geometría de la dona", () => {
  it("un cuarto de dona desde arriba en sentido del reloj", () => {
    expect(caminoSector(50, 50, 40, 25, 0, Math.PI / 2)).toBe(
      "M50 10 A40 40 0 0 1 90 50 L75 50 A25 25 0 0 0 50 25 Z",
    );
  });

  it("marca el arco largo cuando el sector pasa de media vuelta", () => {
    expect(caminoSector(50, 50, 40, 25, 0, Math.PI * 1.5)).toContain(
      "A40 40 0 1 1",
    );
  });

  it("un sector por grupo con monto, en orden", () => {
    const s = sectoresDona(
      [
        { clave: "a", monto: 3 },
        { clave: "b", monto: 0 },
        { clave: "c", monto: 1 },
      ],
      50,
      50,
      40,
      25,
    );
    expect(s.map((x) => x.clave)).toEqual(["a", "c"]);
  });

  it("un solo grupo dibuja el anillo completo en dos mitades", () => {
    const [s] = sectoresDona([{ clave: "a", monto: 5 }], 50, 50, 40, 25);
    expect(s.d.match(/M/g)).toHaveLength(2);
  });

  it("sin montos no dibuja nada", () => {
    expect(sectoresDona([], 50, 50, 40, 25)).toEqual([]);
  });
});
