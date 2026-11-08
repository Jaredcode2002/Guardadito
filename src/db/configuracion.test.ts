import { saldoAhorro } from "./ahorro";
import {
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  renombrarCategoria,
} from "./categorias";
import {
  agregarPendienteFijo,
  cambiarPendienteFijoActivo,
  depositarEnAhorro,
  editarPendienteFijo,
  eliminarPendienteFijo,
  registrarAhorroExistente,
} from "./configuracion";
import { listarMovimientosDelMes } from "./movimientos";
import {
  abrirMesesPendientes,
  pagarPendiente,
  registrarGasto,
  registrarIngreso,
} from "./operaciones";
import { listarPendientesDelMes, listarPlantillas } from "./pendientes";
import { el, prepararDb } from "./pruebas/prepararDb";
import { obtenerResumen } from "./resumen";

const NOV = "2026-11";
const QUINCE = el("2026-11-15");
const RENTA = { nombre: "Renta", monto: 450_000, diaDelMes: 10 };

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
  await abrirMesesPendientes(db, el("2026-11-01"));
  await registrarIngreso(db, { monto: 2_000_000 }, el("2026-11-01"));
});

afterEach(() => db.cerrar());

const resumen = () => obtenerResumen(db, NOV);
const pendientesNov = () => listarPendientesDelMes(db, NOV);

describe("agregar un pendiente fijo a mitad de mes", () => {
  it("aparece este mes y descuenta Libre y Libre inicial por igual", async () => {
    await agregarPendienteFijo(db, RENTA, QUINCE);

    const [renta] = await pendientesNov();
    expect(renta).toMatchObject({ nombre: "Renta", fechaVence: "2026-11-10" });
    expect(await resumen()).toMatchObject({
      libre: 1_550_000,
      libreInicial: 1_550_000,
      porcentaje: 1,
      estado: "ok",
    });
  });

  it("un nombre vacío se rechaza y no se crea nada", async () => {
    await expect(
      agregarPendienteFijo(db, { ...RENTA, nombre: "   " }, QUINCE),
    ).rejects.toThrow("nombre");
    expect(await listarPlantillas(db)).toHaveLength(0);
  });
});

describe("desactivar y reactivar", () => {
  it("si la copia del mes no está pagada, se quita y se devuelve al Libre inicial", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);

    await cambiarPendienteFijoActivo(db, id, false, QUINCE);

    expect(await pendientesNov()).toHaveLength(0);
    expect(await resumen()).toMatchObject({
      libre: 2_000_000,
      libreInicial: 2_000_000,
    });
  });

  it("reactivar la vuelve a poner este mes", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);
    await cambiarPendienteFijoActivo(db, id, false, QUINCE);

    await cambiarPendienteFijoActivo(db, id, true, QUINCE);

    expect(await pendientesNov()).toHaveLength(1);
    expect((await resumen()).libreInicial).toBe(1_550_000);
  });

  it("si ya se pagó, la copia queda en el historial y el Libre inicial no cambia", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);
    const [renta] = await pendientesNov();
    await pagarPendiente(db, renta.id, QUINCE);

    await cambiarPendienteFijoActivo(db, id, false, QUINCE);

    const [pagada] = await pendientesNov();
    expect(pagada.pagadoEn).not.toBeNull();
    expect((await resumen()).libreInicial).toBe(1_550_000);
  });

  it("una plantilla inactiva no se genera el mes siguiente", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);
    await cambiarPendienteFijoActivo(db, id, false, QUINCE);

    await abrirMesesPendientes(db, el("2026-12-01"));

    expect(await listarPendientesDelMes(db, "2026-12")).toHaveLength(0);
  });
});

describe("editar", () => {
  it("cambiar el monto ajusta la copia del mes y el Libre inicial por la diferencia", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);

    await editarPendienteFijo(
      db,
      id,
      { nombre: "Renta casa", monto: 500_000, diaDelMes: 31 },
      QUINCE,
    );

    const [renta] = await pendientesNov();
    expect(renta).toMatchObject({
      nombre: "Renta casa",
      monto: 500_000,
      fechaVence: "2026-11-30",
    });
    expect(await resumen()).toMatchObject({
      libre: 1_500_000,
      libreInicial: 1_500_000,
    });
  });

  it("si la copia ya se pagó, editar solo cambia los meses que vienen", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);
    const [renta] = await pendientesNov();
    await pagarPendiente(db, renta.id, QUINCE);

    await editarPendienteFijo(db, id, { ...RENTA, monto: 500_000 }, QUINCE);
    await abrirMesesPendientes(db, el("2026-12-01"));

    expect((await pendientesNov())[0].monto).toBe(450_000);
    expect((await listarPendientesDelMes(db, "2026-12"))[0].monto).toBe(
      500_000,
    );
  });
});

