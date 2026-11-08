import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import { listarMeses, listarMovimientosDelMes, type Movimiento } from "@/db";
import type { MesId } from "@/lib/fechas";

export function useHistorico() {
  const db = useSQLiteContext();
  const [meses, setMeses] = useState<MesId[]>([]);
  const [mes, setMes] = useState<MesId | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (elegido: MesId | null) => {
      try {
        const lista = await listarMeses(db);
        const actual =
          elegido !== null && lista.includes(elegido) ? elegido : (lista[0] ?? null);
        setMeses(lista);
        setMes(actual);
        setMovimientos(actual ? await listarMovimientosDelMes(db, actual) : []);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [db],
  );

  useFocusEffect(
    useCallback(() => {
      cargar(null);
    }, [cargar]),
  );

  return { meses, mes, movimientos, error, elegirMes: cargar };
}
