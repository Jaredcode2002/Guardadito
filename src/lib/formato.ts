import { esMontoValido, type Centavos } from "./money";

export function formatearLempiras(centavos: Centavos): string {
  const signo = centavos < 0 ? "−" : "";
  const absoluto = Math.abs(centavos);
  const enteros = Math.floor(absoluto / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimales = String(absoluto % 100).padStart(2, "0");
  return `${signo}L ${enteros}.${decimales}`;
}

export function parsearLempiras(texto: string): Centavos | null {
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(texto.trim().replace(/,/g, ""));
  if (!m) return null;
  const centavos = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
  return esMontoValido(centavos) ? centavos : null;
}
