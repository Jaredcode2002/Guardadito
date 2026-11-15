import { insertarMovimientoAhorro, saldoAhorro } from "./ahorro";
import {
  borrarMesesHasta,
  mesesBorrables,
  previsualizarBorrado,
} from "./historial";
import { listarMeses } from "./meses";
import { listarMovimientosDelMes } from "./movimientos";
import {
  abrirMesesPendientes,
  pagarPendiente,
  registrarGasto,
  registrarIngreso,
} from "./operaciones";
import {
  crearPlantilla,
  listarPendientesDelMes,
  listarPlantillas,
} from "./pendientes";
import { el, prepararDb } from "./pruebas/prepararDb";
import { obtenerResumen } from "./resumen";

const LUZ = 80_000;

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
  await crearPlantilla(
    db,
    { nombre: "Luz", monto: LUZ, diaDelMes: 10 },
    el("2026-09-01").ahora,
  );
});

afterEach(() => db.cerrar());

async function pagarLuz(mes: string, dia: string) {
  const [luz] = await listarPendientesDelMes(db, mes);
  await pagarPendiente(db, luz.id, el(dia));
}

async function mesNormal(mes: string, sueldo: number, gasto: number) {
  await abrirMesesPendientes(db, el(`${mes}-01`));
  await registrarIngreso(db, { monto: sueldo }, el(`${mes}-02`));
  await registrarGasto(db, { monto: gasto }, el(`${mes}-05`));
  await pagarLuz(mes, `${mes}-09`);
}

async function foto(mes: string) {
  return {
    resumen: await obtenerResumen(db, mes),
    movimientos: await listarMovimientosDelMes(db, mes),
    saldoAhorro: await saldoAhorro(db),
  };
}

async function contar(tabla: string) {
  const fila = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM ${tabla}`,
    [],
  );
  return fila?.n;
}

describe("mesesBorrables y previsualizarBorrado", () => {
  it("ofrece solo los meses anteriores, del más antiguo al más nuevo", async () => {
    await mesNormal("2026-09", 2_000_000, 300_000);
    await mesNormal("2026-10", 1_500_000, 200_000);
    await abrirMesesPendientes(db, el("2026-11-01"));

    expect(await mesesBorrables(db, "2026-11")).toEqual(["2026-09", "2026-10"]);
    const vista = await previsualizarBorrado(db, "2026-09");
    expect(vista.meses).toEqual(["2026-09"]);
    expect(vista.movimientos).toBe(4);
    expect(vista.pendientesSinPagar).toEqual([]);
  });
});

describe("borrarMesesHasta", () => {
  it("Dinero, Libre, Libre inicial, % y ahorro quedan iguales", async () => {
    await mesNormal("2026-09", 2_000_000, 300_000);
    await mesNormal("2026-10", 1_500_000, 200_000);
    await abrirMesesPendientes(db, el("2026-11-01"));
    await registrarIngreso(db, { monto: 1_000_000 }, el("2026-11-02"));
    await registrarGasto(db, { monto: 50_000 }, el("2026-11-03"));
    const antes = await foto("2026-11");

    const r = await borrarMesesHasta(db, "2026-10", el("2026-11-15"));

    expect(r).toEqual({ meses: 2, movimientos: 8 });
    expect(await foto("2026-11")).toEqual(antes);
    expect(await listarMeses(db)).toEqual(["2026-11"]);
    expect(await contar("pendiente_mes")).toBe(1);
    expect(await listarPlantillas(db)).toHaveLength(1);
    expect(await contar("categoria")).toBeGreaterThan(0);
  });

  it("el arrastre no sale en el Histórico ni cuenta para el Libre inicial", async () => {
    await abrirMesesPendientes(db, el("2026-10-01"));
    await registrarIngreso(db, { monto: 50_000 }, el("2026-10-02"));
    await pagarLuz("2026-10", "2026-10-09");
    await abrirMesesPendientes(db, el("2026-11-01"));
    await registrarIngreso(db, { monto: 1_000_000 }, el("2026-11-02"));
    const antes = await foto("2026-11");

    await borrarMesesHasta(db, "2026-10", el("2026-11-15"));

    expect(await foto("2026-11")).toEqual(antes);
    const arrastre = await db.getAllAsync(
      `SELECT tipo, monto, fecha FROM movimiento WHERE origen = 'arrastre'`,
      [],
    );
    expect(arrastre).toEqual([
      { tipo: "gasto", monto: 30_000, fecha: "2026-11-01" },
    ]);
  });

  it("borrar dos veces suma el arrastre anterior y los saldos siguen iguales", async () => {
    await mesNormal("2026-09", 2_000_000, 300_000);
    await mesNormal("2026-10", 1_500_000, 200_000);
    await borrarMesesHasta(db, "2026-09", el("2026-10-20"));
    await abrirMesesPendientes(db, el("2026-11-01"));
    await registrarIngreso(db, { monto: 1_000_000 }, el("2026-11-02"));
    const antes = await foto("2026-11");

    await borrarMesesHasta(db, "2026-10", el("2026-11-15"));

    expect(await foto("2026-11")).toEqual(antes);
    const ahorro = await db.getAllAsync<{ motivo: string; fecha: string }>(
      "SELECT motivo, fecha FROM ahorro_movimiento",
      [],
    );
    expect(ahorro).toEqual([{ motivo: "arrastre", fecha: "2026-11-01" }]);
  });

  it("si el frasco está roto, sigue roto hasta que entre un ingreso", async () => {
    await abrirMesesPendientes(db, el("2026-09-01"));
    await insertarMovimientoAhorro(
      db,
      { monto: 500_000, motivo: "saldo_inicial", fecha: "2026-09-01" },
      el("2026-09-01").ahora,
    );
    await registrarIngreso(db, { monto: 100_000 }, el("2026-09-02"));
    await pagarLuz("2026-09", "2026-09-09");
    await registrarGasto(db, { monto: 100_000 }, el("2026-09-12"));
    await abrirMesesPendientes(db, el("2026-10-01"));
    const antes = await foto("2026-10");
    expect(antes.resumen.estado).toBe("roto");

    await borrarMesesHasta(db, "2026-09", el("2026-10-15"));

    expect(await foto("2026-10")).toEqual(antes);
    await registrarIngreso(db, { monto: 200_000 }, el("2026-10-16"));
    expect((await obtenerResumen(db, "2026-10")).ahorroTocadoSinReponer).toBe(false);
  });

  it("no borra si en el rango hay pendientes sin pagar", async () => {
    await abrirMesesPendientes(db, el("2026-09-01"));
    await registrarIngreso(db, { monto: 1_000_000 }, el("2026-09-02"));
    await abrirMesesPendientes(db, el("2026-10-01"));

    expect((await previsualizarBorrado(db, "2026-09")).pendientesSinPagar).toHaveLength(1);
    await expect(borrarMesesHasta(db, "2026-09", el("2026-10-15"))).rejects.toThrow(
      "Luz (Septiembre 2026)",
    );
    expect(await listarMeses(db)).toEqual(["2026-10", "2026-09"]);
    expect(await contar("movimiento")).toBe(2);
  });

  it("el mes actual nunca se borra", async () => {
    await abrirMesesPendientes(db, el("2026-11-01"));
    await expect(borrarMesesHasta(db, "2026-11", el("2026-11-15"))).rejects.toThrow(
      "mes actual",
    );
  });
});
