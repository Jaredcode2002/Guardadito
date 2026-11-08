import { planificarGasto } from "@/lib/money";

import { requiereConfirmacion, textosConfirmacion } from "./confirmacion";

describe("requiereConfirmacion", () => {
  it("no pide confirmar si el Libre alcanza", () => {
    expect(requiereConfirmacion(planificarGasto(20_000, 20_000, 600_000))).toBe(
      false,
    );
  });

  it("pide confirmar si toca ahorro o deja negativo", () => {
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
      titulo: "Este gasto tocará tu ahorro",
      destacado: "L 250",
      negativo: null,
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

  it("el ahorro no alcanza: muestra lo que queda en negativo", () => {
    const t = textosConfirmacion(planificarGasto(45_000, 20_000, 10_000), 10_000);
    expect(t.destacado).toBe("L 100");
    expect(t.negativo).toBe("y quedarás L 150 en negativo");
    expect(t.detalle).toBe(
      "Tu libre es L 200 y el gasto es L 450. Tu ahorro solo alcanza para L 100 y quedaría en L 0. Lo demás se repone con tu próximo ingreso.",
    );
  });

  it("sin ahorro: solo negativo", () => {
    expect(textosConfirmacion(planificarGasto(45_000, 0, 0), 0)).toEqual({
      titulo: "Este gasto te dejará en negativo",
      destacado: "L 450",
      negativo: null,
      detalle:
        "Ya no te queda libre y el gasto es L 450. No tienes ahorro que lo cubra: el faltante se repone con tu próximo ingreso.",
    });
  });
});
