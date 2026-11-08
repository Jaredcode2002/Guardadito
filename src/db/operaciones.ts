import { evaluarAlertas, type NivelAlerta } from "../lib/alertas";
import { planDeCierre } from "../lib/cierre";
import { mesDe, mesesPorAbrir, type Fecha, type MesId } from "../lib/fechas";
import {
  planificarGasto,
  type Centavos,
  type PlanDeGasto,
} from "../lib/money";
import { insertarMovimientoAhorro, saldoAhorro } from "./ahorro";
import {
  cerrarMes,
  crearMes,
  fijarLibreInicialBase,
  guardarAlertasDisparadas,
  obtenerMes,
  ultimoMesAbierto,
} from "./meses";
import { borrarMovimiento, insertarMovimiento } from "./movimientos";
import {
  desmarcarPagado,
  generarPendientesDelMes,
  marcarPagado,
  obtenerPendiente,
} from "./pendientes";
import { momentoActual, type Momento } from "./reloj";
import { calcularLibreActual, obtenerResumen } from "./resumen";
import type { Db } from "./tipos";

export type DatosMovimiento = {
  monto: Centavos;
  descripcion?: string;
  categoriaId?: number | null;
  fecha?: Fecha;
};

export type ResultadoGasto = {
  gastoId: number;
  ahorroUsado: Centavos;
  enNegativo: Centavos;
  alerta: NivelAlerta | null;
};

async function cerrarMesConSobrante(
  db: Db,
  mes: MesId,
  ahora: string,
): Promise<void> {
  const registro = await obtenerMes(db, mes);
  if (!registro || registro.cerradoEn) return;

  const { libre } = await calcularLibreActual(db);
  const plan = planDeCierre(mes, libre);
  if (plan) {
    const gastoId = await insertarMovimiento(
      db,
      {
        tipo: "gasto",
        monto: plan.sobrante,
        fecha: plan.fecha,
        descripcion: `Sobrante de ${mes}`,
        origen: "sobrante",
      },
      ahora,
    );
    await insertarMovimientoAhorro(
      db,
      {
        monto: plan.sobrante,
        motivo: "sobrante",
        fecha: plan.fecha,
        movimientoId: gastoId,
      },
      ahora,
    );
  }
  await cerrarMes(db, mes, ahora);
}

export async function abrirMesesPendientes(
  db: Db,
  momento: Momento = momentoActual(),
): Promise<MesId[]> {
  const meses = mesesPorAbrir(await ultimoMesAbierto(db), mesDe(momento.hoy));
  for (const mes of meses) {
    await db.withTransactionAsync(async () => {
      const anterior = await ultimoMesAbierto(db);
      if (anterior) await cerrarMesConSobrante(db, anterior, momento.ahora);
      await crearMes(db, mes, 0, momento.ahora);
      await generarPendientesDelMes(db, mes);
      const { libre } = await calcularLibreActual(db);
      await fijarLibreInicialBase(db, mes, libre);
    });
  }
  return meses;
}

export async function actualizarAlertas(
  db: Db,
  mes: MesId,
): Promise<NivelAlerta | null> {
  const registro = await obtenerMes(db, mes);
  if (!registro) return null;
  const resumen = await obtenerResumen(db, mes);
  const r = evaluarAlertas(
    registro.alertasDisparadas,
    resumen.libre,
    resumen.libreInicial,
    resumen.umbrales,
  );
  await guardarAlertasDisparadas(db, mes, r.disparadas);
  return r.mostrar;
}

export async function registrarIngreso(
  db: Db,
  datos: DatosMovimiento,
  momento: Momento = momentoActual(),
): Promise<number> {
  let id = 0;
  await db.withTransactionAsync(async () => {
    id = await insertarMovimiento(
      db,
      { ...datos, tipo: "ingreso", fecha: datos.fecha ?? momento.hoy },
      momento.ahora,
    );
    await actualizarAlertas(db, mesDe(momento.hoy));
  });
  return id;
}

export async function previsualizarGasto(
  db: Db,
  monto: Centavos,
): Promise<PlanDeGasto> {
  const { libre } = await calcularLibreActual(db);
  return planificarGasto(monto, libre, await saldoAhorro(db));
}

export async function registrarGasto(
  db: Db,
  datos: DatosMovimiento,
  momento: Momento = momentoActual(),
): Promise<ResultadoGasto> {
  const resultado: ResultadoGasto = {
    gastoId: 0,
    ahorroUsado: 0,
    enNegativo: 0,
    alerta: null,
  };
  const fecha = datos.fecha ?? momento.hoy;

  await db.withTransactionAsync(async () => {
    const plan = await previsualizarGasto(db, datos.monto);
    resultado.gastoId = await insertarMovimiento(
      db,
      { ...datos, tipo: "gasto", fecha },
      momento.ahora,
    );

    resultado.enNegativo = plan.enNegativo;

    if (plan.desdeAhorro > 0) {
      const ingresoId = await insertarMovimiento(
        db,
        {
          tipo: "ingreso",
          monto: plan.desdeAhorro,
          fecha,
          descripcion: datos.descripcion ?? "",
          origen: "ahorro",
        },
        momento.ahora,
      );
      await insertarMovimientoAhorro(
        db,
        {
          monto: -plan.desdeAhorro,
          motivo: "gasto",
          fecha,
          movimientoId: ingresoId,
        },
        momento.ahora,
      );
      resultado.ahorroUsado = plan.desdeAhorro;
    }

    resultado.alerta = await actualizarAlertas(db, mesDe(momento.hoy));
  });
  return resultado;
}

export async function pagarPendiente(
  db: Db,
  pendienteId: number,
  momento: Momento = momentoActual(),
): Promise<number> {
  let movimientoId = 0;
  await db.withTransactionAsync(async () => {
    const p = await obtenerPendiente(db, pendienteId);
    if (!p) throw new Error(`No existe el pendiente ${pendienteId}.`);
    if (p.pagadoEn) throw new Error(`"${p.nombre}" ya está pagado.`);

    movimientoId = await insertarMovimiento(
      db,
      {
        tipo: "gasto",
        monto: p.monto,
        fecha: momento.hoy,
        descripcion: p.nombre,
        origen: "pendiente",
      },
      momento.ahora,
    );
    await marcarPagado(db, pendienteId, momento.ahora, movimientoId);
  });
  return movimientoId;
}

export async function deshacerPago(db: Db, pendienteId: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    const p = await obtenerPendiente(db, pendienteId);
    if (!p) throw new Error(`No existe el pendiente ${pendienteId}.`);
    if (!p.pagadoEn) throw new Error(`"${p.nombre}" no está pagado.`);

    await desmarcarPagado(db, pendienteId);
    if (p.movimientoId !== null) await borrarMovimiento(db, p.movimientoId);
  });
}
