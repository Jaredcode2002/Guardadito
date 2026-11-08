import {
  cambiarColorCategoria,
  crearCategoria,
  listarCategorias,
  obtenerCategoria,
} from "./categorias";
import { MIGRACIONES, migrar } from "./migraciones";
import { crearDbEnMemoria } from "./pruebas/dbEnMemoria";
import { prepararDb } from "./pruebas/prepararDb";

const AHORA = "2026-11-07T15:00:00.000Z";

let db: Awaited<ReturnType<typeof prepararDb>>;

beforeEach(async () => {
  db = await prepararDb();
});

afterEach(() => db.cerrar());

describe("colores de categoría", () => {
  it("las categorías por defecto reciben colores en el orden fijo", async () => {
    const gasto = await listarCategorias(db, "gasto");
    expect(gasto.map((c) => [c.nombre, c.color])).toEqual([
      ["Comida de la calle", "azul"],
      ["Ocio", "naranja"],
      ["Transporte extra", "aqua"],
      ["Otro", "amarillo"],
    ]);
    const ingreso = await listarCategorias(db, "ingreso");
    expect(ingreso.map((c) => c.color)).toEqual(["azul", "naranja", "aqua"]);
  });

  it("una categoría nueva toma el siguiente color libre de su tipo", async () => {
    const id = await crearCategoria(db, "gasto", "Mascotas", AHORA);
    expect((await obtenerCategoria(db, id))?.color).toBe("rosa");
  });

  it("al crear se puede elegir el color", async () => {
    const id = await crearCategoria(db, "gasto", "Gym", AHORA, "verde");
    expect((await obtenerCategoria(db, id))?.color).toBe("verde");
  });

  it("se puede cambiar el color y rechaza uno fuera de la paleta", async () => {
    const [ocio] = (await listarCategorias(db, "gasto")).filter(
      (c) => c.nombre === "Ocio",
    );
    await cambiarColorCategoria(db, ocio.id, "violeta");
    expect((await obtenerCategoria(db, ocio.id))?.color).toBe("violeta");
    await expect(cambiarColorCategoria(db, ocio.id, "morado")).rejects.toThrow(
      'Color inválido: "morado".',
    );
  });

  it("migración v3: una base v2 conserva sus categorías y les asigna color", async () => {
    const vieja = crearDbEnMemoria();
    await migrar(vieja, MIGRACIONES.slice(0, 2));
    await vieja.runAsync(
      "INSERT INTO categoria (tipo, nombre, orden, creado_en) VALUES ('gasto', 'Mía', 100, ?)",
      [AHORA],
    );

    await migrar(vieja);

    const filas = await vieja.getAllAsync<{ nombre: string; color: string }>(
      "SELECT nombre, color FROM categoria WHERE tipo = 'gasto' ORDER BY orden, id",
      [],
    );
    expect(filas.at(-1)).toEqual({ nombre: "Mía", color: "rosa" });
    vieja.cerrar();
  });
});
