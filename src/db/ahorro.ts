import type { Fecha } from "../lib/fechas";
import type { Centavos } from "../lib/money";
import type { Db } from "./tipos";

export type MotivoAhorro =
  | "saldo_inicial"
  | "sobrante"
  | "gasto"
  | "deposito"
  | "retiro";

export type NuevoMovimientoAhorro = {
  monto: Centavos;
  motivo: MotivoAhorro;
  fecha: Fecha;
  movimientoId?: number | null;
};

export async function insertarMovimientoAhorro(
  db: Db,
  m: NuevoMovimientoAhorro,
  creadoEn: string,
): Promise<number> {
  if (!Number.isSafeInteger(m.monto) || m.monto === 0) {
    throw new Error(`Monto de ahorro inválido: ${m.monto}.`);
  }
  if (m.monto < 0 && (await saldoAhorro(db)) + m.monto < 0) {
    throw new Error("El ahorro no alcanza: no puede quedar en negativo.");
  }
  const r = await db.runAsync(
    `INSERT INTO ahorro_movimiento
       (monto, motivo, movimiento_id, fecha, creado_en)
     VALUES (?, ?, ?, ?, ?)`,
    [m.monto, m.motivo, m.movimientoId ?? null, m.fecha, creadoEn],
  );
  return r.lastInsertRowId;
}

export async function saldoAhorro(db: Db): Promise<Centavos> {
  const fila = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM ahorro_movimiento",
    [],
  );
  return fila?.total ?? 0;
}

export async function ahorroTocadoSinReponer(db: Db): Promise<boolean> {
  const fila = await db.getFirstAsync<{
    ultimoAhorro: number | null;
    ultimoNormal: number | null;
  }>(
    `SELECT
       (SELECT MAX(id) FROM movimiento
        WHERE tipo = 'ingreso' AND origen = 'ahorro') AS ultimoAhorro,
       (SELECT MAX(id) FROM movimiento
        WHERE tipo = 'ingreso' AND origen = 'normal') AS ultimoNormal`,
    [],
  );
  if (!fila || fila.ultimoAhorro === null) return false;
  return fila.ultimoNormal === null || fila.ultimoAhorro > fila.ultimoNormal;
}
