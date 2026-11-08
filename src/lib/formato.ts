import { esMontoValido, type Centavos } from "./money";

function partes(centavos: Centavos) {
  const absoluto = Math.abs(centavos);
  return {
    signo: centavos < 0 ? "−" : "",
    enteros: Math.floor(absoluto / 100)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    decimales: String(absoluto % 100).padStart(2, "0"),
  };
}

export function formatearLempiras(centavos: Centavos): string {
  const { signo, enteros, decimales } = partes(centavos);
  return `${signo}L ${enteros}.${decimales}`;
}

export function formatearNumero(centavos: Centavos): string {
  const { signo, enteros, decimales } = partes(centavos);
  return decimales === "00"
    ? `${signo}${enteros}`
    : `${signo}${enteros}.${decimales}`;
}

export function formatearLempirasCompacto(centavos: Centavos): string {
  const signo = centavos < 0 ? "−" : "";
  return `${signo}L ${formatearNumero(Math.abs(centavos))}`;
}

export function parsearLempiras(texto: string): Centavos | null {
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(texto.trim().replace(/,/g, ""));
  if (!m) return null;
  const centavos = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
  return esMontoValido(centavos) ? centavos : null;
}
