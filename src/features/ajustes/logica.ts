import { sonUmbralesValidos, type Umbrales } from "@/lib/alertas";
import { fechaLarga, fechaLocal } from "@/lib/fechas";

export const PASO_UMBRAL = 5;

export function siguienteUmbral(
  actuales: Umbrales,
  campo: keyof Umbrales,
  direccion: 1 | -1,
): Umbrales | null {
  const nuevos = {
    ...actuales,
    [campo]: actuales[campo] + direccion * PASO_UMBRAL,
  };
  return sonUmbralesValidos(nuevos) ? nuevos : null;
}

export function formatearHora(hora24: string): string {
  const [h, m] = hora24.split(":").map(Number);
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

export function textoDiaDelMes(dia: number): string {
  return `Día ${dia} de cada mes`;
}

export function parsearDiaDelMes(texto: string): number | null {
  if (!/^\d{1,2}$/.test(texto.trim())) return null;
  const dia = Number(texto.trim());
  return dia >= 1 && dia <= 31 ? dia : null;
}

export function partesHora(hora24: string): { hora: string; minutos: string } {
  const [h, m] = hora24.split(":").map(Number);
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { hora: `${h12} ${sufijo}`, minutos: `:${String(m).padStart(2, "0")}` };
}

export function textoUltimoRespaldo(iso: string | null, ahora: Date): string {
  if (!iso) return "Todavía no has respaldado";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "Todavía no has respaldado";
  const hora = formatearHora(
    `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`,
  );
  const dia = fechaLocal(fecha);
  const ayer = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1);
  let cuando: string;
  if (dia === fechaLocal(ahora)) cuando = "hoy";
  else if (dia === fechaLocal(ayer)) cuando = "ayer";
  else if (fecha.getFullYear() === ahora.getFullYear()) cuando = `el ${fechaLarga(dia)}`;
  else cuando = `el ${fechaLarga(dia)} de ${fecha.getFullYear()}`;
  return `Último respaldo: ${cuando} a las ${hora}`;
}
