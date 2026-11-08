import { ultimaFechaDelMes, type Fecha, type MesId } from "../lib/fechas";
import { esMontoValido, type Centavos } from "../lib/money";
import type { Db } from "./tipos";

export type TipoMovimiento = "ingreso" | "gasto";
export type OrigenMovimiento = "normal" | "ahorro" | "pendiente" | "sobrante";

export type NuevoMovimiento = {
  tipo: TipoMovimiento;
  monto: Centavos;
  fecha: Fecha;
  descripcion?: string;
  categoria?: string | null;
  origen?: OrigenMovimiento;
};

export type Movimiento = {
  id: number;
  tipo: TipoMovimiento;
  monto: Centavos;
  fecha: Fecha;
  descripcion: string;
  categoria: string | null;
  origen: OrigenMovimiento;
  creadoEn: string;
};

const COLUMNAS = `id, tipo, monto, fecha, descripcion, categoria, origen,
  creado_en AS creadoEn`;

export function asegurarMonto(monto: number): void {
  if (!esMontoValido(monto)) {
    throw new Error(
      `Monto inválido: ${monto}. Debe ser un entero positivo de centavos.`,
    );
  }
}

export async function insertarMovimiento(
  db: Db,
  m: NuevoMovimiento,
  creadoEn: string,
): Promise<number> {
  asegurarMonto(m.monto);
  const r = await db.runAsync(
    `INSERT INTO movimiento
       (tipo, monto, descripcion, categoria, origen, fecha, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      m.tipo,
      m.monto,
      m.descripcion ?? "",
      m.categoria ?? null,
      m.origen ?? "normal",
      m.fecha,
      creadoEn,
    ],
  );
  return r.lastInsertRowId;
}

export async function borrarMovimiento(db: Db, id: number): Promise<void> {
  await db.runAsync("DELETE FROM movimiento WHERE id = ?", [id]);
}

export async function obtenerMovimiento(
  db: Db,
  id: number,
): Promise<Movimiento | null> {
  return db.getFirstAsync<Movimiento>(
    `SELECT ${COLUMNAS} FROM movimiento WHERE id = ?`,
    [id],
  );
}

export async function listarMovimientosDelMes(
  db: Db,
  mes: MesId,
): Promise<Movimiento[]> {
  return db.getAllAsync<Movimiento>(
    `SELECT ${COLUMNAS} FROM movimiento
     WHERE fecha BETWEEN ? AND ?
     ORDER BY fecha DESC, id DESC`,
    [`${mes}-01`, ultimaFechaDelMes(mes)],
  );
}

export async function totalesMovimientos(
  db: Db,
): Promise<{ ingresos: Centavos; gastos: Centavos }> {
  const fila = await db.getFirstAsync<{ ingresos: number; gastos: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto END), 0) AS ingresos,
       COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto END), 0) AS gastos
     FROM movimiento`,
    [],
  );
  return fila ?? { ingresos: 0, gastos: 0 };
}

export async function ingresosNormalesDelMes(
  db: Db,
  mes: MesId,
): Promise<Centavos> {
  const fila = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(monto), 0) AS total FROM movimiento
     WHERE tipo = 'ingreso' AND origen = 'normal' AND fecha BETWEEN ? AND ?`,
    [`${mes}-01`, ultimaFechaDelMes(mes)],
  );
  return fila?.total ?? 0;
}
