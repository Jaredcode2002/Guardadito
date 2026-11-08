import { MIGRACIONES, migrar } from './migraciones';
import { crearDbEnMemoria } from './pruebas/dbEnMemoria';

const AHORA = '2026-11-07T15:00:00.000Z';

let db: ReturnType<typeof crearDbEnMemoria>;

beforeEach(async () => {
  db = crearDbEnMemoria();
  await migrar(db);
});

afterEach(() => db.cerrar());

async function version() {
  const fila = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  return fila?.user_version;
}

async function insertarMovimiento(tipo: string, monto: number) {
  return db.runAsync(
    `INSERT INTO movimiento (tipo, monto, fecha, creado_en) VALUES (?, ?, ?, ?)`,
    [tipo, monto, '2026-11-07', AHORA],
  );
}

describe('migrar', () => {
  it('crea las 7 tablas', async () => {
    const tablas = await db.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
      [],
    );
    expect(tablas.map((t) => t.name)).toEqual([
      'ahorro_movimiento',
      'ajuste',
      'categoria',
      'mes',
      'movimiento',
      'pendiente_mes',
      'plantilla_pendiente',
    ]);
  });

  it('deja user_version en la última versión', async () => {
    expect(await version()).toBe(MIGRACIONES.length);
  });

  it('carga los ajustes por defecto', async () => {
    const ajustes = await db.getAllAsync<{ clave: string; valor: string }>(
      'SELECT clave, valor FROM ajuste ORDER BY clave',
      [],
    );
    expect(ajustes).toEqual([
      { clave: 'avisar_pendientes', valor: '1' },
      { clave: 'hora_recordatorio', valor: '21:00' },
      { clave: 'recordatorio_activo', valor: '1' },
      { clave: 'umbral_casi_cero', valor: '10' },
      { clave: 'umbral_moderacion', valor: '30' },
    ]);
  });

  it('correrla otra vez (cada vez que abre la app) no hace nada ni falla', async () => {
    await migrar(db);
    expect(await version()).toBe(MIGRACIONES.length);
    const n = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM ajuste', []);
    expect(n?.n).toBe(5);
  });

  it('si una migración falla, se deshace entera y la versión no avanza', async () => {
    const otra = crearDbEnMemoria();
    const migraciones = ['CREATE TABLE a (x INTEGER);', 'CREATE TABLE b (x); ESTO NO ES SQL;'];

    await expect(migrar(otra, migraciones)).rejects.toThrow();

    const fila = await otra.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(fila?.user_version).toBe(1);
    const b = await otra.getFirstAsync(`SELECT name FROM sqlite_master WHERE name = 'b'`, []);
    expect(b).toBeNull();
    otra.cerrar();
  });

  it('rechaza una base de una versión más nueva de la app', async () => {
    await db.execAsync('PRAGMA user_version = 99');
    await expect(migrar(db)).rejects.toThrow('versión más nueva');
  });
});

