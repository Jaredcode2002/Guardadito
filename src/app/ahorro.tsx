import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import {
  BotonPrincipal,
  CampoMonto,
  Etiqueta,
  GRIS,
  MensajeError,
  Selector,
  Titulo,
} from "@/components/formulario";
import { HojaInferior } from "@/components/HojaInferior";
import { depositarEnAhorro, registrarAhorroExistente } from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import { useResumen } from "@/features/resumen/useResumen";
import { formatearLempirasCompacto, parsearLempiras } from "@/lib/formato";
import { fonts } from "@/theme";

type Origen = "libre" | "existente";

const ORIGENES = [
  { valor: "libre", texto: "Desde mi libre" },
  { valor: "existente", texto: "Ya lo tenía" },
] as const;

export default function Ahorro() {
  const { db, resumen } = useResumen();
  const [origen, setOrigen] = useState<Origen>("libre");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const monto = parsearLempiras(texto);
  const libre = Math.max(resumen?.libre ?? 0, 0);
  const excede = origen === "libre" && monto !== null && monto > libre;

  async function guardar() {
    if (monto === null || excede) return;
    try {
      if (origen === "libre") await depositarEnAhorro(db, monto);
      else await registrarAhorroExistente(db, monto);
      mostrarAviso({
        tono: "oscuro",
        texto: `${formatearLempirasCompacto(monto)} al ahorro`,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <HojaInferior>
      <Titulo>Agregar al ahorro</Titulo>
      <Text style={styles.ayuda}>
        {origen === "libre"
          ? `Sale de tu Libre: tienes ${formatearLempirasCompacto(libre)} para guardar.`
          : "Dinero que ya tenías guardado fuera de la app. No cambia tu Dinero."}
      </Text>

      <Etiqueta>DE DÓNDE VIENE</Etiqueta>
      <Selector
        opciones={ORIGENES}
        valor={origen}
        onCambiar={(o) => {
          setOrigen(o);
          setError(null);
        }}
      />

      <Etiqueta>MONTO</Etiqueta>
      <CampoMonto
        value={texto}
        onChangeText={(t) => {
          setTexto(t);
          setError(null);
        }}
        autoFocus
      />

      {excede && (
        <MensajeError>
          No puedes guardar más de lo que tienes libre sin tocar tus pendientes.
        </MensajeError>
      )}
      {error && <MensajeError>{error}</MensajeError>}

      <BotonPrincipal
        texto="Guardar en el ahorro"
        onPress={guardar}
        activo={monto !== null && !excede}
      />
    </HojaInferior>
  );
}

const styles = StyleSheet.create({
  ayuda: { color: GRIS, fontFamily: fonts.body, fontSize: 14, marginTop: 6 },
});
