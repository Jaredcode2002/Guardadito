import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { AppState } from "react-native";

import { pedirPermisoLaPrimeraVez, reprogramar } from "./programar";

export function GestorNotificaciones({ activo }: { activo: boolean }) {
  const db = useSQLiteContext();

  useEffect(() => {
    if (!activo) return;
    pedirPermisoLaPrimeraVez(db)
      .catch((e) => console.warn("No se pudo pedir el permiso", e))
      .then(() => reprogramar(db));
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active" || estado === "background") reprogramar(db);
    });
    return () => sub.remove();
  }, [activo, db]);

  return null;
}
