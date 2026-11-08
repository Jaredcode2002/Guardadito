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
import { durations, fonts, palette } from "@/theme";

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
  const reducir = useReducedMotion();
  const x = useSharedValue(0);

  useEffect(() => {
    const espera = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
  }, [reducir, x]);

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
        accessibilityLabel="Mejor no gastar"
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
        {t.negativo && <Text style={styles.negativo}>{t.negativo}</Text>}
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
          <Text style={styles.botonTexto}>Mejor no gastar</Text>
        </Pressable>
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
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(20,35,27,0.62)",
    zIndex: 10,
    elevation: 10,
  },
  tarjeta: {
    alignItems: "center",
    padding: 24,
    borderRadius: 36,
    backgroundColor: palette.crema,
  },
  frasco: { alignItems: "center" },
  titulo: {
    marginTop: 10,
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    textAlign: "center",
  },
  pildora: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingTop: 2,
    paddingBottom: 4,
    borderRadius: 26,
    backgroundColor: palette.coral,
  },
  pildoraTexto: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 46,
    letterSpacing: -1,
  },
  negativo: {
    marginTop: 8,
    color: "#A12F22",
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    textAlign: "center",
  },
  detalle: {
    marginTop: 14,
    color: palette.tinta,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  boton: {
    alignSelf: "stretch",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  mejorNo: { marginTop: 20, backgroundColor: palette.lima },
  igual: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: palette.tinta,
  },
  presionado: { opacity: 0.6 },
  botonTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
});
