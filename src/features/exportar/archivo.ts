import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { esCancelacion } from "./logica";

export type TipoArchivo = { mime: string; titulo: string };

export const ARCHIVO_CSV: TipoArchivo = { mime: "text/csv", titulo: "Compartir CSV" };

export async function guardarEnCarpeta(
  nombre: string,
  contenido: string,
  tipo: TipoArchivo,
): Promise<boolean> {
  let carpeta: Directory;
  try {
    carpeta = await Directory.pickDirectoryAsync();
  } catch (e) {
    if (esCancelacion(e)) return false;
    throw e;
  }
  carpeta.createFile(nombre, tipo.mime).write(contenido);
  return true;
}

export async function compartirArchivo(
  nombre: string,
  contenido: string,
  tipo: TipoArchivo,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Este teléfono no permite compartir archivos.");
  }
  const archivo = new File(Paths.cache, nombre);
  archivo.write(contenido);
  await Sharing.shareAsync(archivo.uri, {
    mimeType: tipo.mime,
    dialogTitle: tipo.titulo,
  });
}
