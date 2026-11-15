import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { formatearLempirasCompacto as L } from "@/lib/formato";
import { crearEstilos } from "@/styles/features/graficos/Barras.styles";
import { durations, useEstilos } from "@/theme";

import { textoPorcentaje, type GastoCategoria } from "./logica";

export function Barras({ grupos }: { grupos: readonly GastoCategoria[] }) {
  const styles = useEstilos(crearEstilos);
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
  const styles = useEstilos(crearEstilos);
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
