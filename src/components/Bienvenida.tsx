import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";

import { Frasco } from "@/components/frasco/Frasco";
import {
  ALTURA_OJOS,
  porcentajeParaNivel,
} from "@/components/frasco/geometria";
import { fonts, palette } from "@/theme";

const NOMBRE = "Guardadito";
const NIVEL_OJOS = porcentajeParaNivel(ALTURA_OJOS);
const SALIDA = 250;

const TIEMPOS = {
  llenar: 200,
  primeraLetra: 350,
  entreLetras: 55,
  guino: 1250,
  abrirOjo: 1650,
  salir: 2000,
  salirReducido: 900,
} as const;

export function Bienvenida({ onTerminar }: { onTerminar: () => void }) {
  const reducir = useReducedMotion();
  const [porcentaje, setPorcentaje] = useState(reducir ? NIVEL_OJOS : 0);
  const [guino, setGuino] = useState(reducir);
  const [saliendo, setSaliendo] = useState(false);
  const opacidad = useSharedValue(1);

  useEffect(() => {
    const pasos = reducir
      ? [setTimeout(() => setSaliendo(true), TIEMPOS.salirReducido)]
      : [
          setTimeout(() => setPorcentaje(NIVEL_OJOS), TIEMPOS.llenar),
          setTimeout(() => setGuino(true), TIEMPOS.guino),
          setTimeout(() => setGuino(false), TIEMPOS.abrirOjo),
          setTimeout(() => setSaliendo(true), TIEMPOS.salir),
        ];
    return () => pasos.forEach((p) => clearTimeout(p));
  }, [reducir]);

  useEffect(() => {
    if (!saliendo) return;
    opacidad.set(withTiming(0, { duration: SALIDA }));
    const fin = setTimeout(onTerminar, SALIDA);
    return () => clearTimeout(fin);
  }, [saliendo, onTerminar, opacidad]);

  const estiloFondo = useAnimatedStyle(() => ({ opacity: opacidad.get() }));

  return (
    <Animated.View
      style={[styles.fondo, estiloFondo]}
      pointerEvents={saliendo ? "none" : "auto"}
    >
      <Pressable
        style={styles.toque}
        onPress={() => setSaliendo(true)}
        accessibilityRole="button"
        accessibilityLabel="Guardadito. Toca para entrar"
      >
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          <Frasco
            estado="ok"
            porcentaje={porcentaje}
            ancho={132}
            tema="claro"
            guino={guino}
          />
        </Animated.View>
        <View style={styles.nombre}>
          {NOMBRE.split("").map((letra, i) => (
            <Animated.Text
              key={i}
              entering={FadeInDown.delay(
                TIEMPOS.primeraLetra + i * TIEMPOS.entreLetras,
              )
                .springify()
                .damping(12)}
              style={styles.letra}
            >
              {letra}
            </Animated.Text>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: palette.crema,
    zIndex: 100,
    elevation: 100,
  },
  toque: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },
  nombre: { flexDirection: "row" },
  letra: {
    color: palette.tinta,
    fontFamily: fonts.logo,
    fontSize: 48,
    lineHeight: 60,
  },
});
