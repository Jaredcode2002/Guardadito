import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { crearEstilos } from "@/styles/components/HojaInferior.styles";
import { durations, useEstilos } from "@/theme";

export function HojaInferior({ children }: { children: ReactNode }) {
  const styles = useEstilos(crearEstilos);
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.contenedor}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      />
      <Animated.View
        entering={SlideInDown.duration(durations.slow)}
        style={[styles.hoja, { paddingBottom: 28 + insets.bottom }]}
      >
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          <View style={styles.agarradera} />
          {children}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
