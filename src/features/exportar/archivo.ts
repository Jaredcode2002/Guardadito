import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { esCancelacion } from "./logica";

const TIPO_CSV = "text/csv";

export async function guardarEnCarpeta(
  nombre: string,
  contenido: string,
): Promise<boolean> {
  let carpeta: Directory;
  try {
    carpeta = await Directory.pickDirectoryAsync();
  } catch (e) {
    if (esCancelacion(e)) return false;
    throw e;
  }
  carpeta.createFile(nombre, TIPO_CSV).write(contenido);
  return true;
}

export async function compartirCsv(
  nombre: string,
  contenido: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Este teléfono no permite compartir archivos.");
  }
  const archivo = new File(Paths.cache, nombre);
  archivo.write(contenido);
  await Sharing.shareAsync(archivo.uri, {
    mimeType: TIPO_CSV,
    dialogTitle: "Compartir CSV",
  });
}
