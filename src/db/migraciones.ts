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
