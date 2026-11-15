import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";

import { ConfirmarAccion } from "@/components/ConfirmarAccion";
import {
  BotonPeligro,
  BotonPrincipal,
  CampoMonto,
  CampoTexto,
  Etiqueta,
  MensajeError,
  Titulo,
} from "@/components/formulario";
import { HojaInferior } from "@/components/HojaInferior";
import {
  agregarPendienteFijo,
  editarPendienteFijo,
  eliminarPendienteFijo,
  obtenerPlantilla,
} from "@/db";
import { parsearDiaDelMes } from "@/features/ajustes/logica";
import { mostrarAviso } from "@/features/avisos/store";
import { formatearNumero, parsearLempiras } from "@/lib/formato";
import { normalizarNombre } from "@/lib/nombres";
import { crearEstilos } from "@/styles/app/pendiente.styles";
import { useEstilos } from "@/theme";

export default function Pendiente() {
  const styles = useEstilos(crearEstilos);
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editando = id !== undefined;
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [dia, setDia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const cancelarConfirmacion = useCallback(() => setConfirmando(false), []);

  useEffect(() => {
    if (!editando) return;
    obtenerPlantilla(db, Number(id)).then((p) => {
      if (!p) return;
      setNombre(p.nombre);
      setMonto(formatearNumero(p.monto));
      setDia(String(p.diaDelMes));
    });
  }, [db, editando, id]);

  const datos = {
    nombre: normalizarNombre(nombre),
    monto: parsearLempiras(monto),
    diaDelMes: parsearDiaDelMes(dia),
  };
  const valido =
    datos.nombre !== null && datos.monto !== null && datos.diaDelMes !== null;

  async function guardar() {
    if (!datos.nombre || datos.monto === null || datos.diaDelMes === null) {
      return;
    }
    const plantilla = {
      nombre: datos.nombre,
      monto: datos.monto,
      diaDelMes: datos.diaDelMes,
    };
    setGuardando(true);
    try {
      if (editando) {
        await editarPendienteFijo(db, Number(id), plantilla);
        mostrarAviso({ tono: "oscuro", texto: `${plantilla.nombre} actualizado` });
      } else {
        await agregarPendienteFijo(db, plantilla);
        mostrarAviso({
          tono: "oscuro",
          texto: `${plantilla.nombre} agregado a tus pendientes de este mes`,
        });
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    setEliminando(true);
    try {
      await eliminarPendienteFijo(db, Number(id));
      mostrarAviso({ tono: "oscuro", texto: `${nombre} eliminado` });
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
        <Titulo>{editando ? "Editar pendiente" : "Nuevo pendiente fijo"}</Titulo>

        <Etiqueta>NOMBRE</Etiqueta>
        <CampoTexto
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Renta"
          accessibilityLabel="Nombre"
          autoFocus={!editando}
        />

        <Etiqueta>MONTO CADA MES</Etiqueta>
        <CampoMonto value={monto} onChangeText={setMonto} />

        <Etiqueta>DÍA DE PAGO</Etiqueta>
        <CampoTexto
          value={dia}
          onChangeText={setDia}
          placeholder="1 a 31"
          keyboardType="number-pad"
          maxLength={2}
          accessibilityLabel="Día de pago"
        />
        <Text style={styles.ayuda}>
          Si el mes es más corto, vence el último día.
        </Text>

        {error && <MensajeError>{error}</MensajeError>}

        <BotonPrincipal
          texto={editando ? "Guardar cambios" : "Agregar pendiente"}
          onPress={guardar}
          activo={valido && !guardando}
        />
        {editando && (
          <BotonPeligro
            texto="Eliminar pendiente"
            onPress={() => setConfirmando(true)}
          />
        )}
      </HojaInferior>
      {confirmando && (
        <ConfirmarAccion
          titulo={`¿Eliminar ${nombre}?`}
          mensaje="Si este mes no lo has pagado, se quita de tus pendientes. Lo que ya pagaste queda en el historial."
          textoConfirmar="Eliminar"
          ocupado={eliminando}
          onCancelar={cancelarConfirmacion}
          onConfirmar={eliminar}
        />
      )}
    </>
  );
}
