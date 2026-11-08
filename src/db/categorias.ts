import {
  esColorCategoria,
  siguienteColor,
  type ColorCategoria,
} from "../lib/colores";
import { LARGO_MAXIMO_NOMBRE, normalizarNombre } from "../lib/nombres";
import type { TipoMovimiento } from "./movimientos";
import type { Db } from "./tipos";

export type Categoria = {
  id: number;
  tipo: TipoMovimiento;
  nombre: string;
  color: ColorCategoria;
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
    `SELECT id, tipo, nombre, color FROM categoria
     WHERE tipo = ? ORDER BY orden, nombre COLLATE NOCASE`,
    [tipo],
  );
}

export async function obtenerCategoria(
  db: Db,
  id: number,
): Promise<Categoria | null> {
  return db.getFirstAsync<Categoria>(
    "SELECT id, tipo, nombre, color FROM categoria WHERE id = ?",
    [id],
  );
}

export async function crearCategoria(
  db: Db,
  tipo: TipoMovimiento,
  texto: string,
  creadoEn: string,
  colorElegido?: string,
): Promise<number> {
  const nombre = asegurarNombre(texto);
  if (colorElegido !== undefined && !esColorCategoria(colorElegido)) {
    throw new Error(`Color inválido: "${colorElegido}".`);
  }
  const usados = await db.getAllAsync<{ color: string }>(
    "SELECT color FROM categoria WHERE tipo = ?",
    [tipo],
  );
  const color = colorElegido ?? siguienteColor(usados.map((u) => u.color));
  return conNombreUnico(nombre, async () => {
    const r = await db.runAsync(
      `INSERT INTO categoria (tipo, nombre, color, orden, creado_en)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(orden), 0) + 1 FROM categoria WHERE tipo = ?), ?)`,
      [tipo, nombre, color, tipo, creadoEn],
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

export async function cambiarColorCategoria(
  db: Db,
  id: number,
  color: string,
): Promise<void> {
  if (!esColorCategoria(color)) throw new Error(`Color inválido: "${color}".`);
  await db.runAsync("UPDATE categoria SET color = ? WHERE id = ?", [color, id]);
}

export async function eliminarCategoria(db: Db, id: number): Promise<void> {
  await db.runAsync("DELETE FROM categoria WHERE id = ?", [id]);
}
