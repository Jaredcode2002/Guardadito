import type { Movimiento } from "@/db";
import {
  COLOR_PENDIENTES,
  COLOR_SIN_CATEGORIA,
  hexDeColor,
} from "@/lib/colores";
import type { Centavos } from "@/lib/money";

export type GastoCategoria = {
  clave: string;
  nombre: string;
  monto: Centavos;
  porcentaje: number;
  color: string;
};

export function gastosPorCategoria(
  movimientos: readonly Movimiento[],
): GastoCategoria[] {
  const grupos = new Map<string, Omit<GastoCategoria, "porcentaje">>();
  const sumar = (clave: string, nombre: string, color: string, monto: Centavos) => {
    const actual = grupos.get(clave);
    grupos.set(clave, {
      clave,
      nombre,
      color,
      monto: (actual?.monto ?? 0) + monto,
    });
  };

  for (const m of movimientos) {
    if (m.tipo !== "gasto") continue;
    if (m.origen === "pendiente") {
      sumar("pendientes", "Pendientes", COLOR_PENDIENTES, m.monto);
    } else if (m.origen === "normal") {
      if (m.categoriaId === null || m.categoria === null) {
        sumar("sin", "Sin categoría", COLOR_SIN_CATEGORIA, m.monto);
      } else {
        sumar(
          `c${m.categoriaId}`,
          m.categoria,
          hexDeColor(m.categoriaColor ?? ""),
          m.monto,
        );
      }
    }
  }

  const lista = [...grupos.values()];
  const total = lista.reduce((s, g) => s + g.monto, 0);
  return lista
    .map((g) => ({ ...g, porcentaje: total > 0 ? g.monto / total : 0 }))
    .sort((a, b) => b.monto - a.monto || a.nombre.localeCompare(b.nombre, "es"));
}

export function totalGastado(grupos: readonly GastoCategoria[]): Centavos {
  return grupos.reduce((s, g) => s + g.monto, 0);
}

export function textoPorcentaje(p: number): string {
  if (p > 0 && p < 0.01) return "<1%";
  return `${Math.round(p * 100)}%`;
}

export type Sector = { clave: string; d: string };

function punto(cx: number, cy: number, r: number, angulo: number) {
  return {
    x: cx + r * Math.sin(angulo),
    y: cy - r * Math.cos(angulo),
  };
}

function redondear(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function caminoSector(
  cx: number,
  cy: number,
  exterior: number,
  interior: number,
  inicio: number,
  fin: number,
): string {
  const grande = fin - inicio > Math.PI ? 1 : 0;
  const a = punto(cx, cy, exterior, inicio);
  const b = punto(cx, cy, exterior, fin);
  const c = punto(cx, cy, interior, fin);
  const d = punto(cx, cy, interior, inicio);
  const p = (q: { x: number; y: number }) => `${redondear(q.x)} ${redondear(q.y)}`;
  return [
    `M${p(a)}`,
    `A${exterior} ${exterior} 0 ${grande} 1 ${p(b)}`,
    `L${p(c)}`,
    `A${interior} ${interior} 0 ${grande} 0 ${p(d)}`,
    "Z",
  ].join(" ");
}

export function sectoresDona(
  grupos: readonly { clave: string; monto: number }[],
  cx: number,
  cy: number,
  exterior: number,
  interior: number,
): Sector[] {
  const total = grupos.reduce((s, g) => s + g.monto, 0);
  if (total <= 0) return [];
  const visibles = grupos.filter((g) => g.monto > 0);
  if (visibles.length === 1) {
    const g = visibles[0];
    return [
      {
        clave: g.clave,
        d: `${caminoSector(cx, cy, exterior, interior, 0, Math.PI)} ${caminoSector(cx, cy, exterior, interior, Math.PI, 2 * Math.PI)}`,
      },
    ];
  }
  const sectores: Sector[] = [];
  let inicio = 0;
  for (const g of visibles) {
    const fin = inicio + (g.monto / total) * 2 * Math.PI;
    sectores.push({
      clave: g.clave,
      d: caminoSector(cx, cy, exterior, interior, inicio, fin),
    });
    inicio = fin;
  }
  return sectores;
}
