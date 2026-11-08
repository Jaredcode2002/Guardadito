declare module "node:sqlite" {
  type ValorNodeSqlite = string | number | bigint | null | Uint8Array;

  interface StatementSync {
    run(...params: ValorNodeSqlite[]): {
      changes: number | bigint;
      lastInsertRowid: number | bigint;
    };
    get(...params: ValorNodeSqlite[]): Record<string, unknown> | undefined;
    all(...params: ValorNodeSqlite[]): Record<string, unknown>[];
  }

  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
