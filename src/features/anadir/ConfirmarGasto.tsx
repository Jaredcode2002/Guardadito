import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Frasco } from "@/components/frasco/Frasco";
import type { Centavos, PlanDeGasto } from "@/lib/money";
import { styles } from "@/styles/features/anadir/ConfirmarGasto.styles";
import { durations } from "@/theme";

import { textosConfirmacion } from "./confirmacion";

const PASOS_TEMBLOR = [-8, 7, -4, 2, 0];
const RETRASO_TEMBLOR = 250;
const DURACION_TEMBLOR = 400;

export function ConfirmarGasto({
  plan,
  saldoAhorro,
  ocupado,
  onCancelar,
  onConfirmar,
}: {
  plan: PlanDeGasto;
  saldoAhorro: Centavos;
  ocupado: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const t = textosConfirmacion(plan, saldoAhorro);
  const permitido = t.permitido;
  const cerrar = permitido ? "Mejor no gastar" : "Entendido";
  const reducir = useReducedMotion();
  const x = useSharedValue(0);

  useEffect(() => {
    const espera = setTimeout(() => {
      Haptics.notificationAsync(
        permitido
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error,
      );
    }, RETRASO_TEMBLOR);
    if (!reducir) {
      const paso = DURACION_TEMBLOR / PASOS_TEMBLOR.length;
      const curva = { duration: paso, easing: Easing.out(Easing.quad) };
      x.set(
        withDelay(
          RETRASO_TEMBLOR,
          withSequence(...PASOS_TEMBLOR.map((v) => withTiming(v, curva))),
        ),
      );
    }
    return () => clearTimeout(espera);
  }, [permitido, reducir, x]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onCancelar();
      return true;
    });
    return () => sub.remove();
  }, [onCancelar]);

  const temblor = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }],
  }));

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
        accessibilityLabel={cerrar}
      />
      <Animated.View
        style={[styles.tarjeta, temblor]}
        accessibilityRole="alert"
        accessibilityViewIsModal
        accessibilityLabel={t.titulo}
      >
        <View style={styles.frasco}>
          <Frasco estado="roto" porcentaje={0} ancho={92} tema="claro" />
        </View>
        <Text style={styles.titulo}>{t.titulo}</Text>
        <View style={styles.pildora}>
          <Text style={styles.pildoraTexto}>{t.destacado}</Text>
        </View>
        {t.nota && <Text style={styles.nota}>{t.nota}</Text>}
        <Text style={styles.detalle}>{t.detalle}</Text>

        <Pressable
          onPress={onCancelar}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.boton,
            styles.mejorNo,
            pressed && styles.presionado,
          ]}
        >
          <Text style={styles.botonTexto}>{cerrar}</Text>
        </Pressable>
        {t.permitido && (
          <Pressable
            onPress={onConfirmar}
            disabled={ocupado}
            accessibilityRole="button"
            accessibilityState={{ disabled: ocupado }}
            style={({ pressed }) => [
              styles.boton,
              styles.igual,
              (pressed || ocupado) && styles.presionado,
            ]}
          >
            <Text style={styles.botonTexto}>Registrar de todos modos</Text>
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}
