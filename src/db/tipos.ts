import type { SQLiteDatabase } from "expo-sqlite";

export type ValorSql = string | number | null;

export type ResultadoRun = { changes: number; lastInsertRowId: number };

export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params: ValorSql[]): Promise<ResultadoRun>;
  getFirstAsync<T>(sql: string, params: ValorSql[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params: ValorSql[]): Promise<T[]>;
  withTransactionAsync(tarea: () => Promise<void>): Promise<void>;
}

type Afirmar<T extends true> = T;
export type ExpoSqliteCumpleDb = Afirmar<
  SQLiteDatabase extends Db ? true : false
>;
