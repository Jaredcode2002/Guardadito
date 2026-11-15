import { insertarMovimiento, listarMovimientosEntre } from "./movimientos";
import {
  abrirMesesPendientes,
  registrarGasto,
  registrarIngreso,
} from "./operaciones";
import { el, prepararDb } from "./pruebas/prepararDb";

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
  for (const mes of ["2026-09", "2026-10", "2026-11"]) {
    await abrirMesesPendientes(db, el(`${mes}-01`));
    await registrarIngreso(db, { monto: 100_000 }, el(`${mes}-02`));
    await registrarGasto(db, { monto: 20_000 }, el(`${mes}-28`));
  }
});

afterEach(() => db.cerrar());

describe("listarMovimientosEntre", () => {
  it("trae los meses del rango, incluidos sus extremos, del más viejo al más nuevo", async () => {
    const lista = await listarMovimientosEntre(db, "2026-10", "2026-11");
    expect(lista.map((m) => m.fecha)).toEqual([
      "2026-10-02",
      "2026-10-28",
      "2026-10-31",
      "2026-11-02",
      "2026-11-28",
    ]);
  });

  it("un solo mes", async () => {
    const lista = await listarMovimientosEntre(db, "2026-09", "2026-09");
    expect(lista.map((m) => m.fecha)).toEqual([
      "2026-09-02",
      "2026-09-28",
      "2026-09-30",
    ]);
  });

  it("incluye la fila de arrastre para que los totales cuadren", async () => {
    await insertarMovimiento(
      db,
      { tipo: "ingreso", monto: 5_000, fecha: "2026-10-01", origen: "arrastre" },
      el("2026-11-15").ahora,
    );
    const lista = await listarMovimientosEntre(db, "2026-10", "2026-10");
    expect(lista[0]).toMatchObject({ fecha: "2026-10-01", origen: "arrastre" });
    expect(lista).toHaveLength(4);
  });
});
