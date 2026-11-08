import { pendientesParaAvisar } from "./notificaciones";
import { abrirMesesPendientes, pagarPendiente } from "./operaciones";
import {
  crearPlantilla,
  desactivarPlantilla,
  listarPendientesSinPagar,
} from "./pendientes";
import { el, prepararDb } from "./pruebas/prepararDb";

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
  const ahora = "2026-11-01T12:00:00.000Z";
  await crearPlantilla(db, { nombre: "Renta", monto: 450_000, diaDelMes: 10 }, ahora);
  await crearPlantilla(db, { nombre: "Agua", monto: 30_000, diaDelMes: 31 }, ahora);
  await abrirMesesPendientes(db, el("2026-11-01"));
});

afterEach(() => db.cerrar());

describe("pendientesParaAvisar", () => {
  it("incluye los sin pagar del mes y los del mes siguiente", async () => {
    expect(await pendientesParaAvisar(db, "2026-11-07")).toEqual([
      { nombre: "Renta", monto: 450_000, fechaVence: "2026-11-10" },
      { nombre: "Agua", monto: 30_000, fechaVence: "2026-11-30" },
      { nombre: "Renta", monto: 450_000, fechaVence: "2026-12-10" },
      { nombre: "Agua", monto: 30_000, fechaVence: "2026-12-31" },
    ]);
  });

  it("no avisa lo ya pagado ni las plantillas desactivadas", async () => {
    const [renta, agua] = await listarPendientesSinPagar(db);
    await pagarPendiente(db, renta.id, el("2026-11-05"));
    await desactivarPlantilla(db, agua.plantillaId ?? 0);

    expect(await pendientesParaAvisar(db, "2026-11-07")).toEqual([
      { nombre: "Agua", monto: 30_000, fechaVence: "2026-11-30" },
      { nombre: "Renta", monto: 450_000, fechaVence: "2026-12-10" },
    ]);
  });
});
