import { fechaVence, type Fecha, type MesId } from "../lib/fechas";
import type { Centavos } from "../lib/money";
import { LARGO_MAXIMO_NOMBRE, normalizarNombre } from "../lib/nombres";
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

const COLUMNAS_PLANTILLA = `id, nombre, monto, dia_del_mes AS diaDelMes,
  activa`;

type FilaPlantilla = Omit<Plantilla, "activa"> & { activa: number };

function aPlantilla(f: FilaPlantilla): Plantilla {
  return { ...f, activa: f.activa === 1 };
}

export function validarPlantilla(p: NuevaPlantilla): NuevaPlantilla {
  const nombre = normalizarNombre(p.nombre);
  if (!nombre) {
    throw new Error(
      `El nombre debe tener entre 1 y ${LARGO_MAXIMO_NOMBRE} caracteres.`,
    );
  }
  asegurarMonto(p.monto);
  if (!Number.isInteger(p.diaDelMes) || p.diaDelMes < 1 || p.diaDelMes > 31) {
    throw new Error(`Día del mes inválido: ${p.diaDelMes}.`);
  }
  return { ...p, nombre };
}

export async function crearPlantilla(
  db: Db,
  datos: NuevaPlantilla,
  creadoEn: string,
): Promise<number> {
  const p = validarPlantilla(datos);
  const r = await db.runAsync(
    `INSERT INTO plantilla_pendiente (nombre, monto, dia_del_mes, creado_en)
     VALUES (?, ?, ?, ?)`,
    [p.nombre, p.monto, p.diaDelMes, creadoEn],
  );
  return r.lastInsertRowId;
}

export async function actualizarPlantilla(
  db: Db,
  id: number,
  datos: NuevaPlantilla,
): Promise<void> {
  const p = validarPlantilla(datos);
  await db.runAsync(
    `UPDATE plantilla_pendiente SET nombre = ?, monto = ?, dia_del_mes = ?
     WHERE id = ?`,
    [p.nombre, p.monto, p.diaDelMes, id],
  );
}

export async function cambiarActivaPlantilla(
  db: Db,
  id: number,
  activa: boolean,
): Promise<void> {
  await db.runAsync("UPDATE plantilla_pendiente SET activa = ? WHERE id = ?", [
    activa ? 1 : 0,
    id,
  ]);
}

export async function desactivarPlantilla(db: Db, id: number): Promise<void> {
  await cambiarActivaPlantilla(db, id, false);
}

export async function eliminarPlantilla(db: Db, id: number): Promise<void> {
  await db.runAsync("DELETE FROM plantilla_pendiente WHERE id = ?", [id]);
}

export async function obtenerPlantilla(
  db: Db,
  id: number,
): Promise<Plantilla | null> {
  const fila = await db.getFirstAsync<FilaPlantilla>(
    `SELECT ${COLUMNAS_PLANTILLA} FROM plantilla_pendiente WHERE id = ?`,
    [id],
  );
  return fila ? aPlantilla(fila) : null;
}

export async function listarPlantillas(db: Db): Promise<Plantilla[]> {
  const filas = await db.getAllAsync<FilaPlantilla>(
    `SELECT ${COLUMNAS_PLANTILLA} FROM plantilla_pendiente
     ORDER BY dia_del_mes, id`,
    [],
  );
  return filas.map(aPlantilla);
}

export async function listarPlantillasActivas(db: Db): Promise<Plantilla[]> {
  return (await listarPlantillas(db)).filter((p) => p.activa);
}

export async function generarPendienteDePlantilla(
  db: Db,
  p: Plantilla,
  mes: MesId,
): Promise<boolean> {
  const r = await db.runAsync(
    `INSERT OR IGNORE INTO pendiente_mes
       (plantilla_id, mes_id, nombre, monto, fecha_vence)
     VALUES (?, ?, ?, ?, ?)`,
    [p.id, mes, p.nombre, p.monto, fechaVence(mes, p.diaDelMes)],
  );
  return r.changes > 0;
}

export async function generarPendientesDelMes(
  db: Db,
  mes: MesId,
): Promise<number> {
  let creados = 0;
  for (const p of await listarPlantillasActivas(db)) {
    if (await generarPendienteDePlantilla(db, p, mes)) creados++;
  }
  return creados;
}

export async function obtenerPendienteDePlantilla(
  db: Db,
  plantillaId: number,
  mes: MesId,
): Promise<PendienteMes | null> {
  return db.getFirstAsync<PendienteMes>(
    `SELECT ${COLUMNAS_PENDIENTE} FROM pendiente_mes
     WHERE plantilla_id = ? AND mes_id = ?`,
    [plantillaId, mes],
  );
}

export async function borrarPendiente(db: Db, id: number): Promise<void> {
  await db.runAsync("DELETE FROM pendiente_mes WHERE id = ?", [id]);
}

export async function actualizarPendiente(
  db: Db,
  id: number,
  datos: { nombre: string; monto: Centavos; fechaVence: Fecha },
): Promise<void> {
  await db.runAsync(
    `UPDATE pendiente_mes SET nombre = ?, monto = ?, fecha_vence = ?
     WHERE id = ?`,
    [datos.nombre, datos.monto, datos.fechaVence, id],
  );
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
