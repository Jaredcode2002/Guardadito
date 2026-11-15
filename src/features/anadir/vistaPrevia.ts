import type { EstadoFrasco } from "@/lib/frasco";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { gastoPermitido } from "@/lib/money";
import type { Simulacion } from "@/lib/simulacion";

export const TONO_VISTA_PREVIA: Record<
  EstadoFrasco,
  { fondo: string; texto: string }
> = {
  ok: { fondo: "#E4F3C4", texto: "#2C5A12" },
  mod: { fondo: "#FBEAC4", texto: "#6B4800" },
  crit: { fondo: "#FFE1DB", texto: "#8A2A1B" },
  zero: { fondo: "#FFE1DB", texto: "#8A2A1B" },
  roto: { fondo: "#FFE1DB", texto: "#8A2A1B" },
};

function sinFondos(s: Simulacion): boolean {
  return s.plan !== null && !gastoPermitido(s.plan);
}

export function estadoVistaPrevia(s: Simulacion): EstadoFrasco {
  return sinFondos(s) ? "roto" : s.estado;
}

export function lineasVistaPrevia(s: Simulacion): string[] {
  if (s.plan && sinFondos(s)) {
    return [
      `No te alcanza: te faltan ${L(s.plan.faltante)}`,
      s.plan.desdeAhorro > 0
        ? "Ni usando tu ahorro cubres este gasto"
        : "No tienes ahorro que lo cubra",
    ];
  }
  const lineas = [
    s.libre > 0
      ? `Libre después: ${L(s.libre)} · te queda el ${Math.round(s.porcentaje * 100)}%`
      : `Libre después: ${L(s.libre)}`,
  ];
  if (s.plan && s.plan.desdeAhorro > 0) {
    lineas.push(`Tocará ${L(s.plan.desdeAhorro)} de tu ahorro`);
  }
  return lineas;
}

export function descripcionMovimiento(
  nota: string,
  categoria: string | null,
): string {
  return nota.trim() || categoria || "";
}
