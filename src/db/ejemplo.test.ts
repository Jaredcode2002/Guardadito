import { cargarPendientesDeEjemplo } from "./ejemplo";
import { abrirMesesPendientes } from "./operaciones";
import { listarPendientesDelMes } from "./pendientes";
import { el, prepararDb } from "./pruebas/prepararDb";

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
  await abrirMesesPendientes(db, el("2026-11-07"));
});

afterEach(() => db.cerrar());

describe("cargarPendientesDeEjemplo", () => {
  it("crea las 4 plantillas y sus pendientes del mes actual", async () => {
    expect(await cargarPendientesDeEjemplo(db, el("2026-11-07"))).toBe(4);

    const pendientes = await listarPendientesDelMes(db, "2026-11");
    expect(pendientes.map((p) => [p.nombre, p.fechaVence])).toEqual([
      ["Renta", "2026-11-10"],
      ["Internet", "2026-11-12"],
      ["Transporte", "2026-11-15"],
      ["Comida (súper)", "2026-11-20"],
    ]);
  });

  it("cargarlos dos veces no duplica nada", async () => {
    await cargarPendientesDeEjemplo(db, el("2026-11-07"));

    expect(await cargarPendientesDeEjemplo(db, el("2026-11-07"))).toBe(0);
    expect(await listarPendientesDelMes(db, "2026-11")).toHaveLength(4);
  });
});
