import { StyleSheet } from "react-native";

import { fonts, palette } from "@/theme";

export const styles = StyleSheet.create({
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
