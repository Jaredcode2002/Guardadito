import { StyleSheet } from "react-native";

import { fonts, palette } from "@/theme";

export const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  boton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAE2D0",
    backgroundColor: palette.crema,
    alignItems: "center",
    justifyContent: "center",
  },
  inactivo: { opacity: 0.35 },
  valor: {
    minWidth: 44,
    textAlign: "center",
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
});
