import type { Tema, Tono } from "./tema";

export type Acento = Tono;

export function acentoTipo(tema: Tema): Record<"gasto" | "ingreso", Acento> {
  return { gasto: tema.tono.crit, ingreso: tema.tono.ok };
}
