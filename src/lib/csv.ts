import { mesDe, type Fecha } from "./fechas";
import type { Centavos } from "./money";

export type TipoCsv = "gasto" | "ingreso";
export type OrigenCsv = "normal" | "ahorro" | "pendiente" | "sobrante" | "arrastre";

export type FilaCsv = {
  fecha: Fecha;
  tipo: TipoCsv;
  origen: OrigenCsv;
  categoria: string | null;
  descripcion: string;
  monto: Centavos;
};

export const BOM = "﻿";
export const SEPARADOR = ",";
export const FIN_DE_LINEA = "\r\n";

export const ENCABEZADOS = [
  "Mes",
  "Fecha",
  "Tipo",
  "Origen",
  "Categoría",
  "Descripción",
  "Monto (L)",
] as const;

export function etiquetaOrigen(tipo: TipoCsv, origen: OrigenCsv): string {
  switch (origen) {
    case "normal":
      return "Normal";
    case "pendiente":
      return "Gasto fijo";
    case "sobrante":
      return "Sobrante al ahorro";
    case "arrastre":
      return "Arrastre";
    case "ahorro":
      return tipo === "ingreso" ? "Desde el ahorro" : "Al ahorro";
  }
}

export function montoCsv(centavos: Centavos): string {
  const signo = centavos < 0 ? "-" : "";
  const absoluto = Math.abs(centavos);
  const decimales = String(absoluto % 100).padStart(2, "0");
  return `${signo}${Math.floor(absoluto / 100)}.${decimales}`;
}

export function escaparCampo(valor: string): string {
  return /[",\r\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}

function linea(campos: readonly string[]): string {
  return campos.map(escaparCampo).join(SEPARADOR);
}

export function generarCsv(filas: readonly FilaCsv[]): string {
  const lineas = [
    linea(ENCABEZADOS),
    ...filas.map((f) =>
      linea([
        mesDe(f.fecha),
        f.fecha,
        f.tipo === "gasto" ? "Gasto" : "Ingreso",
        etiquetaOrigen(f.tipo, f.origen),
        f.categoria ?? "",
        f.descripcion,
        montoCsv(f.monto),
      ]),
    ),
  ];
  return BOM + lineas.join(FIN_DE_LINEA) + FIN_DE_LINEA;
}
