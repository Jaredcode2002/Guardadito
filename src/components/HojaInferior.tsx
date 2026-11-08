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

import { ANCHO_HOJA, durations, palette } from "@/theme";

export function HojaInferior({ children }: { children: ReactNode }) {
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

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(20,35,27,0.55)",
  },
  hoja: {
    width: "100%",
    maxWidth: ANCHO_HOJA,
    alignSelf: "center",
    maxHeight: "92%",
    backgroundColor: palette.crema,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  agarradera: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#EAE2D0",
    marginBottom: 16,
  },
});
