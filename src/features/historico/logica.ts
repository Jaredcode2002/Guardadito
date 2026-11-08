import type { Movimiento } from "@/db";
import { fechaLarga, type Fecha } from "@/lib/fechas";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import type { Centavos } from "@/lib/money";

export type TipoFila = "gasto" | "ingreso" | "pendiente" | "alAhorro";

export type FilaHistorico = {
  id: number;
  fecha: Fecha;
  tipo: TipoFila;
  titulo: string;
  subtitulo: string;
  monto: Centavos;
  etiqueta: string | null;
  categoriaId: number | null;
};

export type DiaHistorico = {
  fecha: Fecha;
  titulo: string;
  filas: FilaHistorico[];
};

export type TotalesHistorico = {
  ingresos: Centavos;
  gastos: Centavos;
  ahorroUsado: Centavos;
  alAhorro: Centavos;
};

export type CategoriaDelMes = {
  id: number;
  texto: string;
};

function clave(m: Movimiento): string {
  return `${m.fecha}|${m.creadoEn}`;
}

function esCubiertoPorAhorro(m: Movimiento): boolean {
  return m.tipo === "ingreso" && m.origen === "ahorro";
}

function subtituloConCategoria(
  categoria: string | null,
  titulo: string,
  porDefecto: string,
): string {
  return categoria && categoria !== titulo ? categoria : porDefecto;
}

function aFila(m: Movimiento, tocaronAhorro: Set<string>): FilaHistorico {
  const base = {
    id: m.id,
    fecha: m.fecha,
    monto: m.monto,
    categoriaId: m.categoriaId,
  };
  const descripcion = m.descripcion.trim();

  if (m.tipo === "ingreso") {
    const titulo = descripcion || m.categoria || "Ingreso";
    return {
      ...base,
      tipo: "ingreso",
      titulo,
      subtitulo: subtituloConCategoria(m.categoria, titulo, "Ingreso"),
      etiqueta: null,
    };
  }

  if (m.origen === "pendiente") {
    return {
      ...base,
      tipo: "pendiente",
      titulo: descripcion || "Pendiente",
      subtitulo: "Pendiente pagado",
      etiqueta: "Pendiente",
    };
  }

  if (m.origen === "ahorro" || m.origen === "sobrante") {
    return {
      ...base,
      tipo: "alAhorro",
      titulo: "Al ahorro",
      subtitulo: m.origen === "sobrante" ? "Sobrante del mes" : "Desde tu libre",
      etiqueta: null,
    };
  }

  const titulo = descripcion || m.categoria || "Gasto";
  return {
    ...base,
    tipo: "gasto",
    titulo,
    subtitulo: subtituloConCategoria(m.categoria, titulo, "Gasto"),
    etiqueta: tocaronAhorro.has(clave(m)) ? "Tocó ahorro" : null,
  };
}

export function armarFilas(movimientos: readonly Movimiento[]): FilaHistorico[] {
  const tocaronAhorro = new Set(
    movimientos.filter(esCubiertoPorAhorro).map(clave),
  );
  return movimientos
    .filter((m) => !esCubiertoPorAhorro(m))
    .map((m) => aFila(m, tocaronAhorro));
}

export function filtrarPorCategoria(
  filas: readonly FilaHistorico[],
  categoriaId: number | null,
): FilaHistorico[] {
  return categoriaId === null
    ? [...filas]
    : filas.filter((f) => f.categoriaId === categoriaId);
}

export function agruparPorDia(filas: readonly FilaHistorico[]): DiaHistorico[] {
  const dias: DiaHistorico[] = [];
  for (const f of filas) {
    const ultimo = dias[dias.length - 1];
    if (ultimo && ultimo.fecha === f.fecha) {
      ultimo.filas.push(f);
    } else {
      dias.push({ fecha: f.fecha, titulo: fechaLarga(f.fecha), filas: [f] });
    }
  }
  return dias;
}

export function totalesDelMes(
  movimientos: readonly Movimiento[],
): TotalesHistorico {
  const t: TotalesHistorico = {
    ingresos: 0,
    gastos: 0,
    ahorroUsado: 0,
    alAhorro: 0,
  };
  for (const m of movimientos) {
    if (m.tipo === "ingreso") {
      if (m.origen === "ahorro") t.ahorroUsado += m.monto;
      else t.ingresos += m.monto;
    } else if (m.origen === "ahorro" || m.origen === "sobrante") {
      t.alAhorro += m.monto;
    } else {
      t.gastos += m.monto;
    }
  }
  return t;
}

export function categoriasDelMes(
  movimientos: readonly Movimiento[],
): CategoriaDelMes[] {
  const vistas = new Map<number, { nombre: string; tipo: string }>();
  for (const m of movimientos) {
    if (m.categoriaId !== null && m.categoria !== null && !esCubiertoPorAhorro(m)) {
      vistas.set(m.categoriaId, { nombre: m.categoria, tipo: m.tipo });
    }
  }
  const lista = [...vistas.entries()].sort(
    ([, a], [, b]) =>
      a.tipo.localeCompare(b.tipo) || a.nombre.localeCompare(b.nombre, "es"),
  );
  const repetidos = new Set(
    lista
      .map(([, c]) => c.nombre)
      .filter((n, i, todos) => todos.indexOf(n) !== i),
  );
  return lista.map(([id, c]) => ({
    id,
    texto:
      repetidos.has(c.nombre) && c.tipo === "ingreso"
        ? `${c.nombre} · ingreso`
        : c.nombre,
  }));
}

export function resumenDelFiltro(filas: readonly FilaHistorico[]): string {
  const total = filas.reduce((s, f) => s + f.monto, 0);
  const cuantos = filas.length === 1 ? "1 movimiento" : `${filas.length} movimientos`;
  return `${cuantos} · ${L(total)}`;
}

export function signoDe(tipo: TipoFila): "+" | "−" {
  return tipo === "ingreso" ? "+" : "−";
}
