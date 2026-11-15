import {
  CLAVES_AJUSTE_LOCALES,
  esquemaDeVersion,
  NOMBRES_TABLAS,
  TABLAS_RESPALDO,
  tablasDeEsquema,
  type Fila,
  type Respaldo,
  type TablasRespaldo,
} from "../lib/respaldo";
import { MIGRACIONES } from "./migraciones";
import type { Db } from "./tipos";

const MARCAS_LOCALES = CLAVES_AJUSTE_LOCALES.map(() => "?").join(", ");

export async function leerDatosRespaldo(
  db: Db,
): Promise<{ version: number; tablas: TablasRespaldo }> {
  const fila = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
    [],
  );
  const tablas = {} as TablasRespaldo;
  for (const tabla of NOMBRES_TABLAS) {
    const columnas = TABLAS_RESPALDO[tabla].join(", ");
    tablas[tabla] =
      tabla === "ajuste"
        ? await db.getAllAsync<Fila>(
            `SELECT ${columnas} FROM ajuste
             WHERE clave NOT IN (${MARCAS_LOCALES})
             ORDER BY clave`,
            [...CLAVES_AJUSTE_LOCALES],
          )
        : await db.getAllAsync<Fila>(
            `SELECT ${columnas} FROM ${tabla} ORDER BY id`,
            [],
          );
  }
  return { version: fila?.user_version ?? 0, tablas };
}

export async function restaurarRespaldo(
  db: Db,
  respaldo: Respaldo,
  migraciones: readonly string[] = MIGRACIONES,
): Promise<void> {
  const esquema = esquemaDeVersion(respaldo.version);
  if (!esquema || respaldo.version > migraciones.length) {
    throw new Error(`No se puede restaurar un respaldo v${respaldo.version}.`);
  }

  await db.execAsync("PRAGMA foreign_keys = OFF;");
  try {
    await db.withTransactionAsync(async () => {
      const locales = await db.getAllAsync<{ clave: string; valor: string }>(
        `SELECT clave, valor FROM ajuste WHERE clave IN (${MARCAS_LOCALES})`,
        [...CLAVES_AJUSTE_LOCALES],
      );

      const existentes = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
        [],
      );
      for (const { name } of existentes) {
        await db.execAsync(`DROP TABLE "${name}"`);
      }

      for (const sql of migraciones.slice(0, respaldo.version)) {
        await db.execAsync(sql);
      }

      try {
        for (const tabla of tablasDeEsquema(esquema)) {
          const columnas = esquema[tabla] ?? [];
          const marcas = columnas.map(() => "?").join(", ");
          await db.execAsync(`DELETE FROM ${tabla}`);
          for (const fila of respaldo.tablas[tabla] ?? []) {
            await db.runAsync(
              `INSERT INTO ${tabla} (${columnas.join(", ")}) VALUES (${marcas})`,
              columnas.map((c) => fila[c] ?? null),
            );
          }
        }
      } catch (e) {
        const detalle = e instanceof Error ? e.message : String(e);
        throw new Error(`El respaldo tiene datos inválidos (${detalle}).`);
      }

      for (const sql of migraciones.slice(respaldo.version)) {
        await db.execAsync(sql);
      }

      for (const { clave, valor } of locales) {
        await db.runAsync(
          `INSERT INTO ajuste (clave, valor) VALUES (?, ?)
           ON CONFLICT (clave) DO UPDATE SET valor = excluded.valor`,
          [clave, valor],
        );
      }

      const rotas = await db.getAllAsync<{ table: string }>(
        "PRAGMA foreign_key_check",
        [],
      );
      if (rotas.length > 0) {
        const tablas = [...new Set(rotas.map((r) => r.table))].join(", ");
        throw new Error(`El respaldo tiene referencias rotas en: ${tablas}.`);
      }

      await db.execAsync(`PRAGMA user_version = ${migraciones.length}`);
    });
  } finally {
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
}

export async function leerUltimoRespaldo(db: Db): Promise<string | null> {
  const fila = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM ajuste WHERE clave = 'ultimo_respaldo'",
    [],
  );
  return fila?.valor ?? null;
}

export async function guardarUltimoRespaldo(db: Db, fecha: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO ajuste (clave, valor) VALUES ('ultimo_respaldo', ?)
     ON CONFLICT (clave) DO UPDATE SET valor = excluded.valor`,
    [fecha],
  );
}
