import { DatabaseSync } from "node:sqlite";

import type { Db, ValorSql } from "../tipos";

export function crearDbEnMemoria(): Db & { cerrar(): void } {
  const sqlite = new DatabaseSync(":memory:");

  return {
    async execAsync(sql: string) {
      sqlite.exec(sql);
    },
    async runAsync(sql: string, params: ValorSql[]) {
      const r = sqlite.prepare(sql).run(...params);
      return {
        changes: Number(r.changes),
        lastInsertRowId: Number(r.lastInsertRowid),
      };
    },
    async getFirstAsync<T>(sql: string, params: ValorSql[]): Promise<T | null> {
      const fila = sqlite.prepare(sql).get(...params);
      return fila ? ({ ...fila } as T) : null;
    },
    async getAllAsync<T>(sql: string, params: ValorSql[]): Promise<T[]> {
      return sqlite
        .prepare(sql)
        .all(...params)
        .map((fila) => ({ ...fila }) as T);
    },
    async withTransactionAsync(tarea: () => Promise<void>) {
      sqlite.exec("BEGIN");
      try {
        await tarea();
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    cerrar() {
      sqlite.close();
    },
  };
}
