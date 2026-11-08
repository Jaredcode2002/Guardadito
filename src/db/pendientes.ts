import { fechaVence, type Fecha, type MesId } from "../lib/fechas";
import type { Centavos } from "../lib/money";
import { asegurarMonto } from "./movimientos";
import type { Db } from "./tipos";

export type Plantilla = {
  id: number;
  nombre: string;
  monto: Centavos;
  diaDelMes: number;
  activa: boolean;
};

export type NuevaPlantilla = {
  nombre: string;
  monto: Centavos;
  diaDelMes: number;
};

export type PendienteMes = {
  id: number;
  plantillaId: number | null;
  mesId: MesId;
  nombre: string;
  monto: Centavos;
  fechaVence: Fecha;
  pagadoEn: string | null;
  movimientoId: number | null;
};

const COLUMNAS_PENDIENTE = `id, plantilla_id AS plantillaId, mes_id AS mesId,
  nombre, monto, fecha_vence AS fechaVence, pagado_en AS pagadoEn,
  movimiento_id AS movimientoId`;

export async function crearPlantilla(
  db: Db,
  p: NuevaPlantilla,
  creadoEn: string,
): Promise<number> {
  asegurarMonto(p.monto);
  if (!Number.isInteger(p.diaDelMes) || p.diaDelMes < 1 || p.diaDelMes > 31) {
    throw new Error(`Día del mes inválido: ${p.diaDelMes}.`);
  }
  const r = await db.runAsync(
    `INSERT INTO plantilla_pendiente (nombre, monto, dia_del_mes, creado_en)
     VALUES (?, ?, ?, ?)`,
    [p.nombre, p.monto, p.diaDelMes, creadoEn],
  );
  return r.lastInsertRowId;
}

export async function desactivarPlantilla(db: Db, id: number): Promise<void> {
  await db.runAsync("UPDATE plantilla_pendiente SET activa = 0 WHERE id = ?", [
    id,
  ]);
}

export async function listarPlantillasActivas(db: Db): Promise<Plantilla[]> {
  const filas = await db.getAllAsync<Omit<Plantilla, "activa">>(
    `SELECT id, nombre, monto, dia_del_mes AS diaDelMes
     FROM plantilla_pendiente WHERE activa = 1 ORDER BY dia_del_mes, id`,
    [],
  );
  return filas.map((f) => ({ ...f, activa: true }));
}

export async function generarPendientesDelMes(
  db: Db,
  mes: MesId,
): Promise<number> {
  let creados = 0;
  for (const p of await listarPlantillasActivas(db)) {
    const r = await db.runAsync(
      `INSERT OR IGNORE INTO pendiente_mes
         (plantilla_id, mes_id, nombre, monto, fecha_vence)
       VALUES (?, ?, ?, ?, ?)`,
      [p.id, mes, p.nombre, p.monto, fechaVence(mes, p.diaDelMes)],
    );
    creados += r.changes;
  }
  return creados;
}

export async function obtenerPendiente(
  db: Db,
  id: number,
): Promise<PendienteMes | null> {
  return db.getFirstAsync<PendienteMes>(
    `SELECT ${COLUMNAS_PENDIENTE} FROM pendiente_mes WHERE id = ?`,
    [id],
  );
}

export async function listarPendientesSinPagar(
  db: Db,
): Promise<PendienteMes[]> {
  return db.getAllAsync<PendienteMes>(
    `SELECT ${COLUMNAS_PENDIENTE} FROM pendiente_mes
     WHERE pagado_en IS NULL ORDER BY fecha_vence, id`,
    [],
  );
}

export async function listarPendientesDelMes(
  db: Db,
  mes: MesId,
): Promise<PendienteMes[]> {
  return db.getAllAsync<PendienteMes>(
    `SELECT ${COLUMNAS_PENDIENTE} FROM pendiente_mes
     WHERE mes_id = ? ORDER BY fecha_vence, id`,
    [mes],
  );
}

export async function totalPendientesSinPagar(db: Db): Promise<Centavos> {
  const fila = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(monto), 0) AS total FROM pendiente_mes
     WHERE pagado_en IS NULL`,
    [],
  );
  return fila?.total ?? 0;
}

export async function marcarPagado(
  db: Db,
  id: number,
  pagadoEn: string,
  movimientoId: number,
): Promise<void> {
  await db.runAsync(
    "UPDATE pendiente_mes SET pagado_en = ?, movimiento_id = ? WHERE id = ?",
    [pagadoEn, movimientoId, id],
  );
}

export async function desmarcarPagado(db: Db, id: number): Promise<void> {
  await db.runAsync(
    `UPDATE pendiente_mes SET pagado_en = NULL, movimiento_id = NULL
     WHERE id = ?`,
    [id],
  );
}
