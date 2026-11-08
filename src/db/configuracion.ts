import type { NivelAlerta } from "../lib/alertas";
import { fechaVence, mesDe, type MesId } from "../lib/fechas";
import type { Centavos } from "../lib/money";
import { insertarMovimientoAhorro } from "./ahorro";
import { ajustarLibreInicialBase, obtenerMes } from "./meses";
import { asegurarMonto, insertarMovimiento } from "./movimientos";
import { actualizarAlertas } from "./operaciones";
import {
  actualizarPendiente,
  actualizarPlantilla,
  borrarPendiente,
  cambiarActivaPlantilla,
  crearPlantilla,
  eliminarPlantilla,
  generarPendienteDePlantilla,
  obtenerPendienteDePlantilla,
  obtenerPlantilla,
  validarPlantilla,
  type NuevaPlantilla,
  type Plantilla,
} from "./pendientes";
import { momentoActual, type Momento } from "./reloj";
import { calcularLibreActual } from "./resumen";
import type { Db } from "./tipos";

async function mesAbierto(db: Db, momento: Momento): Promise<MesId | null> {
  const mes = mesDe(momento.hoy);
  return (await obtenerMes(db, mes)) ? mes : null;
}

async function ponerEnElMes(db: Db, p: Plantilla, mes: MesId): Promise<void> {
  if (await generarPendienteDePlantilla(db, p, mes)) {
    await ajustarLibreInicialBase(db, mes, -p.monto);
  }
}

async function quitarDelMes(
  db: Db,
  plantillaId: number,
  mes: MesId,
): Promise<void> {
  const copia = await obtenerPendienteDePlantilla(db, plantillaId, mes);
  if (!copia || copia.pagadoEn) return;
  await borrarPendiente(db, copia.id);
  await ajustarLibreInicialBase(db, mes, copia.monto);
}

async function buscarPlantilla(db: Db, id: number): Promise<Plantilla> {
  const p = await obtenerPlantilla(db, id);
  if (!p) throw new Error(`No existe el pendiente fijo ${id}.`);
  return p;
}

export async function agregarPendienteFijo(
  db: Db,
  datos: NuevaPlantilla,
  momento: Momento = momentoActual(),
): Promise<{ id: number; alerta: NivelAlerta | null }> {
  let id = 0;
  let alerta: NivelAlerta | null = null;
  await db.withTransactionAsync(async () => {
    id = await crearPlantilla(db, datos, momento.ahora);
    const mes = await mesAbierto(db, momento);
    if (mes) {
      await ponerEnElMes(db, await buscarPlantilla(db, id), mes);
      alerta = await actualizarAlertas(db, mes);
    }
  });
  return { id, alerta };
}

export async function editarPendienteFijo(
  db: Db,
  id: number,
  datos: NuevaPlantilla,
  momento: Momento = momentoActual(),
): Promise<NivelAlerta | null> {
  const p = validarPlantilla(datos);
  let alerta: NivelAlerta | null = null;
  await db.withTransactionAsync(async () => {
    const anterior = await buscarPlantilla(db, id);
    await actualizarPlantilla(db, id, p);
    const mes = await mesAbierto(db, momento);
    if (!mes || !anterior.activa) return;

    const copia = await obtenerPendienteDePlantilla(db, id, mes);
    if (!copia || copia.pagadoEn) return;
    await actualizarPendiente(db, copia.id, {
      nombre: p.nombre,
      monto: p.monto,
      fechaVence: fechaVence(mes, p.diaDelMes),
    });
    await ajustarLibreInicialBase(db, mes, copia.monto - p.monto);
    alerta = await actualizarAlertas(db, mes);
  });
  return alerta;
}

export async function cambiarPendienteFijoActivo(
  db: Db,
  id: number,
  activo: boolean,
  momento: Momento = momentoActual(),
): Promise<NivelAlerta | null> {
  let alerta: NivelAlerta | null = null;
  await db.withTransactionAsync(async () => {
    const p = await buscarPlantilla(db, id);
    if (p.activa === activo) return;
    await cambiarActivaPlantilla(db, id, activo);
    const mes = await mesAbierto(db, momento);
    if (!mes) return;
    if (activo) await ponerEnElMes(db, { ...p, activa: true }, mes);
    else await quitarDelMes(db, id, mes);
    alerta = await actualizarAlertas(db, mes);
  });
  return alerta;
}

export async function eliminarPendienteFijo(
  db: Db,
  id: number,
  momento: Momento = momentoActual(),
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await buscarPlantilla(db, id);
    const mes = await mesAbierto(db, momento);
    if (mes) await quitarDelMes(db, id, mes);
    await eliminarPlantilla(db, id);
    if (mes) await actualizarAlertas(db, mes);
  });
}

export async function registrarAhorroExistente(
  db: Db,
  monto: Centavos,
  momento: Momento = momentoActual(),
): Promise<void> {
  asegurarMonto(monto);
  await insertarMovimientoAhorro(
    db,
    { monto, motivo: "saldo_inicial", fecha: momento.hoy },
    momento.ahora,
  );
}

export async function depositarEnAhorro(
  db: Db,
  monto: Centavos,
  momento: Momento = momentoActual(),
): Promise<NivelAlerta | null> {
  asegurarMonto(monto);
  let alerta: NivelAlerta | null = null;
  await db.withTransactionAsync(async () => {
    const { libre } = await calcularLibreActual(db);
    if (monto > libre) {
      throw new Error(
        "Solo puedes guardar en el ahorro lo que tienes libre, sin tocar tus pendientes.",
      );
    }
    const gastoId = await insertarMovimiento(
      db,
      {
        tipo: "gasto",
        monto,
        fecha: momento.hoy,
        descripcion: "Guardado en el ahorro",
        origen: "ahorro",
      },
      momento.ahora,
    );
    await insertarMovimientoAhorro(
      db,
      { monto, motivo: "deposito", fecha: momento.hoy, movimientoId: gastoId },
      momento.ahora,
    );
    const mes = await mesAbierto(db, momento);
    if (mes) alerta = await actualizarAlertas(db, mes);
  });
  return alerta;
}
