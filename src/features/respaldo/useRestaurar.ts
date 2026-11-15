import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";

import { abrirMesesPendientes, MIGRACIONES, restaurarRespaldo } from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import { leerArchivoElegido } from "@/features/exportar/archivo";
import { reprogramar } from "@/features/notificaciones/programar";
import { TIPO_RESPALDO, validarRespaldo, type Respaldo } from "@/lib/respaldo";
import { useTema } from "@/theme";

const TIPOS_ELEGIBLES = [TIPO_RESPALDO, "application/octet-stream", "text/plain"];

export type EstadoRestaurar = "eligiendo" | "restaurando" | null;

function avisarError(e: unknown) {
  mostrarAviso({
    tono: "coral",
    texto: e instanceof Error ? e.message : String(e),
  });
}

export function useRestaurar(alTerminar: () => Promise<void>) {
  const db = useSQLiteContext();
  const { recargar: recargarTema } = useTema();
  const [elegido, setElegido] = useState<Respaldo | null>(null);
  const [ocupado, setOcupado] = useState<EstadoRestaurar>(null);
  const restaurando = useRef(false);

  async function elegir() {
    if (ocupado) return;
    setOcupado("eligiendo");
    try {
      const texto = await leerArchivoElegido(TIPOS_ELEGIBLES);
      if (texto === null) return;
      const validacion = validarRespaldo(texto, MIGRACIONES.length);
      if (!validacion.ok) throw new Error(validacion.error);
      setElegido(validacion.respaldo);
    } catch (e) {
      avisarError(e);
    } finally {
      setOcupado(null);
    }
  }

  const cancelar = useCallback(() => {
    if (!restaurando.current) setElegido(null);
  }, []);

  async function confirmar() {
    if (!elegido || ocupado) return;
    restaurando.current = true;
    setOcupado("restaurando");
    try {
      await restaurarRespaldo(db, elegido);
      await abrirMesesPendientes(db);
      await recargarTema();
      await reprogramar(db);
      mostrarAviso({ tono: "oscuro", texto: "Respaldo restaurado" });
    } catch (e) {
      avisarError(e);
    } finally {
      restaurando.current = false;
      setElegido(null);
      setOcupado(null);
      await alTerminar();
    }
  }

  return { elegido, ocupado, elegir, cancelar, confirmar };
}
