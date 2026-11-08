import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { leerPermiso, pedirPermiso, type EstadoPermiso } from "./programar";

export function usePermiso() {
  const [permiso, setPermiso] = useState<EstadoPermiso | null>(null);

  const leer = useCallback(() => {
    leerPermiso()
      .then(setPermiso)
      .catch(() => setPermiso(null));
  }, []);

  useFocusEffect(leer);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") leer();
    });
    return () => sub.remove();
  }, [leer]);

  const pedir = useCallback(async () => {
    setPermiso(await pedirPermiso());
  }, []);

  return { permiso, pedir };
}
