import {
  guardarAvisarPendientes,
  guardarHoraRecordatorio,
  guardarPaleta,
  guardarRecordatorioActivo,
  guardarUmbrales,
  leerAjustes,
  marcarPermisoNotificacionesPedido,
  permisoNotificacionesPedido,
} from "./ajustes";
import { prepararDb } from "./pruebas/prepararDb";

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
});

afterEach(() => db.cerrar());

describe("ajustes", () => {
  it("lee los valores por defecto", async () => {
    expect(await leerAjustes(db)).toEqual({
      umbrales: { moderacion: 30, casiCero: 10 },
      horaRecordatorio: "21:00",
      recordatorioActivo: true,
      avisarPendientes: true,
      paleta: "guardadito",
    });
  });

  it("guarda y lee cambios", async () => {
    await guardarUmbrales(db, { moderacion: 40, casiCero: 15 });
    await guardarHoraRecordatorio(db, "22:30");
    await guardarAvisarPendientes(db, false);
    await guardarRecordatorioActivo(db, false);
    await guardarPaleta(db, "noche");

    expect(await leerAjustes(db)).toEqual({
      umbrales: { moderacion: 40, casiCero: 15 },
      horaRecordatorio: "22:30",
      recordatorioActivo: false,
      avisarPendientes: false,
      paleta: "noche",
    });
  });

  it("rechaza umbrales y horas inválidos sin cambiar nada", async () => {
    await expect(
      guardarUmbrales(db, { moderacion: 10, casiCero: 20 }),
    ).rejects.toThrow("Umbrales inválidos");
    await expect(guardarHoraRecordatorio(db, "25:00")).rejects.toThrow(
      "Hora inválida",
    );
    expect((await leerAjustes(db)).umbrales).toEqual({
      moderacion: 30,
      casiCero: 10,
    });
  });

  it("si un umbral guardado está corrupto, usa los de por defecto", async () => {
    await db.runAsync("UPDATE ajuste SET valor = 'abc' WHERE clave = ?", [
      "umbral_moderacion",
    ]);
    expect((await leerAjustes(db)).umbrales).toEqual({
      moderacion: 30,
      casiCero: 10,
    });
  });
});

describe("paleta", () => {
  it("rechaza una paleta que no existe sin cambiar la guardada", async () => {
    await guardarPaleta(db, "mar");
    await expect(guardarPaleta(db, "arcoiris")).rejects.toThrow(
      "Paleta desconocida",
    );
    expect((await leerAjustes(db)).paleta).toBe("mar");
  });

  it("si la guardada ya no existe en el catálogo, vuelve a la de por defecto", async () => {
    await db.runAsync(
      "INSERT INTO ajuste (clave, valor) VALUES ('paleta', 'vieja')",
      [],
    );
    expect((await leerAjustes(db)).paleta).toBe("guardadito");
  });
});

describe("permiso de notificaciones", () => {
  it("se recuerda que ya se pidió", async () => {
    expect(await permisoNotificacionesPedido(db)).toBe(false);
    await marcarPermisoNotificacionesPedido(db);
    expect(await permisoNotificacionesPedido(db)).toBe(true);
  });
});
