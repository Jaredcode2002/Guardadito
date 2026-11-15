import { useEffect, useSyncExternalStore } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeOut, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  cerrarAviso,
  DURACION_AVISO,
  leerAviso,
  suscribirAvisos,
  type TonoAviso,
} from "@/features/avisos/store";
import { crearEstilos } from "@/styles/components/Toast.styles";
import {
  ANCHO_AVISO,
  durations,
  spacing,
  useEstilos,
  useTema,
  type Tema,
} from "@/theme";

import { Frasco } from "./frasco/Frasco";
import { Icono } from "./Icono";

const ALTURA_BARRA = 104;

function coloresAviso(
  t: Tema,
  tono: TonoAviso,
): { fondo: string; texto: string; accion: string } {
  if (tono === "oscuro") {
    return { fondo: t.panel, texto: t.textoSobrePanel, accion: t.acento };
  }
  const fondo = tono === "ambar" ? t.liquido.mod : t.liquido.crit;
  return { fondo, texto: t.sobreLiquido, accion: t.sobreLiquido };
}

export function Toast() {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
  const aviso = useSyncExternalStore(suscribirAvisos, leerAviso);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const margen = Math.max(spacing.lg, (width - ANCHO_AVISO) / 2);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(
      () => cerrarAviso(aviso.id),
      aviso.duracion ?? DURACION_AVISO,
    );
    return () => clearTimeout(temporizador);
  }, [aviso]);

  if (!aviso) return null;
  const colores = coloresAviso(tema, aviso.tono);
  const conTitulo = aviso.titulo !== undefined;

  return (
    <Animated.View
      key={aviso.id}
      entering={SlideInDown.duration(durations.slow)}
      exiting={FadeOut.duration(durations.fast)}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        conTitulo ? styles.toastGrande : styles.toastSimple,
        {
          bottom: ALTURA_BARRA + insets.bottom,
          left: margen,
          right: margen,
          backgroundColor: colores.fondo,
        },
      ]}
    >
      {aviso.frasco && (
        <Frasco
          estado={aviso.frasco.estado}
          porcentaje={aviso.frasco.porcentaje}
          ancho={46}
          variante="toast"
        />
      )}
      <View style={styles.textos}>
        {conTitulo && (
          <Text style={[styles.titulo, { color: colores.texto }]}>
            {aviso.titulo}
          </Text>
        )}
        <Text style={[styles.texto, { color: colores.texto }]}>
          {aviso.texto}
        </Text>
      </View>
      {aviso.accion ? (
        <Pressable
          onPress={() => {
            cerrarAviso(aviso.id);
            aviso.accion?.alPresionar();
          }}
          style={styles.boton}
          accessibilityRole="button"
        >
          <Text style={[styles.accion, { color: colores.accion }]}>
            {aviso.accion.texto}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => cerrarAviso(aviso.id)}
          style={[styles.boton, conTitulo && styles.botonArriba]}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
        >
          <Icono nombre="cerrar" color={colores.texto} tamano={20} />
        </Pressable>
      )}
    </Animated.View>
  );
}
