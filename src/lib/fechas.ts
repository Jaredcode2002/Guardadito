export type Fecha = string;
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

export function fechaLocal(d: Date): Fecha {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function mesDe(fecha: Fecha): MesId {
  return fecha.slice(0, 7);
}

export function ultimoDiaDelMes(mes: MesId): number {
  const { anio, mes: m } = partesMes(mes);
  return new Date(anio, m, 0).getDate();
}

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

export function mesesPorAbrir(ultimoAbierto: MesId | null, actual: MesId): MesId[] {
  partesMes(actual);
  if (ultimoAbierto === null) return [actual];
  const meses: MesId[] = [];
  for (let m = mesSiguiente(ultimoAbierto); m <= actual; m = mesSiguiente(m)) {
    meses.push(m);
  }
  return meses;
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function nombreMes(mes: MesId): string {
  const { anio, mes: m } = partesMes(mes);
  return `${MESES[m - 1]} ${anio}`;
}

export function abreviaturaMes(fecha: Fecha): string {
  const { mes } = partesMes(mesDe(fecha));
  return MESES[mes - 1].slice(0, 3).toUpperCase();
}

export function diaDe(fecha: Fecha): number {
  return Number(fecha.slice(8, 10));
}

export function fechaLarga(fecha: Fecha): string {
  const { mes } = partesMes(mesDe(fecha));
  return `${diaDe(fecha)} de ${MESES[mes - 1].toLowerCase()}`;
}

export function mesCorto(mes: MesId, mesActual: MesId): string {
  const { anio, mes: m } = partesMes(mes);
  const nombre = MESES[m - 1].slice(0, 3);
  return anio === partesMes(mesActual).anio
    ? nombre
    : `${nombre} ${String(anio).slice(2)}`;
}
