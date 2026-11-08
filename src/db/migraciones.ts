import type { Db } from "./tipos";

export const MIGRACIONES: readonly string[] = [
  `
  CREATE TABLE mes (
    id                 TEXT PRIMARY KEY,
    libre_inicial_base INTEGER NOT NULL,
    alertas_disparadas TEXT NOT NULL DEFAULT '[]',
    abierto_en         TEXT NOT NULL,
    cerrado_en         TEXT
  );

  CREATE TABLE movimiento (
    id          INTEGER PRIMARY KEY,
    tipo        TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    monto       INTEGER NOT NULL CHECK (monto > 0),
    descripcion TEXT NOT NULL DEFAULT '',
    categoria   TEXT,
    origen      TEXT NOT NULL DEFAULT 'normal'
                CHECK (origen IN ('normal', 'ahorro', 'pendiente', 'sobrante')),
    fecha       TEXT NOT NULL,
    creado_en   TEXT NOT NULL
  );
  CREATE INDEX idx_movimiento_fecha ON movimiento(fecha);

  CREATE TABLE plantilla_pendiente (
    id          INTEGER PRIMARY KEY,
    nombre      TEXT NOT NULL,
    monto       INTEGER NOT NULL CHECK (monto > 0),
    dia_del_mes INTEGER NOT NULL CHECK (dia_del_mes BETWEEN 1 AND 31),
    activa      INTEGER NOT NULL DEFAULT 1 CHECK (activa IN (0, 1)),
    creado_en   TEXT NOT NULL
  );

  CREATE TABLE pendiente_mes (
    id            INTEGER PRIMARY KEY,
    plantilla_id  INTEGER REFERENCES plantilla_pendiente(id) ON DELETE SET NULL,
    mes_id        TEXT NOT NULL REFERENCES mes(id),
    nombre        TEXT NOT NULL,
    monto         INTEGER NOT NULL CHECK (monto > 0),
    fecha_vence   TEXT NOT NULL,
    pagado_en     TEXT,
    movimiento_id INTEGER REFERENCES movimiento(id) ON DELETE SET NULL,
    UNIQUE (plantilla_id, mes_id)
  );
  CREATE INDEX idx_pendiente_mes_mes ON pendiente_mes(mes_id);

  CREATE TABLE ahorro_movimiento (
    id            INTEGER PRIMARY KEY,
    monto         INTEGER NOT NULL CHECK (monto <> 0),
    motivo        TEXT NOT NULL
                  CHECK (motivo IN ('saldo_inicial', 'sobrante', 'gasto', 'deposito', 'retiro')),
    movimiento_id INTEGER REFERENCES movimiento(id) ON DELETE CASCADE,
    fecha         TEXT NOT NULL,
    creado_en     TEXT NOT NULL
  );

  CREATE TABLE ajuste (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );

  INSERT OR IGNORE INTO ajuste (clave, valor) VALUES
    ('umbral_moderacion', '30'),
    ('umbral_casi_cero',  '10'),
    ('hora_recordatorio', '21:00'),
    ('avisar_pendientes', '1');
  `,
  `
  CREATE TABLE categoria (
    id        INTEGER PRIMARY KEY,
    tipo      TEXT NOT NULL CHECK (tipo IN ('gasto', 'ingreso')),
    nombre    TEXT NOT NULL CHECK (length(trim(nombre)) > 0),
    orden     INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL,
    UNIQUE (tipo, nombre)
  );

  INSERT INTO categoria (tipo, nombre, orden, creado_en) VALUES
    ('gasto',   'Comida de la calle', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('gasto',   'Ocio',               2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('gasto',   'Transporte extra',   3, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('gasto',   'Otro',               4, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('ingreso', 'Sueldo',             1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('ingreso', 'Ganancia extra',     2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('ingreso', 'Otro',               3, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

  INSERT OR IGNORE INTO categoria (tipo, nombre, orden, creado_en)
    SELECT DISTINCT tipo, trim(categoria), 100, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    FROM movimiento
    WHERE categoria IS NOT NULL AND length(trim(categoria)) > 0;

  ALTER TABLE movimiento
    ADD COLUMN categoria_id INTEGER REFERENCES categoria(id) ON DELETE SET NULL;

  UPDATE movimiento SET categoria_id = (
    SELECT c.id FROM categoria c
    WHERE c.tipo = movimiento.tipo AND c.nombre = trim(movimiento.categoria)
  )
  WHERE categoria IS NOT NULL;

  ALTER TABLE movimiento DROP COLUMN categoria;

  CREATE INDEX idx_movimiento_categoria ON movimiento(categoria_id);

  INSERT OR IGNORE INTO ajuste (clave, valor) VALUES ('recordatorio_activo', '1');
  `,
  `
  ALTER TABLE categoria ADD COLUMN color TEXT NOT NULL DEFAULT 'azul'
    CHECK (color IN ('azul', 'naranja', 'aqua', 'amarillo', 'rosa', 'verde', 'violeta', 'rojo'));

  UPDATE categoria SET color = (
    SELECT CASE (r.n - 1) % 8
      WHEN 0 THEN 'azul'
      WHEN 1 THEN 'naranja'
      WHEN 2 THEN 'aqua'
      WHEN 3 THEN 'amarillo'
      WHEN 4 THEN 'rosa'
      WHEN 5 THEN 'verde'
      WHEN 6 THEN 'violeta'
      WHEN 7 THEN 'rojo'
    END
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY orden, id) AS n
      FROM categoria
    ) r
    WHERE r.id = categoria.id
  );
  `,
];

export async function migrar(
  db: Db,
  migraciones: readonly string[] = MIGRACIONES,
): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

  const fila = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
    [],
  );
  const actual = fila?.user_version ?? 0;

  if (actual > migraciones.length) {
    throw new Error(
      `La base de datos es de una versión más nueva de la app (v${actual} > v${migraciones.length}).`,
    );
  }

  for (let version = actual; version < migraciones.length; version++) {
    const sql = migraciones[version];
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);

      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
