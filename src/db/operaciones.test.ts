import { insertarMovimientoAhorro, saldoAhorro } from "./ahorro";
import { listarMeses, obtenerMes } from "./meses";
import { listarMovimientosDelMes } from "./movimientos";
import {
  abrirMesesPendientes,
  deshacerPago,
  pagarPendiente,
  previsualizarGasto,
  registrarGasto,
  registrarIngreso,
} from "./operaciones";
import {
  crearPlantilla,
  desactivarPlantilla,
  listarPendientesDelMes,
  listarPendientesSinPagar,
} from "./pendientes";
import { el, prepararDb } from "./pruebas/prepararDb";
import { obtenerResumen } from "./resumen";

const NOV = "2026-11";
const SUELDO = 2_000_000;
const LUZ = 80_000;
const AGUA = 20_000;

let db: Awaited<ReturnType<typeof prepararDb>>;
let luzId: number;
let aguaId: number;

beforeEach(async () => {
  db = await prepararDb();
  luzId = await crearPlantilla(
    db,
    { nombre: "Luz", monto: LUZ, diaDelMes: 10 },
    el("2026-11-01").ahora,
  );
  aguaId = await crearPlantilla(
    db,
    { nombre: "Agua", monto: AGUA, diaDelMes: 31 },
    el("2026-11-01").ahora,
  );
});

afterEach(() => db.cerrar());

async function empezarNoviembreConSueldo() {
  await abrirMesesPendientes(db, el("2026-11-01"));
  await registrarIngreso(
    db,
    { monto: SUELDO, descripcion: "Sueldo" },
    el("2026-11-01"),
  );
}

const resumen = (mes = NOV) => obtenerResumen(db, mes);

async function guardarAhorroInicial(monto: number) {
  await insertarMovimientoAhorro(
    db,
    { monto, motivo: "saldo_inicial", fecha: "2026-11-01" },
    el("2026-11-01").ahora,
  );
}

