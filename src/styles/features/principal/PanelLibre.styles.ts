import { StyleSheet } from "react-native";

import { colors, fonts, palette, spacing, TEXTO_SUAVE } from "@/theme";

export const styles = StyleSheet.create({
  panel: {
    overflow: "hidden",
    backgroundColor: colors.panel,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 22,
    paddingBottom: 26,
  },
  decoracion: {
    position: "absolute",
    right: -70,
    top: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(200,241,89,0.07)",
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mes: { color: TEXTO_SUAVE, fontFamily: fonts.bodyMedium, fontSize: 14 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  cuerpo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  cifras: { flex: 1, minWidth: 0 },
  etiqueta: {
    color: TEXTO_SUAVE,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  dinero: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },
  moneda: { color: TEXTO_SUAVE, fontFamily: fonts.display, fontSize: 22 },
  dineroNumero: {
    flexShrink: 1,
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 54,
    letterSpacing: -1.5,
    lineHeight: 58,
    fontVariant: ["tabular-nums"],
  },
  divisor: {
    height: 1,
    backgroundColor: "rgba(246,241,231,0.16)",
    marginTop: 16,
    marginBottom: 14,
  },
  libre: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    fontVariant: ["tabular-nums"],
  },
  detalle: {
    color: TEXTO_SUAVE,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  aviso: {
    color: palette.coral,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginTop: spacing.xs + 2,
  },
});
