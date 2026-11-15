export const TABLAS_RESPALDO = {
  categoria: ["id", "tipo", "nombre", "orden", "creado_en", "color"],
  mes: [
    "id",
    "libre_inicial_base",
    "alertas_disparadas",
    "abierto_en",
    "cerrado_en",
  ],
  movimiento: [
    "id",
    "tipo",
    "monto",
    "descripcion",
    "origen",
    "fecha",
    "creado_en",
    "categoria_id",
  ],
  plantilla_pendiente: [
    "id",
    "nombre",
    "monto",
    "dia_del_mes",
    "activa",
    "creado_en",
  ],
  pendiente_mes: [
    "id",
    "plantilla_id",
    "mes_id",
    "nombre",
    "monto",
    "fecha_vence",
    "pagado_en",
    "movimiento_id",
  ],
  ahorro_movimiento: [
    "id",
    "monto",
    "motivo",
    "movimiento_id",
    "fecha",
    "creado_en",
  ],
  ajuste: ["clave", "valor"],
} as const satisfies Record<string, readonly string[]>;

export type TablaRespaldo = keyof typeof TABLAS_RESPALDO;

export const NOMBRES_TABLAS = Object.keys(TABLAS_RESPALDO) as TablaRespaldo[];

export const CLAVES_AJUSTE_LOCALES = ["ultimo_respaldo"] as const;

export const TIPO_RESPALDO = "application/json";

export function nombreArchivoRespaldo(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, "0");
  const dia = `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
  return `guardadito-respaldo-${dia}-${dos(fecha.getHours())}${dos(fecha.getMinutes())}.json`;
}

const MARCA_APP = "guardadito";

export type ValorFila = string | number | null;
export type Fila = Record<string, ValorFila>;
export type TablasRespaldo = Record<TablaRespaldo, Fila[]>;

export type Respaldo = {
  app: typeof MARCA_APP;
  version: number;
  creadoEn: string;
  tablas: TablasRespaldo;
};

export type ResultadoValidacion =
  | { ok: true; respaldo: Respaldo }
  | { ok: false; error: string };

export function generarRespaldo(datos: {
  version: number;
  creadoEn: string;
  tablas: TablasRespaldo;
}): string {
  const tablas = {} as TablasRespaldo;
  for (const tabla of NOMBRES_TABLAS) {
    const columnas = TABLAS_RESPALDO[tabla];
    tablas[tabla] = datos.tablas[tabla].map((fila) => {
      const ordenada: Fila = {};
      for (const columna of columnas) ordenada[columna] = fila[columna] ?? null;
      return ordenada;
    });
  }
  const respaldo: Respaldo = {
    app: MARCA_APP,
    version: datos.version,
    creadoEn: datos.creadoEn,
    tablas,
  };
  return JSON.stringify(respaldo);
}

export function validarRespaldo(
  texto: string,
  versionEsperada: number,
): ResultadoValidacion {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return { ok: false, error: "El archivo no es un respaldo válido (JSON dañado)." };
  }

  if (!esObjeto(datos) || datos.app !== MARCA_APP) {
    return { ok: false, error: "El archivo no es un respaldo de Guardadito." };
  }
  if (!Number.isInteger(datos.version)) {
    return { ok: false, error: "El respaldo no indica su versión." };
  }
  if (datos.version !== versionEsperada) {
    return {
      ok: false,
      error: `El respaldo es de otra versión de la app (v${String(datos.version)}, se esperaba v${versionEsperada}).`,
    };
  }
  if (typeof datos.creadoEn !== "string" || Number.isNaN(Date.parse(datos.creadoEn))) {
    return { ok: false, error: "El respaldo no tiene una fecha válida." };
  }
  if (!esObjeto(datos.tablas)) {
    return { ok: false, error: "El respaldo no tiene tablas." };
  }

  for (const tabla of NOMBRES_TABLAS) {
    const filas = datos.tablas[tabla];
    if (!Array.isArray(filas)) {
      return { ok: false, error: `Falta la tabla "${tabla}" en el respaldo.` };
    }
    const columnas: readonly string[] = TABLAS_RESPALDO[tabla];
    for (const [i, fila] of filas.entries()) {
      const problema = problemaDeFila(fila, columnas);
      if (problema) {
        return {
          ok: false,
          error: `Fila ${i + 1} de "${tabla}": ${problema}.`,
        };
      }
    }
  }

  const sobrantes = Object.keys(datos.tablas).filter(
    (t) => !NOMBRES_TABLAS.includes(t as TablaRespaldo),
  );
  if (sobrantes.length > 0) {
    return {
      ok: false,
      error: `El respaldo trae tablas desconocidas: ${sobrantes.join(", ")}.`,
    };
  }

  return { ok: true, respaldo: datos as Respaldo };
}

function problemaDeFila(
  fila: unknown,
  columnas: readonly string[],
): string | null {
  if (!esObjeto(fila)) return "no es un objeto";
  const claves = Object.keys(fila);
  const faltan = columnas.filter((c) => !(c in fila));
  if (faltan.length > 0) return `faltan columnas (${faltan.join(", ")})`;
  const sobran = claves.filter((c) => !columnas.includes(c));
  if (sobran.length > 0) return `columnas desconocidas (${sobran.join(", ")})`;
  for (const columna of columnas) {
    if (!esValorFila(fila[columna])) return `valor inválido en "${columna}"`;
  }
  return null;
}

function esValorFila(valor: unknown): valor is ValorFila {
  return (
    valor === null ||
    typeof valor === "string" ||
    (typeof valor === "number" && Number.isFinite(valor))
  );
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
