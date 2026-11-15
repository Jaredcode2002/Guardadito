import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { crearEstilos } from "@/styles/components/Interruptor.styles";
import { durations, useEstilos } from "@/theme";

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
  const styles = useEstilos(crearEstilos);
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
