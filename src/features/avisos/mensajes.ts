import type { NivelAlerta } from "@/lib/alertas";
import type { EstadoFrasco } from "@/lib/frasco";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import type { Centavos } from "@/lib/money";

import type { AvisoNuevo } from "./store";

export type ResultadoParaAviso = {
  monto: Centavos;
  ahorroUsado: Centavos;
  alerta: NivelAlerta | null;
};

export type SituacionParaAviso = {
  libre: Centavos;
  porcentaje: number;
  estado: EstadoFrasco;
  saldoAhorro: Centavos;
};

export function avisoDeGasto(
  r: ResultadoParaAviso,
  s: SituacionParaAviso,
): AvisoNuevo {
  const pct = Math.round(s.porcentaje * 100);
  const frasco = { estado: s.estado, porcentaje: s.porcentaje };

  if (r.ahorroUsado > 0) {
    return {
      tono: "coral",
      frasco,
      titulo: "Tocaste tu ahorro",
      texto: `Se registró el gasto de ${L(r.monto)} y ${L(r.ahorroUsado)} salieron de tu ahorro. Tu ahorro quedó en ${L(s.saldoAhorro)}.`,
    };
  }

  if (r.alerta === "cero") {
    return {
      tono: "coral",
      frasco,
      titulo: "Llegaste a cero",
      texto:
        s.saldoAhorro > 0
          ? "Ya no te queda libre este mes. Lo que gastes ahora saldrá de tu ahorro."
          : "Ya no te queda libre este mes.",
    };
  }

  if (r.alerta === "casiCero") {
    return {
      tono: "coral",
      frasco,
      titulo: "Estás a punto de quedarte en cero",
      texto: `Te quedan ${L(s.libre)} de libre (${pct}%). Piénsalo dos veces antes de gastar.`,
    };
  }

  if (r.alerta === "moderacion") {
    return {
      tono: "ambar",
      frasco,
      titulo: "Ve más despacio",
      texto: `Ya gastaste el ${100 - pct}% de tu libre del mes. Te quedan ${L(s.libre)}.`,
    };
  }

  return { tono: "oscuro", texto: `Gasto de ${L(r.monto)} registrado` };
}
