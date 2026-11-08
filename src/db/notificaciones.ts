import { fechaVence, mesDe, mesSiguiente, type Fecha } from "../lib/fechas";
import type { PendienteAvisable } from "../lib/notificaciones";
import { listarPendientesSinPagar, listarPlantillasActivas } from "./pendientes";
import type { Db } from "./tipos";

export async function pendientesParaAvisar(
  db: Db,
  hoy: Fecha,
): Promise<PendienteAvisable[]> {
  const siguiente = mesSiguiente(mesDe(hoy));
  const [sinPagar, plantillas] = await Promise.all([
    listarPendientesSinPagar(db),
    listarPlantillasActivas(db),
  ]);
  const yaGenerados = new Set(
    sinPagar
      .filter((p) => p.mesId === siguiente && p.plantillaId !== null)
      .map((p) => p.plantillaId),
  );
  return [
    ...sinPagar.map(({ nombre, monto, fechaVence: f }) => ({
      nombre,
      monto,
      fechaVence: f,
    })),
    ...plantillas
      .filter((p) => !yaGenerados.has(p.id))
      .map((p) => ({
        nombre: p.nombre,
        monto: p.monto,
        fechaVence: fechaVence(siguiente, p.diaDelMes),
      })),
  ];
}
