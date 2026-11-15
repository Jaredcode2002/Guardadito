import { StyleSheet } from "react-native";

import { fonts, palette } from "@/theme";

export const styles = StyleSheet.create({
  barra: {
    height: 68,
    borderRadius: 34,
    backgroundColor: palette.panel,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 14,
    paddingRight: 8,
  },
  flotante: { position: "absolute", left: 20, right: 20 },
  incrustada: {
    backgroundColor: "transparent",
    paddingLeft: 0,
    paddingRight: 0,
  },
  accesos: { flexDirection: "row", gap: 2 },
  acceso: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  accesoPresionado: { backgroundColor: "rgba(246,241,231,0.1)" },
  anadir: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 14,
    paddingRight: 20,
    borderRadius: 26,
    backgroundColor: palette.lima,
  },
  anadirTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
});
