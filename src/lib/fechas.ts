/**
 * Fechas como texto: día 'YYYY-MM-DD' y mes 'YYYY-MM', en hora local.
 * Así no hay sorpresas de zona horaria y el texto se ordena igual que las
 * fechas (SQLite puede comparar con < y >).
 */

/** Día en formato 'YYYY-MM-DD'. */
export type Fecha = string;
/** Mes en formato 'YYYY-MM'. */
export type MesId = string;

const RE_MES = /^(\d{4})-(\d{2})$/;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function partesMes(mes: MesId): { anio: number; mes: number } {
  const m = RE_MES.exec(mes);
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) {
    throw new Error(`Mes inválido: "${mes}" (se esperaba 'YYYY-MM')`);
  }
  return { anio: Number(m[1]), mes: Number(m[2]) };
}

/** Convierte un Date a 'YYYY-MM-DD' usando la hora local del teléfono. */
export function fechaLocal(d: Date): Fecha {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 'YYYY-MM-DD' → 'YYYY-MM'. */
export function mesDe(fecha: Fecha): MesId {
  return fecha.slice(0, 7);
}

export function ultimoDiaDelMes(mes: MesId): number {
  const { anio, mes: m } = partesMes(mes);
  // El día 0 del mes siguiente es el último día de este (truco de Date).
  return new Date(anio, m, 0).getDate();
}

/** Fecha de vencimiento: un día 31 en febrero cae el 28 (o 29). */
export function fechaVence(mes: MesId, dia: number): Fecha {
  return `${mes}-${pad2(Math.min(dia, ultimoDiaDelMes(mes)))}`;
}

export function ultimaFechaDelMes(mes: MesId): Fecha {
  return fechaVence(mes, 31);
}

export function mesSiguiente(mes: MesId): MesId {
  const { anio, mes: m } = partesMes(mes);
  return m === 12 ? `${anio + 1}-01` : `${anio}-${pad2(m + 1)}`;
}

export function mesAnterior(mes: MesId): MesId {
  const { anio, mes: m } = partesMes(mes);
  return m === 1 ? `${anio - 1}-12` : `${anio}-${pad2(m - 1)}`;
}

/**
 * Meses que faltan por abrir, en orden. Si la app no se abrió en dos meses,
 * hay que cerrar y abrir cada uno para que el sobrante de cada mes llegue
 * al ahorro y sus pendientes se generen.
 *   ultimoAbierto = null (primera vez) → solo el actual.
 */
export function mesesPorAbrir(ultimoAbierto: MesId | null, actual: MesId): MesId[] {
  partesMes(actual);
  if (ultimoAbierto === null) return [actual];
  const meses: MesId[] = [];
  for (let m = mesSiguiente(ultimoAbierto); m <= actual; m = mesSiguiente(m)) {
    meses.push(m);
  }
  return meses;
}
