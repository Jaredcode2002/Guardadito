import type { EstadoFrasco } from "@/lib/frasco";

export type TonoAviso = "oscuro" | "ambar" | "coral";

export type AvisoNuevo = {
  tono: TonoAviso;
  titulo?: string;
  texto: string;
  frasco?: { estado: EstadoFrasco; porcentaje: number };
  accion?: { texto: string; alPresionar: () => void };
  duracion?: number;
};

export type Aviso = AvisoNuevo & { id: number };

export const DURACION_AVISO = 4000;

let actual: Aviso | null = null;
let siguienteId = 1;
const oyentes = new Set<() => void>();

function notificar() {
  for (const oyente of oyentes) oyente();
}

export function mostrarAviso(aviso: AvisoNuevo): number {
  actual = { ...aviso, id: siguienteId++ };
  notificar();
  return actual.id;
}

export function cerrarAviso(id?: number): void {
  if (!actual || (id !== undefined && actual.id !== id)) return;
  actual = null;
  notificar();
}

export function leerAviso(): Aviso | null {
  return actual;
}

export function suscribirAvisos(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}
