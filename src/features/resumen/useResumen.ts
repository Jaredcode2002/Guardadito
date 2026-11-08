import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  listarPendientesSinPagar,
  momentoActual,
  obtenerResumen,
  type PendienteMes,
  type Resumen,
} from "@/db";
import { mesDe } from "@/lib/fechas";

export function useResumen() {
  const db = useSQLiteContext();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [pendientes, setPendientes] = useState<PendienteMes[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([
        obtenerResumen(db, mesDe(momentoActual().hoy)),
        listarPendientesSinPagar(db),
      ]);
      setResumen(r);
      setPendientes(p);
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

  return { db, resumen, pendientes, error, recargar };
}
