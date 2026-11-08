import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { durations, palette } from "@/theme";

const RECORRIDO = 20;

export function Interruptor({
  valor,
  onCambiar,
  etiqueta,
}: {
  valor: boolean;
  onCambiar: (v: boolean) => void;
  etiqueta: string;
}) {
  const reducir = useReducedMotion();
  const posicion = useSharedValue(valor ? 1 : 0);

  useEffect(() => {
    const destino = valor ? 1 : 0;
    posicion.set(
      reducir ? destino : withTiming(destino, { duration: durations.fast }),
    );
  }, [posicion, reducir, valor]);

  const estiloPerilla = useAnimatedStyle(() => ({
    transform: [{ translateX: posicion.get() * RECORRIDO }],
  }));

  return (
    <Pressable
      onPress={() => onCambiar(!valor)}
      accessibilityRole="switch"
      accessibilityState={{ checked: valor }}
      accessibilityLabel={etiqueta}
      hitSlop={6}
      style={[styles.pista, valor ? styles.pistaActiva : styles.pistaInactiva]}
    >
      <Animated.View
        style={[
          styles.perilla,
          valor ? styles.perillaActiva : styles.perillaInactiva,
          estiloPerilla,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pista: { width: 52, height: 32, borderRadius: 16, padding: 4 },
  pistaActiva: { backgroundColor: palette.panel },
  pistaInactiva: { backgroundColor: "#D9D1BD" },
  perilla: { width: 24, height: 24, borderRadius: 12 },
  perillaActiva: { backgroundColor: palette.lima },
  perillaInactiva: { backgroundColor: "#FFFFFF" },
});
