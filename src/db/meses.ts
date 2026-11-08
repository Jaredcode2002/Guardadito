import { NIVELES, type NivelAlerta } from "../lib/alertas";
import type { MesId } from "../lib/fechas";
import type { Centavos } from "../lib/money";
import type { Db } from "./tipos";

export type Mes = {
  id: MesId;
  libreInicialBase: Centavos;
  alertasDisparadas: NivelAlerta[];
  abiertoEn: string;
  cerradoEn: string | null;
};

type FilaMes = Omit<Mes, "alertasDisparadas"> & { alertasDisparadas: string };

function leerNiveles(json: string): NivelAlerta[] {
  try {
    const valor: unknown = JSON.parse(json);
    if (!Array.isArray(valor)) return [];
    return NIVELES.filter((n) => valor.includes(n));
  } catch {
    return [];
  }
}

export async function obtenerMes(db: Db, id: MesId): Promise<Mes | null> {
  const fila = await db.getFirstAsync<FilaMes>(
    `SELECT id, libre_inicial_base AS libreInicialBase,
       alertas_disparadas AS alertasDisparadas, abierto_en AS abiertoEn,
       cerrado_en AS cerradoEn
     FROM mes WHERE id = ?`,
    [id],
  );
  if (!fila) return null;
  return { ...fila, alertasDisparadas: leerNiveles(fila.alertasDisparadas) };
}

export async function ultimoMesAbierto(db: Db): Promise<MesId | null> {
  const fila = await db.getFirstAsync<{ id: MesId | null }>(
    "SELECT MAX(id) AS id FROM mes",
    [],
  );
  return fila?.id ?? null;
}

export async function crearMes(
  db: Db,
  id: MesId,
  libreInicialBase: Centavos,
  abiertoEn: string,
): Promise<void> {
  await db.runAsync(
    "INSERT INTO mes (id, libre_inicial_base, abierto_en) VALUES (?, ?, ?)",
    [id, libreInicialBase, abiertoEn],
  );
}

export async function fijarLibreInicialBase(
  db: Db,
  id: MesId,
  libreInicialBase: Centavos,
): Promise<void> {
  await db.runAsync("UPDATE mes SET libre_inicial_base = ? WHERE id = ?", [
    libreInicialBase,
    id,
  ]);
}

export async function ajustarLibreInicialBase(
  db: Db,
  id: MesId,
  delta: Centavos,
): Promise<void> {
  await db.runAsync(
    "UPDATE mes SET libre_inicial_base = libre_inicial_base + ? WHERE id = ?",
    [delta, id],
  );
}

export async function cerrarMes(
  db: Db,
  id: MesId,
  cerradoEn: string,
): Promise<void> {
  await db.runAsync(
    "UPDATE mes SET cerrado_en = ? WHERE id = ? AND cerrado_en IS NULL",
    [cerradoEn, id],
  );
}

export async function guardarAlertasDisparadas(
  db: Db,
  id: MesId,
  niveles: readonly NivelAlerta[],
): Promise<void> {
  await db.runAsync("UPDATE mes SET alertas_disparadas = ? WHERE id = ?", [
    JSON.stringify(niveles),
    id,
  ]);
}
