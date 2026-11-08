import { sonUmbralesValidos, type Umbrales } from "@/lib/alertas";

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
