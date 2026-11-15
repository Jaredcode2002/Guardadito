import {
  CLAVES_AJUSTE_LOCALES,
  NOMBRES_TABLAS,
  TABLAS_RESPALDO,
  type Fila,
  type TablasRespaldo,
} from "../lib/respaldo";
import type { Db } from "./tipos";

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
             WHERE clave NOT IN (${CLAVES_AJUSTE_LOCALES.map(() => "?").join(", ")})
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
