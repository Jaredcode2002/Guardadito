import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  listarMovimientosDelMes,
  listarPendientesSinPagar,
  momentoActual,
  obtenerResumen,
  type Movimiento,
  type PendienteMes,
  type Resumen,
} from "@/db";
import { mesDe } from "@/lib/fechas";

export function useResumen() {
  const db = useSQLiteContext();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [pendientes, setPendientes] = useState<PendienteMes[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      const mes = mesDe(momentoActual().hoy);
      const [r, p, m] = await Promise.all([
        obtenerResumen(db, mes),
        listarPendientesSinPagar(db),
        listarMovimientosDelMes(db, mes),
      ]);
      setResumen(r);
      setPendientes(p);
      setMovimientos(m);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  return { db, resumen, pendientes, movimientos, error, recargar };
}
