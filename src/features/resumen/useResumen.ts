import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { momentoActual, obtenerResumen, type Resumen } from "@/db";
import { mesDe } from "@/lib/fechas";

export function useResumen() {
  const db = useSQLiteContext();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setResumen(await obtenerResumen(db, mesDe(momentoActual().hoy)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [db]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { db, resumen, error, recargar };
}
