import { planificarGasto } from "@/lib/money";

import { requiereConfirmacion, textosConfirmacion } from "./confirmacion";

describe("requiereConfirmacion", () => {
  it("no pide confirmar si el Libre alcanza", () => {
    expect(requiereConfirmacion(planificarGasto(20_000, 20_000, 600_000))).toBe(
      false,
    );
  });

  it("muestra el modal si toca ahorro o si no alcanza", () => {
    expect(requiereConfirmacion(planificarGasto(45_000, 20_000, 600_000))).toBe(
      true,
    );
    expect(requiereConfirmacion(planificarGasto(45_000, 20_000, 0))).toBe(true);
  });
});

describe("textosConfirmacion", () => {
  it("toca ahorro y alcanza: el ejemplo del diseño", () => {
    expect(
      textosConfirmacion(planificarGasto(45_000, 20_000, 600_000), 600_000),
    ).toEqual({
      permitido: true,
      titulo: "Este gasto tocará tu ahorro",
      destacado: "L 250",
      nota: null,
      detalle:
        "Tu libre es L 200 y el gasto es L 450. Los L 250 que faltan saldrán de tu ahorro, que quedaría en L 5,750.",
    });
  });

  it("sin libre: todo el gasto sale del ahorro", () => {
    expect(
      textosConfirmacion(planificarGasto(45_000, -5_000, 600_000), 600_000)
        .detalle,
    ).toBe(
      "Ya no te queda libre y el gasto es L 450. Los L 450 saldrán de tu ahorro, que quedaría en L 5,550.",
    );
  });

  it("gasta justo todo el ahorro: queda en L 0 y se permite", () => {
    const t = textosConfirmacion(planificarGasto(45_000, 20_000, 25_000), 25_000);
    expect(t.permitido).toBe(true);
    expect(t.detalle).toBe(
      "Tu libre es L 200 y el gasto es L 450. Los L 250 que faltan saldrán de tu ahorro, que quedaría en L 0.",
    );
  });

  it("el ahorro no alcanza: no se permite y dice cuánto falta", () => {
    expect(
      textosConfirmacion(planificarGasto(45_000, 20_000, 10_000), 10_000),
    ).toEqual({
      permitido: false,
      titulo: "No te alcanza para este gasto",
      destacado: "L 150",
      nota: "es lo que te falta, aun usando tu ahorro",
      detalle:
        "Tu libre es L 200, tu ahorro es L 100 y el gasto es L 450. No se registrará: espera tu próximo ingreso o elige un monto menor.",
    });
  });

  it("sin libre ni ahorro: falta todo el gasto", () => {
    expect(textosConfirmacion(planificarGasto(45_000, 0, 0), 0)).toEqual({
      permitido: false,
      titulo: "No te alcanza para este gasto",
      destacado: "L 450",
      nota: "es lo que te falta",
      detalle:
        "Ya no te queda libre, no tienes ahorro y el gasto es L 450. No se registrará: espera tu próximo ingreso o elige un monto menor.",
    });
  });
});
