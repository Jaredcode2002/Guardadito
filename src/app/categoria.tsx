import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { ConfirmarAccion } from "@/components/ConfirmarAccion";
import {
  BotonPeligro,
  BotonPrincipal,
  CampoTexto,
  Etiqueta,
  MensajeError,
  Titulo,
} from "@/components/formulario";
import { HojaInferior } from "@/components/HojaInferior";
import { SelectorColor } from "@/components/SelectorColor";
import {
  cambiarColorCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  momentoActual,
  obtenerCategoria,
  renombrarCategoria,
  type TipoMovimiento,
} from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import { siguienteColor, type ColorCategoria } from "@/lib/colores";
import { normalizarNombre } from "@/lib/nombres";

export default function CategoriaPantalla() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ id?: string; tipo?: string }>();
  const tipo: TipoMovimiento = params.tipo === "ingreso" ? "ingreso" : "gasto";
  const editando = params.id !== undefined;
  const [nombre, setNombre] = useState("");
  const [original, setOriginal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<ColorCategoria | null>(null);
  const [colorOriginal, setColorOriginal] = useState<ColorCategoria | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const cancelarConfirmacion = useCallback(() => setConfirmando(false), []);

  useEffect(() => {
    if (!editando) {
      listarCategorias(db, tipo).then((lista) =>
        setColor(siguienteColor(lista.map((c) => c.color))),
      );
      return;
    }
    obtenerCategoria(db, Number(params.id)).then((c) => {
      if (!c) return;
      setNombre(c.nombre);
      setOriginal(c.nombre);
      setColor(c.color);
      setColorOriginal(c.color);
    });
  }, [db, editando, params.id, tipo]);

  const limpio = normalizarNombre(nombre);

  async function guardar() {
    if (!limpio) return;
    try {
      if (editando) {
        const id = Number(params.id);
        if (limpio !== original) await renombrarCategoria(db, id, limpio);
        if (color && color !== colorOriginal) {
          await cambiarColorCategoria(db, id, color);
        }
      } else {
        await crearCategoria(
          db,
          tipo,
          limpio,
          momentoActual().ahora,
          color ?? undefined,
        );
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function eliminar() {
    setEliminando(true);
    try {
      await eliminarCategoria(db, Number(params.id));
      mostrarAviso({ tono: "oscuro", texto: `"${original}" eliminada` });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setConfirmando(false);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <>
      <HojaInferior>
        <Titulo>
          {editando
            ? "Editar categoría"
            : `Nueva categoría de ${tipo === "gasto" ? "gasto" : "ingreso"}`}
        </Titulo>

        <Etiqueta>NOMBRE</Etiqueta>
        <CampoTexto
          value={nombre}
          onChangeText={(t) => {
            setNombre(t);
            setError(null);
          }}
          placeholder={tipo === "gasto" ? "Ej. Mascotas" : "Ej. Ventas"}
          accessibilityLabel="Nombre de la categoría"
          autoFocus
          onSubmitEditing={guardar}
        />

        <Etiqueta>COLOR</Etiqueta>
        <SelectorColor valor={color} onCambiar={setColor} />

        {error && <MensajeError>{error}</MensajeError>}

        <BotonPrincipal
          texto={editando ? "Guardar cambios" : "Crear categoría"}
          onPress={guardar}
          activo={
            limpio !== null && (limpio !== original || color !== colorOriginal)
          }
        />
        {editando && (
          <BotonPeligro
            texto="Eliminar categoría"
            onPress={() => setConfirmando(true)}
          />
        )}
      </HojaInferior>
      {confirmando && (
        <ConfirmarAccion
          titulo={`¿Eliminar "${original}"?`}
          mensaje="Los movimientos con esta categoría no se borran: quedan sin categoría."
          textoConfirmar="Eliminar"
          ocupado={eliminando}
          onCancelar={cancelarConfirmacion}
          onConfirmar={eliminar}
        />
      )}
    </>
  );
}
