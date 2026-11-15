import { useEffect } from "react";
import {
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { durations } from "@/theme";

export function useColorAnimado(color: string): SharedValue<string> {
  const reducir = useReducedMotion();
  const valor = useSharedValue(color);

  useEffect(() => {
    valor.set(
      reducir ? color : withTiming(color, { duration: durations.normal }),
    );
  }, [color, reducir, valor]);

  return valor;
}
