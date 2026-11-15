import {
  mesesBorrablesDe,
  mesesHasta,
  planDeArrastre,
  puedeBorrarHasta,
} from "../lib/arrastre";
import { mesDe, nombreMes, ultimaFechaDelMes, type MesId } from "../lib/fechas";
import {
  ahorroTocadoSinReponer,
  CLAVE_TOCADO_ARRASTRE,
  insertarMovimientoAhorro,
} from "./ahorro";
import { listarMeses } from "./meses";
import { insertarMovimiento } from "./movimientos";
import { listarPendientesSinPagarHasta, type PendienteMes } from "./pendientes";
import { momentoActual, type Momento } from "./reloj";
import type { Db } from "./tipos";

export type VistaBorrado = {
  hasta: MesId;
  meses: MesId[];
  movimientos: number;
  pendientesSinPagar: PendienteMes[];
};

export type ResultadoBorrado = { meses: number; movimientos: number };

const AHORRO_BORRADO = `fecha <= ? OR movimiento_id IN
  (SELECT id FROM movimiento WHERE fecha <= ?)`;

export async function mesesBorrables(
  db: Db,
  mesActual: MesId,
): Promise<MesId[]> {
  return mesesBorrablesDe(await listarMeses(db), mesActual);
}

export async function previsualizarBorrado(
  db: Db,
  hasta: MesId,
): Promise<VistaBorrado> {
  const fila = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM movimiento
     WHERE fecha <= ? AND origen <> 'arrastre'`,
    [ultimaFechaDelMes(hasta)],
  );
  return {
    hasta,
    meses: mesesHasta(await listarMeses(db), hasta).sort(),
    movimientos: fila?.n ?? 0,
    pendientesSinPagar: await listarPendientesSinPagarHasta(db, hasta),
  };
}

export function textoPendientesQueBloquean(
  pendientes: readonly PendienteMes[],
): string {
  const lista = pendientes
    .map((p) => `${p.nombre} (${nombreMes(p.mesId)})`)
    .join(", ");
  return `Antes paga o quita los pendientes sin pagar de esos meses: ${lista}.`;
}

export async function borrarMesesHasta(
  db: Db,
  hasta: MesId,
  momento: Momento = momentoActual(),
): Promise<ResultadoBorrado> {
  if (!puedeBorrarHasta(hasta, mesDe(momento.hoy))) {
    throw new Error("El mes actual no se puede borrar.");
  }
  const fin = ultimaFechaDelMes(hasta);
  let resultado: ResultadoBorrado = { meses: 0, movimientos: 0 };

  await db.withTransactionAsync(async () => {
    const vista = await previsualizarBorrado(db, hasta);
    if (vista.pendientesSinPagar.length > 0) {
      throw new Error(textoPendientesQueBloquean(vista.pendientesSinPagar));
    }
    const tocadoAntes = await ahorroTocadoSinReponer(db);

    const dinero = await db.getFirstAsync<{ ingresos: number; gastos: number }>(
      `SELECT
         COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto END), 0) AS ingresos,
         COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto END), 0) AS gastos
       FROM movimiento WHERE fecha <= ?`,
      [fin],
    );
    const ahorro = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(monto), 0) AS total FROM ahorro_movimiento
       WHERE ${AHORRO_BORRADO}`,
      [fin, fin],
    );
    const plan = planDeArrastre(hasta, {
      ingresos: dinero?.ingresos ?? 0,
      gastos: dinero?.gastos ?? 0,
      ahorro: ahorro?.total ?? 0,
    });

    await db.runAsync("DELETE FROM pendiente_mes WHERE mes_id <= ?", [hasta]);
    await db.runAsync(`DELETE FROM ahorro_movimiento WHERE ${AHORRO_BORRADO}`, [
      fin,
      fin,
    ]);
    await db.runAsync("DELETE FROM movimiento WHERE fecha <= ?", [fin]);
    await db.runAsync("DELETE FROM mes WHERE id <= ?", [hasta]);

    if (plan.movimiento) {
      await insertarMovimiento(
        db,
        {
          ...plan.movimiento,
          fecha: plan.fecha,
          descripcion: `Arrastre hasta ${nombreMes(hasta)}`,
          origen: "arrastre",
        },
        momento.ahora,
      );
    }
    if (plan.ahorro !== null) {
      await insertarMovimientoAhorro(
        db,
        { monto: plan.ahorro, motivo: "arrastre", fecha: plan.fecha },
        momento.ahora,
      );
    }

    const quedaAhorroUsado = await db.getFirstAsync<{ hay: number }>(
      `SELECT 1 AS hay FROM movimiento
       WHERE tipo = 'ingreso' AND origen = 'ahorro' LIMIT 1`,
      [],
    );
    if (tocadoAntes && !quedaAhorroUsado) {
      await db.runAsync(
        "INSERT OR REPLACE INTO ajuste (clave, valor) VALUES (?, '1')",
        [CLAVE_TOCADO_ARRASTRE],
      );
    } else {
      await db.runAsync("DELETE FROM ajuste WHERE clave = ?", [
        CLAVE_TOCADO_ARRASTRE,
      ]);
    }

    resultado = { meses: vista.meses.length, movimientos: vista.movimientos };
  });

  await db.execAsync("VACUUM");
  return resultado;
}
