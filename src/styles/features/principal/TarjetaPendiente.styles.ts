import { StyleSheet } from "react-native";

import { fonts, palette } from "@/theme";

export const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 76,
    backgroundColor: "#FFFDF8",
    borderColor: "#EAE2D0",
    borderWidth: 1,
    borderRadius: 26,
    paddingVertical: 9,
    paddingLeft: 9,
    paddingRight: 12,
  },
  ficha: {
    width: 52,
    height: 58,
    borderRadius: 18,
    backgroundColor: palette.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  fichaMes: {
    color: palette.lima,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  fichaVencida: { color: palette.coral },
  fichaDia: {
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 25,
  },
  textos: { flex: 1, minWidth: 0 },
  nombre: { color: palette.tinta, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  monto: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 19,
    fontVariant: ["tabular-nums"],
  },
  vencido: { color: "#B23A26", fontFamily: fonts.bodySemiBold, fontSize: 12 },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingLeft: 4,
    paddingRight: 16,
    borderRadius: 22,
    backgroundColor: palette.lima,
  },
  botonPresionado: { opacity: 0.7 },
  botonCirculo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
});
