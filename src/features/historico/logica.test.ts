import type { Movimiento } from "@/db";

import {
  agruparPorDia,
  armarFilas,
  categoriasDelMes,
  filtrarPorCategoria,
  resumenDelFiltro,
  totalesDelMes,
} from "./logica";

let siguienteId = 1;

function mov(m: Partial<Movimiento>): Movimiento {
  const id = siguienteId++;
  return {
    id,
    tipo: "gasto",
    monto: 10_000,
    fecha: "2026-10-28",
    descripcion: "",
    categoriaId: null,
    categoria: null,
    categoriaColor: null,
    origen: "normal",
    creadoEn: `2026-10-28T12:00:${String(id).padStart(2, "0")}.000Z`,
    ...m,
  };
}

const CENA = mov({
  monto: 45_000,
  descripcion: "Cena con amigos",
  categoriaId: 2,
  categoria: "Ocio",
  creadoEn: "2026-10-28T20:00:00.000Z",
});
const CUBRE_CENA = mov({
  tipo: "ingreso",
  monto: 25_000,
  descripcion: "Cena con amigos",
  origen: "ahorro",
  creadoEn: "2026-10-28T20:00:00.000Z",
});
const TACOS = mov({
  monto: 18_000,
  descripcion: "Tacos",
  categoriaId: 1,
  categoria: "Comida de la calle",
});
const GANANCIA = mov({
  tipo: "ingreso",
  monto: 150_000,
  fecha: "2026-10-25",
  descripcion: "Ganancia extra",
  categoriaId: 6,
  categoria: "Ganancia extra",
});
const RENTA = mov({
  monto: 450_000,
  fecha: "2026-10-25",
  descripcion: "Renta",
  origen: "pendiente",
});
const DEPOSITO = mov({
  monto: 50_000,
  fecha: "2026-10-15",
  descripcion: "Guardado en el ahorro",
  origen: "ahorro",
});
const SOBRANTE = mov({
  monto: 30_000,
  fecha: "2026-10-31",
  descripcion: "Sobrante de 2026-10",
  origen: "sobrante",
});

const MES = [SOBRANTE, CENA, CUBRE_CENA, TACOS, GANANCIA, RENTA, DEPOSITO];

describe("armarFilas", () => {
  const filas = armarFilas(MES);

  it("oculta el ingreso desde ahorro y marca su gasto", () => {
    expect(filas.map((f) => f.id)).not.toContain(CUBRE_CENA.id);
    expect(filas.find((f) => f.id === CENA.id)).toMatchObject({
      titulo: "Cena con amigos",
      subtitulo: "Ocio",
      etiqueta: "Tocó ahorro",
    });
    expect(filas.find((f) => f.id === TACOS.id)?.etiqueta).toBeNull();
  });

  it("ingreso: si el título ya es la categoría, el subtítulo dice Ingreso", () => {
    expect(filas.find((f) => f.id === GANANCIA.id)).toMatchObject({
      tipo: "ingreso",
      titulo: "Ganancia extra",
      subtitulo: "Ingreso",
    });
  });

  it("pendiente pagado con su etiqueta, como en el diseño", () => {
    expect(filas.find((f) => f.id === RENTA.id)).toMatchObject({
      tipo: "pendiente",
      titulo: "Renta",
      subtitulo: "Pendiente pagado",
      etiqueta: "Pendiente",
    });
  });

  it("depósito y sobrante aparecen como Al ahorro", () => {
    expect(filas.find((f) => f.id === DEPOSITO.id)).toMatchObject({
      tipo: "alAhorro",
      titulo: "Al ahorro",
      subtitulo: "Desde tu libre",
    });
    expect(filas.find((f) => f.id === SOBRANTE.id)?.subtitulo).toBe(
      "Sobrante del mes",
    );
  });

  it("gasto sin nota ni categoría", () => {
    expect(armarFilas([mov({})])[0]).toMatchObject({
      titulo: "Gasto",
      subtitulo: "Gasto",
    });
  });
});

describe("agruparPorDia", () => {
  it("agrupa los días consecutivos en el orden recibido", () => {
    const dias = agruparPorDia(armarFilas(MES));
    expect(dias.map((d) => [d.titulo, d.filas.length])).toEqual([
      ["31 de octubre", 1],
      ["28 de octubre", 2],
      ["25 de octubre", 2],
      ["15 de octubre", 1],
    ]);
  });

  it("el día de hoy se titula Hoy", () => {
    const [primero, segundo] = agruparPorDia(armarFilas(MES), "2026-10-31");
    expect([primero.titulo, segundo.titulo]).toEqual(["Hoy", "28 de octubre"]);
  });
});

describe("totalesDelMes", () => {
  it("separa ingresos, gastos, ahorro usado y lo que fue al ahorro", () => {
    expect(totalesDelMes(MES)).toEqual({
      ingresos: 150_000,
      gastos: 45_000 + 18_000 + 450_000,
      ahorroUsado: 25_000,
      alAhorro: 50_000 + 30_000,
    });
  });
});

describe("categorías", () => {
  it("lista las categorías usadas en el mes, gastos primero", () => {
    expect(categoriasDelMes(MES)).toEqual([
      { id: 1, texto: "Comida de la calle" },
      { id: 2, texto: "Ocio" },
      { id: 6, texto: "Ganancia extra" },
    ]);
  });

  it("distingue nombres repetidos entre gasto e ingreso", () => {
    expect(
      categoriasDelMes([
        mov({ categoriaId: 4, categoria: "Otro" }),
        mov({ tipo: "ingreso", categoriaId: 7, categoria: "Otro" }),
      ]),
    ).toEqual([
      { id: 4, texto: "Otro" },
      { id: 7, texto: "Otro · ingreso" },
    ]);
  });

  it("filtra y resume el total de la categoría", () => {
    const filas = filtrarPorCategoria(armarFilas(MES), 2);
    expect(filas.map((f) => f.id)).toEqual([CENA.id]);
    expect(resumenDelFiltro(filas)).toBe("1 movimiento · L 450");
    expect(filtrarPorCategoria(armarFilas(MES), null)).toHaveLength(6);
    expect(resumenDelFiltro([])).toBe("0 movimientos · L 0");
  });
});
