import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GRIS } from "@/components/formulario";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { durations, fonts, palette } from "@/theme";

import { textoPorcentaje, type GastoCategoria } from "./logica";

export function Barras({ grupos }: { grupos: readonly GastoCategoria[] }) {
  const mayor = Math.max(...grupos.map((g) => g.monto), 1);
  return (
    <View style={styles.lista}>
      {grupos.map((g) => (
        <Fila key={g.clave} grupo={g} proporcion={g.monto / mayor} />
      ))}
    </View>
  );
}

function Fila({
  grupo,
  proporcion,
}: {
  grupo: GastoCategoria;
  proporcion: number;
}) {
  const reducir = useReducedMotion();
  const ancho = useSharedValue(reducir ? proporcion : 0);

  useEffect(() => {
    ancho.set(
      reducir
        ? proporcion
        : withTiming(proporcion, {
            duration: durations.slow,
            easing: Easing.out(Easing.cubic),
          }),
    );
  }, [ancho, proporcion, reducir]);

  const estiloBarra = useAnimatedStyle(() => ({
    width: `${Math.max(ancho.get() * 100, 1)}%`,
  }));

  const valor = `${L(grupo.monto)} · ${textoPorcentaje(grupo.porcentaje)}`;

  return (
    <View
      style={styles.fila}
      accessible
      accessibilityLabel={`${grupo.nombre}: ${valor}`}
    >
      <View style={styles.textos}>
        <Text style={styles.nombre} numberOfLines={1}>
          {grupo.nombre}
        </Text>
        <Text style={styles.valor}>{valor}</Text>
      </View>
      <Animated.View
        style={[styles.barra, { backgroundColor: grupo.color }, estiloBarra]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 16 },
  fila: { gap: 6 },
  textos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
  },
  nombre: {
    flexShrink: 1,
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  valor: {
    color: GRIS,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  barra: {
    height: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});
