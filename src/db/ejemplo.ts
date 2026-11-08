import { mesDe } from "../lib/fechas";
import {
  crearPlantilla,
  generarPendientesDelMes,
  listarPlantillasActivas,
  type NuevaPlantilla,
} from "./pendientes";
import { momentoActual, type Momento } from "./reloj";
import type { Db } from "./tipos";

export const PENDIENTES_DE_EJEMPLO: readonly NuevaPlantilla[] = [
  { nombre: "Renta", monto: 450_000, diaDelMes: 10 },
  { nombre: "Internet", monto: 60_000, diaDelMes: 12 },
  { nombre: "Transporte", monto: 120_000, diaDelMes: 15 },
  { nombre: "Comida (súper)", monto: 200_000, diaDelMes: 20 },
];

export async function cargarPendientesDeEjemplo(
  db: Db,
  momento: Momento = momentoActual(),
): Promise<number> {
  let creadas = 0;
  await db.withTransactionAsync(async () => {
    const existentes = new Set(
      (await listarPlantillasActivas(db)).map((p) => p.nombre),
    );
    for (const p of PENDIENTES_DE_EJEMPLO) {
      if (existentes.has(p.nombre)) continue;
      await crearPlantilla(db, p, momento.ahora);
      creadas++;
    }
    await generarPendientesDelMes(db, mesDe(momento.hoy));
  });
  return creadas;
}