describe("abrirMesesPendientes", () => {
  it("la primera vez abre el mes actual y genera sus pendientes", async () => {
    expect(await abrirMesesPendientes(db, el("2026-11-07"))).toEqual([NOV]);

    const pendientes = await listarPendientesDelMes(db, NOV);
    expect(pendientes.map((p) => [p.nombre, p.fechaVence])).toEqual([
      ["Luz", "2026-11-10"],
      ["Agua", "2026-11-30"],
    ]);
    expect((await obtenerMes(db, NOV))?.libreInicialBase).toBe(-100_000);
  });

  it("abrir otra vez el mismo mes no hace nada", async () => {
    await abrirMesesPendientes(db, el("2026-11-07"));
    expect(await abrirMesesPendientes(db, el("2026-11-20"))).toEqual([]);
    expect(await listarPendientesDelMes(db, NOV)).toHaveLength(2);
  });

  it("si la app no se abrió en meses, abre cada uno y acota el día 31", async () => {
    await abrirMesesPendientes(db, el("2026-11-07"));

    expect(await abrirMesesPendientes(db, el("2027-02-15"))).toEqual([
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
    const febrero = await listarPendientesDelMes(db, "2027-02");
    expect(febrero.find((p) => p.nombre === "Agua")?.fechaVence).toBe(
      "2027-02-28",
    );
  });

  it("una plantilla desactivada ya no genera pendientes", async () => {
    await abrirMesesPendientes(db, el("2026-11-07"));
    await desactivarPlantilla(db, aguaId);
    await abrirMesesPendientes(db, el("2026-12-01"));

    const diciembre = await listarPendientesDelMes(db, "2026-12");
    expect(diciembre.map((p) => p.nombre)).toEqual(["Luz"]);
  });
});

describe("resumen del mes", () => {
  it("con sueldo y dos pendientes", async () => {
    await empezarNoviembreConSueldo();

    expect(await resumen()).toMatchObject({
      dinero: 2_000_000,
      pendientesSinPagar: 100_000,
      libre: 1_900_000,
      libreInicial: 1_900_000,
      porcentaje: 1,
      estado: "ok",
      ahorroTocadoSinReponer: false,
      saldoAhorro: 0,
    });
  });

  it("falla si el mes no se ha abierto", async () => {
    await expect(resumen("2030-01")).rejects.toThrow("no está abierto");
  });
});

describe("pagar y deshacer un pendiente", () => {
  it("pagar baja el Dinero pero el Libre no cambia", async () => {
    await empezarNoviembreConSueldo();
    const [luz] = await listarPendientesSinPagar(db);

    await pagarPendiente(db, luz.id, el("2026-11-09"));

    const r = await resumen();
    expect(r.dinero).toBe(SUELDO - LUZ);
    expect(r.libre).toBe(1_900_000);
    expect((await listarPendientesSinPagar(db)).map((p) => p.nombre)).toEqual([
      "Agua",
    ]);
    const movs = await listarMovimientosDelMes(db, NOV);
    expect(movs[0]).toMatchObject({
      tipo: "gasto",
      monto: LUZ,
      origen: "pendiente",
      descripcion: "Luz",
      fecha: "2026-11-09",
    });
  });

  it("no se puede pagar dos veces", async () => {
    await empezarNoviembreConSueldo();
    const [luz] = await listarPendientesSinPagar(db);
    await pagarPendiente(db, luz.id, el("2026-11-09"));

    await expect(pagarPendiente(db, luz.id, el("2026-11-09"))).rejects.toThrow(
      "ya está pagado",
    );
  });

  it("deshacer borra el gasto y el pendiente vuelve", async () => {
    await empezarNoviembreConSueldo();
    const [luz] = await listarPendientesSinPagar(db);
    await pagarPendiente(db, luz.id, el("2026-11-09"));

    await deshacerPago(db, luz.id);

    const r = await resumen();
    expect(r.dinero).toBe(SUELDO);
    expect(r.libre).toBe(1_900_000);
    expect(await listarPendientesSinPagar(db)).toHaveLength(2);
    expect(await listarMovimientosDelMes(db, NOV)).toHaveLength(1);
  });

  it("no se puede deshacer algo que no está pagado", async () => {
    await empezarNoviembreConSueldo();
    await expect(deshacerPago(db, luzId)).rejects.toThrow("no está pagado");
  });
});

describe("gastos y ahorro", () => {
  it("gasto exacto al Libre: no toca ahorro y el frasco queda vacío", async () => {
    await empezarNoviembreConSueldo();

    const r = await registrarGasto(db, { monto: 1_900_000 }, el("2026-11-15"));

    expect(r.ahorroUsado).toBe(0);
    expect(r.alerta).toBe("cero");
    expect(await resumen()).toMatchObject({
      libre: 0,
      estado: "zero",
      saldoAhorro: 0,
    });
  });

  it("gasto mayor al Libre: toca la diferencia y el frasco se rompe", async () => {
    await empezarNoviembreConSueldo();
    await guardarAhorroInicial(500_000);

    expect(await previsualizarGasto(db, 2_000_000)).toEqual({
      gasto: 2_000_000,
      desdeLibre: 1_900_000,
      desdeAhorro: 100_000,
      enNegativo: 0,
    });
    const r = await registrarGasto(
      db,
      { monto: 2_000_000, descripcion: "Celular" },
      el("2026-11-15"),
    );

    expect(r.ahorroUsado).toBe(100_000);
    expect(r.enNegativo).toBe(0);
    expect(r.alerta).toBe("cero");
    expect(await resumen()).toMatchObject({
      libre: 0,
      estado: "roto",
      ahorroTocadoSinReponer: true,
      saldoAhorro: 400_000,
    });
    const movs = await listarMovimientosDelMes(db, NOV);
    expect(movs.map((m) => [m.tipo, m.origen, m.monto])).toEqual([
      ["ingreso", "ahorro", 100_000],
      ["gasto", "normal", 2_000_000],
      ["ingreso", "normal", SUELDO],
    ]);
  });

  it("si el ahorro no alcanza, se vacía y el resto deja el Dinero en negativo", async () => {
    await empezarNoviembreConSueldo();
    await guardarAhorroInicial(30_000);

    const r = await registrarGasto(db, { monto: 2_000_000 }, el("2026-11-15"));

    expect(r.ahorroUsado).toBe(30_000);
    expect(r.enNegativo).toBe(70_000);
    expect(await resumen()).toMatchObject({
      dinero: 30_000,
      libre: -70_000,
      saldoAhorro: 0,
      estado: "roto",
    });
  });

  it("sin ahorro, el gasto se registra y el Dinero queda en negativo", async () => {
    await empezarNoviembreConSueldo();

    const r = await registrarGasto(db, { monto: 2_000_000 }, el("2026-11-15"));

    expect(r.ahorroUsado).toBe(0);
    expect(r.enNegativo).toBe(100_000);
    expect(await resumen()).toMatchObject({
      libre: -100_000,
      saldoAhorro: 0,
      ahorroTocadoSinReponer: false,
      estado: "roto",
    });
    expect(await listarMovimientosDelMes(db, NOV)).toHaveLength(2);
  });

  it("ningún retiro puede dejar el ahorro bajo 0", async () => {
    await guardarAhorroInicial(30_000);

    await expect(
      insertarMovimientoAhorro(
        db,
        { monto: -30_001, motivo: "retiro", fecha: "2026-11-15" },
        el("2026-11-15").ahora,
      ),
    ).rejects.toThrow("El ahorro no alcanza");
    expect(await saldoAhorro(db)).toBe(30_000);
  });

  it("un ingreso después de tocar ahorro repara el frasco", async () => {
    await empezarNoviembreConSueldo();
    await guardarAhorroInicial(500_000);
    await registrarGasto(db, { monto: 2_000_000 }, el("2026-11-15"));

    await registrarIngreso(db, { monto: 50_000 }, el("2026-11-20"));

    expect(await resumen()).toMatchObject({
      libre: 50_000,
      libreInicial: 1_950_000,
      ahorroTocadoSinReponer: false,
      estado: "crit",
    });
  });

  it("el ingreso que viene del ahorro no infla el Libre inicial", async () => {
    await empezarNoviembreConSueldo();
    await guardarAhorroInicial(500_000);
    await registrarGasto(db, { monto: 2_000_000 }, el("2026-11-15"));

    expect((await resumen()).libreInicial).toBe(1_900_000);
  });

  it("un monto con decimales se rechaza y no se guarda nada", async () => {
    await empezarNoviembreConSueldo();

    await expect(
      registrarGasto(db, { monto: 10.5 }, el("2026-11-15")),
    ).rejects.toThrow("Monto inválido");
    expect(await listarMovimientosDelMes(db, NOV)).toHaveLength(1);
  });
});

describe("alertas guardadas en el mes", () => {
  it("se disparan una vez y un ingreso las re-arma", async () => {
    await empezarNoviembreConSueldo();

    const primera = await registrarGasto(
      db,
      { monto: 1_400_000 },
      el("2026-11-10"),
    );
    expect(primera.alerta).toBe("moderacion");

    const segunda = await registrarGasto(db, { monto: 10_000 }, el("2026-11-11"));
    expect(segunda.alerta).toBeNull();

    await registrarIngreso(db, { monto: 1_000_000 }, el("2026-11-12"));
    expect((await obtenerMes(db, NOV))?.alertasDisparadas).toEqual([]);

    const tercera = await registrarGasto(
      db,
      { monto: 1_000_000 },
      el("2026-11-13"),
    );
    expect(tercera.alerta).toBe("moderacion");
  });
});

describe("cierre de mes", () => {
  it("el Libre que sobró pasa al ahorro el último día del mes", async () => {
    await empezarNoviembreConSueldo();
    for (const p of await listarPendientesSinPagar(db)) {
      await pagarPendiente(db, p.id, el("2026-11-10"));
    }
    await registrarGasto(db, { monto: 1_600_000 }, el("2026-11-20"));
    expect((await resumen()).libre).toBe(300_000);

    await abrirMesesPendientes(db, el("2026-12-01"));

    expect((await obtenerMes(db, NOV))?.cerradoEn).not.toBeNull();
    const [sobrante] = await listarMovimientosDelMes(db, NOV);
    expect(sobrante).toMatchObject({
      tipo: "gasto",
      origen: "sobrante",
      monto: 300_000,
      fecha: "2026-11-30",
    });
    expect(await saldoAhorro(db)).toBe(300_000);
    expect(await resumen("2026-12")).toMatchObject({
      dinero: 0,
      libre: -100_000,
      libreInicial: -100_000,
      estado: "zero",
    });
  });

  it("sin Libre no se mueve nada y los pendientes atrasados siguen apartados", async () => {
    await abrirMesesPendientes(db, el("2026-11-01"));

    await abrirMesesPendientes(db, el("2026-12-01"));

    expect(await saldoAhorro(db)).toBe(0);
    expect(await resumen("2026-12")).toMatchObject({
      pendientesSinPagar: 200_000,
      libre: -200_000,
    });
  });

  it("al entrar el sueldo del mes nuevo, el Libre inicial ya descuenta sus pendientes", async () => {
    await empezarNoviembreConSueldo();
    await abrirMesesPendientes(db, el("2026-12-01"));

    await registrarIngreso(db, { monto: SUELDO }, el("2026-12-01"));

    expect(await resumen("2026-12")).toMatchObject({
      libre: 1_900_000,
      libreInicial: 1_900_000,
      saldoAhorro: 1_900_000,
      estado: "ok",
    });
  });
});

describe("listarMeses", () => {
  it("devuelve los meses abiertos del más reciente al más antiguo", async () => {
    await abrirMesesPendientes(db, el("2026-10-03"));
    await abrirMesesPendientes(db, el("2026-12-01"));

    expect(await listarMeses(db)).toEqual(["2026-12", "2026-11", "2026-10"]);
  });
});
