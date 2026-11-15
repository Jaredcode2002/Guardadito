import { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
} from "react-native-reanimated";

import { styles } from "@/styles/components/ConfirmarAccion.styles";
import { durations } from "@/theme";

export function ConfirmarAccion({
  titulo,
  mensaje,
  textoConfirmar,
  ocupado = false,
  onCancelar,
  onConfirmar,
}: {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  ocupado?: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const reducir = useReducedMotion();

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onCancelar();
      return true;
    });
    return () => sub.remove();
  }, [onCancelar]);

  return (
    <Animated.View
      entering={reducir ? undefined : FadeIn.duration(durations.fast)}
      exiting={reducir ? undefined : FadeOut.duration(durations.fast)}
      style={styles.fondo}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onCancelar}
        accessibilityRole="button"
        accessibilityLabel="Cancelar"
      />
      <View
        style={styles.tarjeta}
        accessibilityRole="alert"
        accessibilityViewIsModal
        accessibilityLabel={titulo}
      >
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.mensaje}>{mensaje}</Text>

        <View style={styles.botones}>
          <Pressable
            onPress={onCancelar}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.boton,
              styles.cancelar,
              pressed && styles.presionado,
            ]}
          >
            <Text style={styles.botonTexto}>Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={onConfirmar}
            disabled={ocupado}
            accessibilityRole="button"
            accessibilityState={{ disabled: ocupado }}
            style={({ pressed }) => [
              styles.boton,
              styles.destructivo,
              (pressed || ocupado) && styles.presionado,
            ]}
          >
            <Text style={styles.botonTexto}>{textoConfirmar}</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
