import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  leerAjustes,
  listarCategorias,
  listarPlantillas,
  saldoAhorro,
  type Ajustes,
  type Categoria,
  type Plantilla,
  type TipoMovimiento,
} from "@/db";
import { reprogramar } from "@/features/notificaciones/programar";
import type { Centavos } from "@/lib/money";

export type DatosAjustes = {
  plantillas: Plantilla[];
  categorias: Record<TipoMovimiento, Categoria[]>;
  ajustes: Ajustes;
  saldoAhorro: Centavos;
};

export function useAjustes() {
  const db = useSQLiteContext();
  const [datos, setDatos] = useState<DatosAjustes | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      const [plantillas, gasto, ingreso, ajustes, saldo] = await Promise.all([
        listarPlantillas(db),
        listarCategorias(db, "gasto"),
        listarCategorias(db, "ingreso"),
        leerAjustes(db),
        saldoAhorro(db),
      ]);
      setDatos({
        plantillas,
        categorias: { gasto, ingreso },
        ajustes,
        saldoAhorro: saldo,
      });
      setError(null);
      reprogramar(db);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  return { db, datos, error, recargar };
}

export function useCategorias(tipo: TipoMovimiento) {
  const db = useSQLiteContext();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useFocusEffect(
    useCallback(() => {
      let vigente = true;
      listarCategorias(db, tipo).then((c) => {
        if (vigente) setCategorias(c);
      });
      return () => {
        vigente = false;
      };
    }, [db, tipo]),
  );

  return categorias;
}
