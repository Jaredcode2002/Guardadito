import { formatearLempiras, parsearLempiras } from "./formato";

describe("formatearLempiras", () => {
  it.each([
    [0, "L 0.00"],
    [5, "L 0.05"],
    [123_456, "L 1,234.56"],
    [100_000_000, "L 1,000,000.00"],
    [-70_000, "−L 700.00"],
  ])("%i centavos → %s", (centavos, texto) => {
    expect(formatearLempiras(centavos)).toBe(texto);
  });
});

describe("parsearLempiras", () => {
  it.each([
    ["150", 15_000],
    ["150.5", 15_050],
    ["150.05", 15_005],
    ["1,234.56", 123_456],
    ["  20 ", 2_000],
  ])("%s → %i centavos", (texto, centavos) => {
    expect(parsearLempiras(texto)).toBe(centavos);
  });

  it.each(["", "0", "0.00", "-5", "abc", "1.234", "12.", ".5", "1e3"])(
    "rechaza %p",
    (texto) => {
      expect(parsearLempiras(texto)).toBeNull();
    },
  );
});
