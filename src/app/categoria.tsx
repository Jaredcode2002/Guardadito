import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import {
  BotonPeligro,
  BotonPrincipal,
  CampoTexto,
  Etiqueta,
  MensajeError,
  Titulo,
} from "@/components/formulario";
import { HojaInferior } from "@/components/HojaInferior";
import {
  crearCategoria,
  eliminarCategoria,
  momentoActual,
  obtenerCategoria,
  renombrarCategoria,
  type TipoMovimiento,
} from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import { normalizarNombre } from "@/lib/nombres";

export default function CategoriaPantalla() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ id?: string; tipo?: string }>();
  const tipo: TipoMovimiento = params.tipo === "ingreso" ? "ingreso" : "gasto";
  const editando = params.id !== undefined;
  const [nombre, setNombre] = useState("");
  const [original, setOriginal] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editando) return;
    obtenerCategoria(db, Number(params.id)).then((c) => {
      if (!c) return;
      setNombre(c.nombre);
      setOriginal(c.nombre);
    });
  }, [db, editando, params.id]);

  const limpio = normalizarNombre(nombre);

  async function guardar() {
    if (!limpio) return;
    try {
      if (editando) await renombrarCategoria(db, Number(params.id), limpio);
      else await crearCategoria(db, tipo, limpio, momentoActual().ahora);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function eliminar() {
    Alert.alert(
      `¿Eliminar "${original}"?`,
      "Los movimientos con esta categoría no se borran: quedan sin categoría.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await eliminarCategoria(db, Number(params.id));
            mostrarAviso({ tono: "oscuro", texto: `"${original}" eliminada` });
            router.back();
          },
        },
      ],
    );
  }

  return (
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

      {error && <MensajeError>{error}</MensajeError>}

      <BotonPrincipal
        texto={editando ? "Guardar nombre" : "Crear categoría"}
        onPress={guardar}
        activo={limpio !== null && limpio !== original}
      />
      {editando && (
        <BotonPeligro texto="Eliminar categoría" onPress={eliminar} />
      )}
    </HojaInferior>
  );
}
