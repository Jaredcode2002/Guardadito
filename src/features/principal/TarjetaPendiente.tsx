import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  LinearTransition,
  SlideOutRight,
} from "react-native-reanimated";

import { Icono } from "@/components/Icono";
import type { PendienteMes } from "@/db";
import { abreviaturaMes, diaDe, type Fecha } from "@/lib/fechas";
import { formatearLempirasCompacto } from "@/lib/formato";
import { durations, fonts, palette } from "@/theme";

export function TarjetaPendiente({
  pendiente,
  hoy,
  ocupado,
  onPagar,
}: {
  pendiente: PendienteMes;
  hoy: Fecha;
  ocupado: boolean;
  onPagar: () => void;
}) {
  const vencido = pendiente.fechaVence < hoy;

  return (
    <Animated.View
      entering={FadeIn.duration(durations.fast)}
      exiting={SlideOutRight.duration(durations.normal)}
      layout={LinearTransition.duration(durations.normal)}
      style={styles.tarjeta}
    >
      <View style={styles.ficha}>
        <Text style={[styles.fichaMes, vencido && styles.fichaVencida]}>
          {abreviaturaMes(pendiente.fechaVence)}
        </Text>
        <Text style={styles.fichaDia}>{diaDe(pendiente.fechaVence)}</Text>
      </View>

      <View style={styles.textos}>
        <Text style={styles.nombre} numberOfLines={1}>
          {pendiente.nombre}
        </Text>
        <Text style={styles.monto}>
          {formatearLempirasCompacto(pendiente.monto)}
        </Text>
        {vencido && <Text style={styles.vencido}>Vencido</Text>}
      </View>

      <Pressable
        onPress={onPagar}
        disabled={ocupado}
        accessibilityRole="button"
        accessibilityLabel={`Pagar ${pendiente.nombre}`}
        style={({ pressed }) => [
          styles.boton,
          (pressed || ocupado) && styles.botonPresionado,
        ]}
      >
        <View style={styles.botonCirculo}>
          <Icono nombre="flecha" color={palette.lima} tamano={18} />
        </View>
        <Text style={styles.botonTexto}>Pagar</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 76,
    backgroundColor: "#FFFDF8",
    borderColor: "#EAE2D0",
    borderWidth: 1,
    borderRadius: 26,
    paddingVertical: 9,
    paddingLeft: 9,
    paddingRight: 12,
  },
  ficha: {
    width: 52,
    height: 58,
    borderRadius: 18,
    backgroundColor: palette.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  fichaMes: {
    color: palette.lima,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  fichaVencida: { color: palette.coral },
  fichaDia: {
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 25,
  },
  textos: { flex: 1, minWidth: 0 },
  nombre: { color: palette.tinta, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  monto: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 19,
    fontVariant: ["tabular-nums"],
  },
  vencido: { color: "#B23A26", fontFamily: fonts.bodySemiBold, fontSize: 12 },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingLeft: 4,
    paddingRight: 16,
    borderRadius: 22,
    backgroundColor: palette.lima,
  },
  botonPresionado: { opacity: 0.7 },
  botonCirculo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
});
