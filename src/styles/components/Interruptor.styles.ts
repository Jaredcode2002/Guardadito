import { StyleSheet } from "react-native";

import { palette } from "@/theme";

export const styles = StyleSheet.create({
  pista: { width: 52, height: 32, borderRadius: 16, padding: 4 },
  pistaActiva: { backgroundColor: palette.panel },
  pistaInactiva: { backgroundColor: "#D9D1BD" },
  perilla: { width: 24, height: 24, borderRadius: 12 },
  perillaActiva: { backgroundColor: palette.lima },
  perillaInactiva: { backgroundColor: "#FFFFFF" },
});