describe("eliminar", () => {
  it("sin pagar: se va la plantilla y su copia del mes", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);

    await eliminarPendienteFijo(db, id, QUINCE);

    expect(await listarPlantillas(db)).toHaveLength(0);
    expect(await pendientesNov()).toHaveLength(0);
    expect((await resumen()).libreInicial).toBe(2_000_000);
  });

  it("ya pagada: la copia queda en el historial, sin plantilla", async () => {
    const { id } = await agregarPendienteFijo(db, RENTA, QUINCE);
    const [renta] = await pendientesNov();
    await pagarPendiente(db, renta.id, QUINCE);

    await eliminarPendienteFijo(db, id, QUINCE);

    const [pagada] = await pendientesNov();
    expect(pagada).toMatchObject({ plantillaId: null, nombre: "Renta" });
    expect(pagada.pagadoEn).not.toBeNull();
  });
});

describe("ahorro desde Ajustes", () => {
  it("registrar lo que ya tenías ahorrado no toca tu Dinero", async () => {
    await registrarAhorroExistente(db, 600_000, QUINCE);

    expect(await saldoAhorro(db)).toBe(600_000);
    expect((await resumen()).dinero).toBe(2_000_000);
  });

  it("guardar desde tu Libre lo baja y sube el ahorro", async () => {
    await depositarEnAhorro(db, 500_000, QUINCE);

    expect(await saldoAhorro(db)).toBe(500_000);
    expect(await resumen()).toMatchObject({
      libre: 1_500_000,
      libreInicial: 2_000_000,
      ahorroTocadoSinReponer: false,
    });
  });

  it("no se puede guardar más de lo que hay libre", async () => {
    await agregarPendienteFijo(db, RENTA, QUINCE);

    await expect(depositarEnAhorro(db, 1_600_000, QUINCE)).rejects.toThrow(
      "Solo puedes guardar",
    );
    expect(await saldoAhorro(db)).toBe(0);
  });
});

describe("categorías", () => {
  it("vienen las de por defecto, en orden", async () => {
    expect((await listarCategorias(db, "gasto")).map((c) => c.nombre)).toEqual(
      ["Comida de la calle", "Ocio", "Transporte extra", "Otro"],
    );
  });

  it("crear agrega al final y rechaza duplicados del mismo tipo", async () => {
    await crearCategoria(db, "gasto", "  Mascotas ", QUINCE.ahora);

    const nombres = (await listarCategorias(db, "gasto")).map((c) => c.nombre);
    expect(nombres.at(-1)).toBe("Mascotas");
    await expect(
      crearCategoria(db, "gasto", "Mascotas", QUINCE.ahora),
    ).rejects.toThrow('Ya tienes una categoría llamada "Mascotas"');
    await expect(
      crearCategoria(db, "ingreso", "Mascotas", QUINCE.ahora),
    ).resolves.toBeGreaterThan(0);
  });

  it("renombrar cambia el nombre que se ve en los movimientos", async () => {
    const [ocio] = (await listarCategorias(db, "gasto")).filter(
      (c) => c.nombre === "Ocio",
    );
    await registrarGasto(db, { monto: 10_000, categoriaId: ocio.id }, QUINCE);

    await renombrarCategoria(db, ocio.id, "Salidas");

    const [gasto] = await listarMovimientosDelMes(db, NOV);
    expect(gasto.categoria).toBe("Salidas");
  });

  it("eliminar deja los movimientos sin categoría, sin borrarlos", async () => {
    const [ocio] = await listarCategorias(db, "gasto");
    await registrarGasto(db, { monto: 10_000, categoriaId: ocio.id }, QUINCE);

    await eliminarCategoria(db, ocio.id);

    const movimientos = await listarMovimientosDelMes(db, NOV);
    expect(movimientos).toHaveLength(2);
    expect(movimientos[0]).toMatchObject({ categoriaId: null, categoria: null });
  });
});
