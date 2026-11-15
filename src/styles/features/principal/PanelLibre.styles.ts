import { StyleSheet } from "react-native";

import { fonts, spacing, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  panel: {
    overflow: "hidden",
    backgroundColor: t.panel,
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
    backgroundColor: t.brilloPanel,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mes: { color: t.textoSobrePanelSuave, fontFamily: fonts.bodyMedium, fontSize: 14 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipTexto: {
    color: t.sobreLiquido,
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
    color: t.textoSobrePanelSuave,
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
  moneda: { color: t.textoSobrePanelSuave, fontFamily: fonts.display, fontSize: 22 },
  dineroNumero: {
    flexShrink: 1,
    color: t.textoSobrePanel,
    fontFamily: fonts.display,
    fontSize: 54,
    letterSpacing: -1.5,
    lineHeight: 58,
    fontVariant: ["tabular-nums"],
  },
  divisor: {
    height: 1,
    backgroundColor: t.lineaPanel,
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
    color: t.textoSobrePanelSuave,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  aviso: {
    color: t.liquido.crit,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginTop: spacing.xs + 2,
  },
});