describe('reglas del esquema', () => {
  it('monto debe ser mayor que 0', async () => {
    await expect(insertarMovimiento('gasto', 0)).rejects.toThrow(/CHECK/);
    await expect(insertarMovimiento('gasto', -500)).rejects.toThrow(/CHECK/);
  });

  it('tipo solo puede ser ingreso o gasto', async () => {
    await expect(insertarMovimiento('regalo', 500)).rejects.toThrow(/CHECK/);
  });

  it('las llaves foráneas están activas: no hay pendiente de un mes inexistente', async () => {
    await expect(
      db.runAsync(
        `INSERT INTO pendiente_mes (mes_id, nombre, monto, fecha_vence) VALUES (?, ?, ?, ?)`,
        ['2026-11', 'Luz', 80_000, '2026-11-10'],
      ),
    ).rejects.toThrow(/FOREIGN KEY/);
  });

  it('una plantilla genera como máximo un pendiente por mes', async () => {
    await db.runAsync(
      `INSERT INTO mes (id, libre_inicial_base, abierto_en) VALUES (?, ?, ?)`,
      ['2026-11', 0, AHORA],
    );
    const { lastInsertRowId: plantilla } = await db.runAsync(
      `INSERT INTO plantilla_pendiente (nombre, monto, dia_del_mes, creado_en) VALUES (?, ?, ?, ?)`,
      ['Luz', 80_000, 10, AHORA],
    );
    const generar = () =>
      db.runAsync(
        `INSERT OR IGNORE INTO pendiente_mes (plantilla_id, mes_id, nombre, monto, fecha_vence)
         VALUES (?, ?, ?, ?, ?)`,
        [plantilla, '2026-11', 'Luz', 80_000, '2026-11-10'],
      );

    await generar();
    await generar();

    const n = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM pendiente_mes', []);
    expect(n?.n).toBe(1);
  });

  it('al borrar un movimiento se borra su movimiento de ahorro (CASCADE)', async () => {
    const { lastInsertRowId: ingreso } = await insertarMovimiento('ingreso', 30_000);
    await db.runAsync(
      `INSERT INTO ahorro_movimiento (monto, motivo, movimiento_id, fecha, creado_en)
       VALUES (?, ?, ?, ?, ?)`,
      [-30_000, 'gasto', ingreso, '2026-11-07', AHORA],
    );

    await db.runAsync('DELETE FROM movimiento WHERE id = ?', [ingreso]);

    const n = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM ahorro_movimiento', []);
    expect(n?.n).toBe(0);
  });
});

describe('migración v2: categorías', () => {
  it('una base v1 con categorías de texto las pasa a la tabla sin perder nada', async () => {
    const vieja = crearDbEnMemoria();
    await migrar(vieja, MIGRACIONES.slice(0, 1));
    const insertar = (tipo: string, categoria: string | null) =>
      vieja.runAsync(
        `INSERT INTO movimiento (tipo, monto, categoria, fecha, creado_en)
         VALUES (?, 1000, ?, '2026-11-07', ?)`,
        [tipo, categoria, AHORA],
      );
    await insertar('gasto', 'Ocio');
    await insertar('gasto', '  Mi categoría  ');
    await insertar('ingreso', 'Sueldo');
    await insertar('gasto', null);

    await migrar(vieja);

    const filas = await vieja.getAllAsync<{ tipo: string; nombre: string | null }>(
      `SELECT m.tipo, c.nombre FROM movimiento m
       LEFT JOIN categoria c ON c.id = m.categoria_id ORDER BY m.id`,
      [],
    );
    expect(filas).toEqual([
      { tipo: 'gasto', nombre: 'Ocio' },
      { tipo: 'gasto', nombre: 'Mi categoría' },
      { tipo: 'ingreso', nombre: 'Sueldo' },
      { tipo: 'gasto', nombre: null },
    ]);
    const columnas = await vieja.getAllAsync<{ name: string }>(
      'PRAGMA table_info(movimiento)',
      [],
    );
    expect(columnas.map((c) => c.name)).not.toContain('categoria');
    vieja.cerrar();
  });

  it('borrar una categoría deja sus movimientos sin categoría', async () => {
    const { lastInsertRowId: id } = await db.runAsync(
      `INSERT INTO categoria (tipo, nombre, creado_en) VALUES ('gasto', 'Temporal', ?)`,
      [AHORA],
    );
    await db.runAsync(
      `INSERT INTO movimiento (tipo, monto, categoria_id, fecha, creado_en)
       VALUES ('gasto', 1000, ?, '2026-11-07', ?)`,
      [id, AHORA],
    );

    await db.runAsync('DELETE FROM categoria WHERE id = ?', [id]);

    const fila = await db.getFirstAsync<{ categoria_id: number | null }>(
      'SELECT categoria_id FROM movimiento',
      [],
    );
    expect(fila?.categoria_id).toBeNull();
  });
});
