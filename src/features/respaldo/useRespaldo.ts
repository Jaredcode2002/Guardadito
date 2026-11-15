import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  guardarUltimoRespaldo,
  leerDatosRespaldo,
  leerUltimoRespaldo,
  MIGRACIONES,
} from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import {
  compartirArchivo,
  guardarEnCarpeta,
  type TipoArchivo,
} from "@/features/exportar/archivo";
import {
  generarRespaldo,
  nombreArchivoRespaldo,
  TIPO_RESPALDO,
  validarRespaldo,
} from "@/lib/respaldo";

export type ComoRespaldar = "carpeta" | "compartir";

const ARCHIVO_RESPALDO: TipoArchivo = {
  mime: TIPO_RESPALDO,
  titulo: "Guardar respaldo",
};

export function useRespaldo() {
  const db = useSQLiteContext();
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<ComoRespaldar | null>(null);

  const recargar = useCallback(async () => {
    setUltimo(await leerUltimoRespaldo(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  async function respaldar(como: ComoRespaldar) {
    if (ocupado) return;
    setOcupado(como);
    try {
      const ahora = new Date();
      const contenido = generarRespaldo({
        ...(await leerDatosRespaldo(db)),
        creadoEn: ahora.toISOString(),
      });
      const validacion = validarRespaldo(contenido, MIGRACIONES.length);
      if (!validacion.ok) throw new Error(validacion.error);

      const nombre = nombreArchivoRespaldo(ahora);
      if (como === "compartir") {
        await compartirArchivo(nombre, contenido, ARCHIVO_RESPALDO);
      } else {
        if (!(await guardarEnCarpeta(nombre, contenido, ARCHIVO_RESPALDO))) return;
        mostrarAviso({ tono: "oscuro", texto: `Respaldo guardado: ${nombre}` });
      }
      await guardarUltimoRespaldo(db, ahora.toISOString());
    } catch (e) {
      mostrarAviso({
        tono: "coral",
        texto: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setOcupado(null);
      await recargar();
    }
  }

  return { ultimo, ocupado, respaldar };
}
