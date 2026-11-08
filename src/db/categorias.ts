import { LARGO_MAXIMO_NOMBRE, normalizarNombre } from "../lib/nombres";
import type { TipoMovimiento } from "./movimientos";
import type { Db } from "./tipos";

export type Categoria = {
  id: number;
  tipo: TipoMovimiento;
  nombre: string;
};

function asegurarNombre(texto: string): string {
  const nombre = normalizarNombre(texto);
  if (!nombre) {
    throw new Error(
      `El nombre debe tener entre 1 y ${LARGO_MAXIMO_NOMBRE} caracteres.`,
    );
  }
  return nombre;
}

async function conNombreUnico<T>(
  nombre: string,
  accion: () => Promise<T>,
): Promise<T> {
  try {
    return await accion();
  } catch (e) {
    const mensaje = String((e as { message?: unknown } | null)?.message ?? e);
    if (/UNIQUE/.test(mensaje)) {
      throw new Error(`Ya tienes una categoría llamada "${nombre}".`);
    }
    throw e;
  }
}

export async function listarCategorias(
  db: Db,
  tipo: TipoMovimiento,
): Promise<Categoria[]> {
  return db.getAllAsync<Categoria>(
    `SELECT id, tipo, nombre FROM categoria
     WHERE tipo = ? ORDER BY orden, nombre COLLATE NOCASE`,
    [tipo],
  );
}

export async function obtenerCategoria(
  db: Db,
  id: number,
): Promise<Categoria | null> {
  return db.getFirstAsync<Categoria>(
    "SELECT id, tipo, nombre FROM categoria WHERE id = ?",
    [id],
  );
}

export async function crearCategoria(
  db: Db,
  tipo: TipoMovimiento,
  texto: string,
  creadoEn: string,
): Promise<number> {
  const nombre = asegurarNombre(texto);
  return conNombreUnico(nombre, async () => {
    const r = await db.runAsync(
      `INSERT INTO categoria (tipo, nombre, orden, creado_en)
       VALUES (?, ?, (SELECT COALESCE(MAX(orden), 0) + 1 FROM categoria WHERE tipo = ?), ?)`,
      [tipo, nombre, tipo, creadoEn],
    );
    return r.lastInsertRowId;
  });
}

export async function renombrarCategoria(
  db: Db,
  id: number,
  texto: string,
): Promise<void> {
  const nombre = asegurarNombre(texto);
  await conNombreUnico(nombre, () =>
    db.runAsync("UPDATE categoria SET nombre = ? WHERE id = ?", [nombre, id]),
  );
}

export async function eliminarCategoria(db: Db, id: number): Promise<void> {
  await db.runAsync("DELETE FROM categoria WHERE id = ?", [id]);
}
