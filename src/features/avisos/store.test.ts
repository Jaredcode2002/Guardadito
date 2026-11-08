import {
  cerrarAviso,
  leerAviso,
  mostrarAviso,
  suscribirAvisos,
} from "./store";

afterEach(() => cerrarAviso());

describe("store de avisos", () => {
  it("muestra un aviso y avisa a los suscriptores", () => {
    const oyente = jest.fn();
    const desuscribir = suscribirAvisos(oyente);

    const id = mostrarAviso({ tono: "oscuro", texto: "Hola" });

    expect(leerAviso()).toMatchObject({ id, texto: "Hola" });
    expect(oyente).toHaveBeenCalledTimes(1);
    desuscribir();
  });

  it("un aviso nuevo reemplaza al anterior", () => {
    mostrarAviso({ tono: "oscuro", texto: "Primero" });
    mostrarAviso({ tono: "coral", texto: "Segundo" });
    expect(leerAviso()?.texto).toBe("Segundo");
  });

  it("cerrar con un id viejo no borra el aviso nuevo", () => {
    const viejo = mostrarAviso({ tono: "oscuro", texto: "Viejo" });
    mostrarAviso({ tono: "oscuro", texto: "Nuevo" });

    cerrarAviso(viejo);

    expect(leerAviso()?.texto).toBe("Nuevo");
  });

  it("cerrar con el id actual lo quita", () => {
    const id = mostrarAviso({ tono: "oscuro", texto: "Hola" });
    cerrarAviso(id);
    expect(leerAviso()).toBeNull();
  });

  it("después de desuscribirse ya no recibe avisos", () => {
    const oyente = jest.fn();
    suscribirAvisos(oyente)();
    mostrarAviso({ tono: "oscuro", texto: "Hola" });
    expect(oyente).not.toHaveBeenCalled();
  });
});
