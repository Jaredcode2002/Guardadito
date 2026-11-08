import { useEffect, useSyncExternalStore } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeOut, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  cerrarAviso,
  DURACION_AVISO,
  leerAviso,
  suscribirAvisos,
  type TonoAviso,
} from "@/features/avisos/store";
import { durations, fonts, fontSizes, palette, spacing } from "@/theme";

import { Frasco } from "./frasco/Frasco";
import { Icono } from "./Icono";

const ALTURA_BARRA = 104;

const COLORES: Record<
  TonoAviso,
  { fondo: string; texto: string; accion: string }
> = {
  oscuro: { fondo: palette.panel, texto: palette.crema, accion: palette.lima },
  ambar: { fondo: palette.ambar, texto: palette.tinta, accion: palette.tinta },
  coral: { fondo: palette.coral, texto: palette.tinta, accion: palette.tinta },
};

export function Toast() {
  const aviso = useSyncExternalStore(suscribirAvisos, leerAviso);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(
      () => cerrarAviso(aviso.id),
      aviso.duracion ?? DURACION_AVISO,
    );
    return () => clearTimeout(temporizador);
  }, [aviso]);

  if (!aviso) return null;
  const colores = COLORES[aviso.tono];
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
        { bottom: ALTURA_BARRA + insets.bottom, backgroundColor: colores.fondo },
      ]}
    >
      {aviso.frasco && (
        <Frasco
          estado={aviso.frasco.estado}
          porcentaje={aviso.frasco.porcentaje}
          ancho={46}
          tema="toast"
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

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: palette.panel,
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  toastSimple: {
    minHeight: 56,
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 6,
  },
  toastGrande: {
    borderRadius: 28,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 6,
  },
  textos: { flex: 1, gap: 4 },
  titulo: { fontFamily: fonts.display, fontSize: 19, lineHeight: 22 },
  texto: { fontFamily: fonts.body, fontSize: fontSizes.sm, lineHeight: 19 },
  boton: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  botonArriba: { alignSelf: "flex-start" },
  accion: { fontFamily: fonts.bodySemiBold, fontSize: fontSizes.sm },
});
