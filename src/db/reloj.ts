import { fechaLocal, type Fecha } from "../lib/fechas";

export type Momento = { hoy: Fecha; ahora: string };

export function momentoActual(): Momento {
  const d = new Date();
  return { hoy: fechaLocal(d), ahora: d.toISOString() };
}
