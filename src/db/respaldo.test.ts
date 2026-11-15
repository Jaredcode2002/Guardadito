import { generarRespaldo, NOMBRES_TABLAS, TABLAS_RESPALDO, validarRespaldo } from "../lib/respaldo";
import { guardarPaleta } from "./ajustes";
import { MIGRACIONES } from "./migraciones";
import {
  abrirMesesPendientes,
  pagarPendiente,
  registrarGasto,
  registrarIngreso,
} from "./operaciones";
import { crearPlantilla, listarPendientesDelMes } from "./pendientes";
import { el, prepararDb } from "./pruebas/prepararDb";
import {
  guardarUltimoRespaldo,
  leerDatosRespaldo,
  leerUltimoRespaldo,
} from "./respaldo";

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
});

afterEach(() => db.cerrar());

describe("leerDatosRespaldo", () => {
  it("las columnas del respaldo son exactamente las del esquema", async () => {
    const tablasDb = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      [],
    );
    expect(tablasDb.map((t) => t.name)).toEqual([...NOMBRES_TABLAS].sort());

    for (const tabla of NOMBRES_TABLAS) {
      const columnas = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM pragma_table_info('${tabla}') ORDER BY cid`,
        [],
      );
      expect(columnas.map((c) => c.name).sort()).toEqual(
        [...TABLAS_RESPALDO[tabla]].sort(),
      );
    }
  });

  it("lee todas las tablas con la versión actual del esquema", async () => {
    await crearPlantilla(db, { nombre: "Luz", monto: 80_000, diaDelMes: 10 }, el("2026-11-01").ahora);
    await abrirMesesPendientes(db, el("2026-11-01"));
    await registrarIngreso(db, { monto: 500_000 }, el("2026-11-02"));
    await registrarGasto(db, { monto: 12_000, descripcion: "Café" }, el("2026-11-03"));
    const [luz] = await listarPendientesDelMes(db, "2026-11");
    await pagarPendiente(db, luz.id, el("2026-11-09"));
    await guardarPaleta(db, "mar");

    const { version, tablas } = await leerDatosRespaldo(db);
    expect(version).toBe(MIGRACIONES.length);
    expect(tablas.mes).toHaveLength(1);
    expect(tablas.plantilla_pendiente).toHaveLength(1);
    expect(tablas.pendiente_mes[0].pagado_en).not.toBeNull();
    expect(tablas.movimiento.map((m) => m.monto)).toEqual([500_000, 12_000, 80_000]);
    expect(tablas.categoria.length).toBeGreaterThan(0);
    expect(tablas.ajuste).toContainEqual({ clave: "paleta", valor: "mar" });
  });

  it("no respalda la fecha del último respaldo", async () => {
    await guardarUltimoRespaldo(db, "2026-11-15T10:00:00.000Z");
    const { tablas } = await leerDatosRespaldo(db);
    const claves = tablas.ajuste.map((a) => a.clave);
    expect(claves).not.toContain("ultimo_respaldo");
    expect(claves).toContain("umbral_moderacion");
  });

  it("lo leído genera un respaldo que pasa la validación", async () => {
    await abrirMesesPendientes(db, el("2026-11-01"));
    await registrarIngreso(db, { monto: 100_000 }, el("2026-11-02"));
    const datos = await leerDatosRespaldo(db);
    const texto = generarRespaldo({ ...datos, creadoEn: "2026-11-15T10:00:00.000Z" });
    expect(validarRespaldo(texto, MIGRACIONES.length).ok).toBe(true);
  });
});

describe("último respaldo", () => {
  it("empieza vacío y guarda la fecha más reciente", async () => {
    expect(await leerUltimoRespaldo(db)).toBeNull();
    await guardarUltimoRespaldo(db, "2026-11-15T10:00:00.000Z");
    await guardarUltimoRespaldo(db, "2026-11-16T10:00:00.000Z");
    expect(await leerUltimoRespaldo(db)).toBe("2026-11-16T10:00:00.000Z");
  });
});
