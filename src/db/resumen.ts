import type { Umbrales } from "../lib/alertas";
import type { MesId } from "../lib/fechas";
import { estadoFrasco, type EstadoFrasco } from "../lib/frasco";
import {
  calcularDinero,
  calcularLibre,
  calcularLibreInicial,
  porcentajeRestante,
  type Centavos,
} from "../lib/money";
import { ahorroTocadoSinReponer, saldoAhorro } from "./ahorro";
import { leerAjustes } from "./ajustes";
import { obtenerMes } from "./meses";
import { ingresosNormalesDelMes, totalesMovimientos } from "./movimientos";
import { totalPendientesSinPagar } from "./pendientes";
import type { Db } from "./tipos";

export type Resumen = {
  mes: MesId;
  dinero: Centavos;
  pendientesSinPagar: Centavos;
  libre: Centavos;
  libreInicial: Centavos;
  porcentaje: number;
  estado: EstadoFrasco;
  ahorroTocadoSinReponer: boolean;
  saldoAhorro: Centavos;
  umbrales: Umbrales;
};

export async function calcularLibreActual(
  db: Db,
): Promise<{ dinero: Centavos; pendientes: Centavos; libre: Centavos }> {
  const { ingresos, gastos } = await totalesMovimientos(db);
  const dinero = calcularDinero(ingresos, gastos);
  const pendientes = await totalPendientesSinPagar(db);
  return { dinero, pendientes, libre: calcularLibre(dinero, pendientes) };
}

export async function obtenerResumen(db: Db, mes: MesId): Promise<Resumen> {
  const registroMes = await obtenerMes(db, mes);
  if (!registroMes) {
    throw new Error(`El mes ${mes} no está abierto.`);
  }
  const { dinero, pendientes, libre } = await calcularLibreActual(db);
  const libreInicial = calcularLibreInicial(registroMes.libreInicialBase, [
    await ingresosNormalesDelMes(db, mes),
  ]);
  const { umbrales } = await leerAjustes(db);
  const tocado = await ahorroTocadoSinReponer(db);

  return {
    mes,
    dinero,
    pendientesSinPagar: pendientes,
    libre,
    libreInicial,
    porcentaje: porcentajeRestante(libre, libreInicial),
    estado: estadoFrasco({
      libre,
      libreInicial,
      ahorroTocadoSinReponer: tocado,
      umbrales,
    }),
    ahorroTocadoSinReponer: tocado,
    saldoAhorro: await saldoAhorro(db),
    umbrales,
  };
}
