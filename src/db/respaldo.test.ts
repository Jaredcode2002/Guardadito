import {
  ESQUEMAS_RESPALDO,
  esquemaDeVersion,
  generarRespaldo,
  NOMBRES_TABLAS,
  TABLAS_RESPALDO,
  tablasDeEsquema,
  validarRespaldo,
  type Fila,
  type Respaldo,
  type TablasRespaldo,
} from "../lib/respaldo";
import { saldoAhorro } from "./ahorro";
import { guardarPaleta } from "./ajustes";
import { crearCategoria, listarCategorias } from "./categorias";
import { MIGRACIONES, migrar } from "./migraciones";
import {
  abrirMesesPendientes,
  pagarPendiente,
  registrarGasto,
  registrarIngreso,
} from "./operaciones";
import { crearPlantilla, listarPendientesDelMes } from "./pendientes";
import { crearDbEnMemoria } from "./pruebas/dbEnMemoria";
import { el, prepararDb } from "./pruebas/prepararDb";
import {
  guardarUltimoRespaldo,
  leerDatosRespaldo,
  leerUltimoRespaldo,
  restaurarRespaldo,
} from "./respaldo";
import type { Db } from "./tipos";

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

  it("hay un esquema de respaldo por versión y coincide con lo que dejan las migraciones", async () => {
    expect(ESQUEMAS_RESPALDO).toHaveLength(MIGRACIONES.length);
    for (let version = 1; version <= MIGRACIONES.length; version++) {
      const vieja = crearDbEnMemoria();
      try {
        await migrar(vieja, MIGRACIONES.slice(0, version));
        const esquema = esquemaDeVersion(version) ?? {};
        const tablasDb = await vieja.getAllAsync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
          [],
        );
        expect(tablasDb.map((t) => t.name)).toEqual(tablasDeEsquema(esquema).sort());
        for (const tabla of tablasDeEsquema(esquema)) {
          const columnas = await vieja.getAllAsync<{ name: string }>(
            `SELECT name FROM pragma_table_info('${tabla}')`,
            [],
          );
          expect(columnas.map((c) => c.name).sort()).toEqual([...(esquema[tabla] ?? [])].sort());
        }
      } finally {
        vieja.cerrar();
      }
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

async function llenarDatos(destino: Db) {
  await crearPlantilla(destino, { nombre: "Luz", monto: 80_000, diaDelMes: 10 }, el("2026-10-01").ahora);
  await abrirMesesPendientes(destino, el("2026-10-01"));
  await registrarIngreso(destino, { monto: 900_000 }, el("2026-10-02"));
  await abrirMesesPendientes(destino, el("2026-11-01"));
  await registrarIngreso(destino, { monto: 500_000 }, el("2026-11-02"));
  const [comida] = await listarCategorias(destino, "gasto");
  await registrarGasto(destino, { monto: 12_000, descripcion: "Café, \"rico\"", categoriaId: comida.id }, el("2026-11-03"));
  const [luz] = await listarPendientesDelMes(destino, "2026-11");
  await pagarPendiente(destino, luz.id, el("2026-11-09"));
  await guardarPaleta(destino, "mar");
}

async function respaldoDe(origen: Db): Promise<Respaldo> {
  const texto = generarRespaldo({
    ...(await leerDatosRespaldo(origen)),
    creadoEn: "2026-11-15T10:00:00.000Z",
  });
  const r = validarRespaldo(texto, MIGRACIONES.length);
  if (!r.ok) throw new Error(r.error);
  return r.respaldo;
}

function esquemaDe(origen: Db) {
  return origen.getAllAsync<{ type: string; name: string; sql: string | null }>(
    "SELECT type, name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name",
    [],
  );
}

async function leerSegun(origen: Db, version: number): Promise<Partial<TablasRespaldo>> {
  const esquema = esquemaDeVersion(version) ?? {};
  const tablas: Partial<TablasRespaldo> = {};
  for (const tabla of tablasDeEsquema(esquema)) {
    tablas[tabla] = await origen.getAllAsync<Fila>(
      `SELECT ${(esquema[tabla] ?? []).join(", ")} FROM ${tabla}`,
      [],
    );
  }
  return tablas;
}

function sinCreacionDeCategorias(datos: { tablas: TablasRespaldo }) {
  return {
    ...datos.tablas,
    categoria: datos.tablas.categoria.map(({ creado_en: _, ...resto }) => resto),
  };
}

describe("restaurarRespaldo", () => {
  let original: Awaited<ReturnType<typeof prepararDb>>;

  beforeEach(async () => {
    original = await prepararDb();
    await llenarDatos(original);
  });

  afterEach(() => original.cerrar());

  it("restaurar un respaldo deja la BD igual a la original", async () => {
    await registrarIngreso(db, { monto: 1_000 }, el("2026-11-05"));
    await crearCategoria(db, "gasto", "Solo aquí", el("2026-11-05").ahora);

    await restaurarRespaldo(db, await respaldoDe(original));

    expect(await leerDatosRespaldo(db)).toEqual(await leerDatosRespaldo(original));
    expect(await esquemaDe(db)).toEqual(await esquemaDe(original));
    expect(await saldoAhorro(db)).toBe(await saldoAhorro(original));
    const llaves = await db.getFirstAsync<{ foreign_keys: number }>("PRAGMA foreign_keys", []);
    expect(llaves?.foreign_keys).toBe(1);
  });

  it("conserva la fecha del último respaldo de este teléfono", async () => {
    await guardarUltimoRespaldo(db, "2026-11-14T08:00:00.000Z");
    await restaurarRespaldo(db, await respaldoDe(original));
    expect(await leerUltimoRespaldo(db)).toBe("2026-11-14T08:00:00.000Z");
  });

  it("un respaldo viejo queda igual que migrar la BD vieja", async () => {
    const vieja = crearDbEnMemoria();
    try {
      await migrar(vieja, MIGRACIONES.slice(0, 1));
      await vieja.execAsync(`
        INSERT INTO mes (id, libre_inicial_base, abierto_en) VALUES ('2026-11', 400000, '2026-11-01T12:00:00.000Z');
        INSERT INTO movimiento (id, tipo, monto, descripcion, categoria, origen, fecha, creado_en) VALUES
          (1, 'ingreso', 500000, '', NULL, 'normal', '2026-11-01', '2026-11-01T12:00:00.000Z'),
          (2, 'gasto', 3000, 'Baleadas', 'Comida de la calle', 'normal', '2026-11-02', '2026-11-02T12:00:00.000Z'),
          (3, 'gasto', 9000, 'Súper', ' Mandado ', 'normal', '2026-11-03', '2026-11-03T12:00:00.000Z');
        INSERT INTO ahorro_movimiento (monto, motivo, fecha, creado_en) VALUES
          (20000, 'saldo_inicial', '2026-11-01', '2026-11-01T12:00:00.000Z');
      `);
      const texto = JSON.stringify({
        app: "guardadito",
        version: 1,
        creadoEn: "2026-11-04T12:00:00.000Z",
        tablas: await leerSegun(vieja, 1),
      });
      const r = validarRespaldo(texto, MIGRACIONES.length);
      if (!r.ok) throw new Error(r.error);

      await restaurarRespaldo(db, r.respaldo);
      await migrar(vieja);

      const restaurada = await leerDatosRespaldo(db);
      expect(restaurada.version).toBe(MIGRACIONES.length);
      expect(sinCreacionDeCategorias(restaurada)).toEqual(
        sinCreacionDeCategorias(await leerDatosRespaldo(vieja)),
      );
      const mandado = restaurada.tablas.categoria.find((c) => c.nombre === "Mandado");
      expect(restaurada.tablas.movimiento.find((m) => m.id === 3)?.categoria_id).toBe(mandado?.id);
      expect(await esquemaDe(db)).toEqual(await esquemaDe(original));
    } finally {
      vieja.cerrar();
    }
  });

  it("rechaza un respaldo más nuevo que la app sin tocar nada", async () => {
    const antes = await leerDatosRespaldo(db);
    const respaldo = { ...(await respaldoDe(original)), version: MIGRACIONES.length + 1 };
    await expect(restaurarRespaldo(db, respaldo)).rejects.toThrow();
    expect(await leerDatosRespaldo(db)).toEqual(antes);
  });

  it("si un dato no cabe en el esquema no cambia nada", async () => {
    await registrarIngreso(db, { monto: 1_000 }, el("2026-11-05"));
    const antes = await leerDatosRespaldo(db);
    const respaldo = await respaldoDe(original);
    respaldo.tablas.movimiento = respaldo.tablas.movimiento?.map((m) => ({ ...m, monto: 0 }));

    await expect(restaurarRespaldo(db, respaldo)).rejects.toThrow("datos inválidos");
    expect(await leerDatosRespaldo(db)).toEqual(antes);
    expect(await esquemaDe(db)).toEqual(await esquemaDe(original));
  });

  it("si hay referencias rotas no cambia nada y deja las llaves encendidas", async () => {
    const antes = await leerDatosRespaldo(db);
    const respaldo = await respaldoDe(original);
    respaldo.tablas.mes = [];

    await expect(restaurarRespaldo(db, respaldo)).rejects.toThrow("referencias rotas");
    expect(await leerDatosRespaldo(db)).toEqual(antes);
    const llaves = await db.getFirstAsync<{ foreign_keys: number }>("PRAGMA foreign_keys", []);
    expect(llaves?.foreign_keys).toBe(1);
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
