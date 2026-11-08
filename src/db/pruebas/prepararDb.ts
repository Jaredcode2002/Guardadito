import { migrar } from "../migraciones";
import type { Momento } from "../reloj";
import { crearDbEnMemoria } from "./dbEnMemoria";

export async function prepararDb() {
  const db = crearDbEnMemoria();
  await migrar(db);
  return db;
}

export function el(hoy: string): Momento {
  return { hoy, ahora: `${hoy}T12:00:00.000Z` };
}
