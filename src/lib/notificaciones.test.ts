import {
  cambiarHora,
  diaAntesALas,
  planearNotificaciones,
  unirNombres,
  type EntradaPlan,
} from "./notificaciones";

const BASE: EntradaPlan = {
  ahora: new Date(2026, 10, 7, 15, 0),
  recordatorioActivo: true,
  horaRecordatorio: "21:00",
  avisarPendientes: true,
  pendientes: [],
};

describe("planearNotificaciones", () => {
  it("recordatorio diario a la hora configurada", () => {
    expect(planearNotificaciones({ ...BASE, horaRecordatorio: "20:45" })).toEqual([
      {
        id: "recordatorio",
        titulo: "¿Cómo te fue hoy?",
        cuerpo: "Anota lo que gastaste hoy para que tu libre siga al día.",
        disparo: { tipo: "diario", hora: 20, minuto: 45 },
      },
    ]);
  });

  it("sin recordatorio si está apagado", () => {
    expect(planearNotificaciones({ ...BASE, recordatorioActivo: false })).toEqual(
      [],
    );
  });

  it("avisa un pendiente a las 9:00 del día antes", () => {
    const [, aviso] = planearNotificaciones({
      ...BASE,
      pendientes: [{ nombre: "Renta", monto: 450_000, fechaVence: "2026-11-10" }],
    });
    expect(aviso).toEqual({
      id: "pendientes-2026-11-10",
      titulo: "Mañana vence Renta",
      cuerpo: "Son L 4,500. Márcalo como pagado en Guardadito cuando lo pagues.",
      disparo: { tipo: "fecha", fecha: new Date(2026, 10, 9, 9, 0) },
    });
  });

  it("junta los pendientes que vencen el mismo día y los ordena", () => {
    const plan = planearNotificaciones({
      ...BASE,
      recordatorioActivo: false,
      pendientes: [
        { nombre: "Transporte", monto: 120_000, fechaVence: "2026-11-15" },
        { nombre: "Renta", monto: 450_000, fechaVence: "2026-11-12" },
        { nombre: "Internet", monto: 60_000, fechaVence: "2026-11-12" },
      ],
    });
    expect(plan.map((n) => [n.id, n.titulo, n.cuerpo])).toEqual([
      [
        "pendientes-2026-11-12",
        "Mañana vencen 2 pendientes",
        "Renta e Internet · L 5,100 en total.",
      ],
      [
        "pendientes-2026-11-15",
        "Mañana vence Transporte",
        "Son L 1,200. Márcalo como pagado en Guardadito cuando lo pagues.",
      ],
    ]);
  });

  it("omite los avisos cuya hora ya pasó", () => {
    const plan = planearNotificaciones({
      ...BASE,
      recordatorioActivo: false,
      pendientes: [
        { nombre: "Hoy", monto: 1_000, fechaVence: "2026-11-07" },
        { nombre: "Mañana", monto: 1_000, fechaVence: "2026-11-08" },
        { nombre: "Atrasado", monto: 1_000, fechaVence: "2026-10-30" },
      ],
    });
    expect(plan).toEqual([]);
  });

  it("antes de las 9:00 todavía avisa lo que vence mañana", () => {
    const plan = planearNotificaciones({
      ...BASE,
      ahora: new Date(2026, 10, 7, 8, 30),
      recordatorioActivo: false,
      pendientes: [{ nombre: "Agua", monto: 30_000, fechaVence: "2026-11-08" }],
    });
    expect(plan.map((n) => n.id)).toEqual(["pendientes-2026-11-08"]);
  });

  it("sin avisos de pendientes si está apagado", () => {
    expect(
      planearNotificaciones({
        ...BASE,
        recordatorioActivo: false,
        avisarPendientes: false,
        pendientes: [{ nombre: "Renta", monto: 450_000, fechaVence: "2026-11-10" }],
      }),
    ).toEqual([]);
  });
});

describe("diaAntesALas", () => {
  it("cruza el inicio de mes y de año", () => {
    expect(diaAntesALas("2026-12-01", 9)).toEqual(new Date(2026, 10, 30, 9, 0));
    expect(diaAntesALas("2027-01-01", 9)).toEqual(new Date(2026, 11, 31, 9, 0));
  });
});

describe("unirNombres", () => {
  it.each([
    [[], ""],
    [["Renta"], "Renta"],
    [["Renta", "Agua"], "Renta y Agua"],
    [["Renta", "Agua", "Internet"], "Renta, Agua e Internet"],
  ])("%j → %s", (nombres, texto) => {
    expect(unirNombres(nombres)).toBe(texto);
  });
});

describe("cambiarHora", () => {
  it("la hora da la vuelta en 24", () => {
    expect(cambiarHora("23:15", "hora", 1)).toBe("00:15");
    expect(cambiarHora("00:00", "hora", -1)).toBe("23:00");
  });

  it("los minutos van de 15 en 15 sin cambiar la hora", () => {
    expect(cambiarHora("21:00", "minuto", 1)).toBe("21:15");
    expect(cambiarHora("21:45", "minuto", 1)).toBe("21:00");
    expect(cambiarHora("21:00", "minuto", -1)).toBe("21:45");
  });

  it("una hora fuera de paso se ajusta al siguiente o anterior", () => {
    expect(cambiarHora("21:10", "minuto", 1)).toBe("21:15");
    expect(cambiarHora("21:10", "minuto", -1)).toBe("21:00");
  });
});
