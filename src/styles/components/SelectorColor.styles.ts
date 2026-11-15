import { StyleSheet } from "react-native";

import { palette } from "@/theme";

export const styles = StyleSheet.create({
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  anillo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  anilloActivo: { borderColor: palette.tinta },
  muestra: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
