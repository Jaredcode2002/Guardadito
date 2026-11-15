import {
  generarRespaldo,
  nombreArchivoRespaldo,
  NOMBRES_TABLAS,
  validarRespaldo,
  type TablasRespaldo,
} from "./respaldo";

describe("nombreArchivoRespaldo", () => {
  it("lleva fecha y hora local con ceros a la izquierda", () => {
    expect(nombreArchivoRespaldo(new Date(2026, 10, 5, 8, 3))).toBe(
      "guardadito-respaldo-2026-11-05-0803.json",
    );
    expect(nombreArchivoRespaldo(new Date(2026, 11, 31, 23, 59))).toBe(
      "guardadito-respaldo-2026-12-31-2359.json",
    );
  });
});

function tablasVacias(): TablasRespaldo {
  return Object.fromEntries(NOMBRES_TABLAS.map((t) => [t, []])) as unknown as TablasRespaldo;
}

function tablasDeEjemplo(): TablasRespaldo {
  return {
    ...tablasVacias(),
    categoria: [
      {
        color: "azul",
        id: 1,
        tipo: "gasto",
        nombre: "Comida, \"rica\"",
        orden: 1,
        creado_en: "2026-11-01T00:00:00.000Z",
      },
    ],
    movimiento: [
      {
        id: 7,
        tipo: "gasto",
        monto: 15050,
        descripcion: "Baleadas ñ",
        origen: "normal",
        fecha: "2026-11-02",
        creado_en: "2026-11-02T12:00:00.000Z",
        categoria_id: null,
      },
    ],
    ajuste: [{ clave: "paleta", valor: "noche" }],
  };
}

const CREADO = "2026-11-15T20:30:00.000Z";

describe("generarRespaldo", () => {
  it("incluye marca, versión, fecha y todas las tablas en orden", () => {
    const texto = generarRespaldo({ version: 4, creadoEn: CREADO, tablas: tablasVacias() });
    const datos = JSON.parse(texto);
    expect(datos.app).toBe("guardadito");
    expect(datos.version).toBe(4);
    expect(datos.creadoEn).toBe(CREADO);
    expect(Object.keys(datos.tablas)).toEqual(NOMBRES_TABLAS);
  });

  it("ordena las columnas como el esquema y conserva los valores", () => {
    const texto = generarRespaldo({ version: 4, creadoEn: CREADO, tablas: tablasDeEjemplo() });
    const datos = JSON.parse(texto);
    expect(Object.keys(datos.tablas.categoria[0])).toEqual([
      "id",
      "tipo",
      "nombre",
      "orden",
      "creado_en",
      "color",
    ]);
    expect(datos.tablas.movimiento[0].descripcion).toBe("Baleadas ñ");
    expect(datos.tablas.movimiento[0].categoria_id).toBeNull();
  });

  it("deja fuera columnas que no son del esquema", () => {
    const tablas = tablasVacias();
    tablas.ajuste = [{ clave: "x", valor: "1", extra: "no" }];
    const datos = JSON.parse(generarRespaldo({ version: 4, creadoEn: CREADO, tablas }));
    expect(datos.tablas.ajuste[0]).toEqual({ clave: "x", valor: "1" });
  });
});

describe("validarRespaldo", () => {
  const valido = () =>
    JSON.parse(generarRespaldo({ version: 4, creadoEn: CREADO, tablas: tablasDeEjemplo() }));

  it("acepta lo que genera generarRespaldo", () => {
    const texto = generarRespaldo({ version: 4, creadoEn: CREADO, tablas: tablasDeEjemplo() });
    const r = validarRespaldo(texto, 4);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.respaldo.tablas.movimiento[0].monto).toBe(15050);
  });

  it("rechaza JSON dañado", () => {
    expect(validarRespaldo("{no es json", 4)).toEqual({
      ok: false,
      error: expect.stringContaining("JSON dañado"),
    });
  });

  it("rechaza archivos que no son de Guardadito", () => {
    for (const texto of ["[]", "null", '{"app":"otra"}']) {
      expect(validarRespaldo(texto, 4)).toEqual({
        ok: false,
        error: "El archivo no es un respaldo de Guardadito.",
      });
    }
  });

  it("rechaza otra versión del esquema", () => {
    const datos = { ...valido(), version: 3 };
    const r = validarRespaldo(JSON.stringify(datos), 4);
    expect(r).toEqual({ ok: false, error: expect.stringContaining("v3") });
  });

  it("rechaza versión o fecha ausentes", () => {
    const sinVersion = { ...valido(), version: "4" };
    expect(validarRespaldo(JSON.stringify(sinVersion), 4).ok).toBe(false);
    const sinFecha = { ...valido(), creadoEn: "ayer" };
    expect(validarRespaldo(JSON.stringify(sinFecha), 4).ok).toBe(false);
  });

  it("rechaza si falta una tabla o sobra otra", () => {
    const datos = valido();
    delete datos.tablas.mes;
    expect(validarRespaldo(JSON.stringify(datos), 4)).toEqual({
      ok: false,
      error: 'Falta la tabla "mes" en el respaldo.',
    });

    const conExtra = valido();
    conExtra.tablas.intrusa = [];
    expect(validarRespaldo(JSON.stringify(conExtra), 4)).toEqual({
      ok: false,
      error: "El respaldo trae tablas desconocidas: intrusa.",
    });
  });

  it("rechaza filas con columnas de más, de menos o valores raros", () => {
    const faltan = valido();
    delete faltan.tablas.movimiento[0].monto;
    expect(validarRespaldo(JSON.stringify(faltan), 4)).toEqual({
      ok: false,
      error: 'Fila 1 de "movimiento": faltan columnas (monto).',
    });

    const sobran = valido();
    sobran.tablas.ajuste[0].otra = 1;
    expect(validarRespaldo(JSON.stringify(sobran), 4)).toEqual({
      ok: false,
      error: 'Fila 1 de "ajuste": columnas desconocidas (otra).',
    });

    const raro = valido();
    raro.tablas.movimiento[0].monto = { centavos: 1 };
    expect(validarRespaldo(JSON.stringify(raro), 4)).toEqual({
      ok: false,
      error: 'Fila 1 de "movimiento": valor inválido en "monto".',
    });

    const noObjeto = valido();
    noObjeto.tablas.mes = [[1, 2]];
    expect(validarRespaldo(JSON.stringify(noObjeto), 4)).toEqual({
      ok: false,
      error: 'Fila 1 de "mes": no es un objeto.',
    });
  });
});
