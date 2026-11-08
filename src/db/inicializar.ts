import { migrar } from "./migraciones";
import { abrirMesesPendientes } from "./operaciones";
import type { Db } from "./tipos";

export async function inicializarDb(db: Db): Promise<void> {
  await migrar(db);
  await abrirMesesPendientes(db);
}
