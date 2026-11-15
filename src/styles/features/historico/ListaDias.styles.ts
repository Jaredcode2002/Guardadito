import { StyleSheet } from "react-native";

import { BORDE, fonts, GRIS, palette, PAPEL } from "@/theme";

export const styles = StyleSheet.create({
  dia: {
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    color: GRIS,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  tarjeta: {
    paddingVertical: 2,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDE,
    backgroundColor: PAPEL,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
  },
  divisor: { borderTopWidth: 1, borderTopColor: BORDE },
  filaIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filaTextos: { flex: 1, paddingVertical: 10 },
  filaTituloLinea: { flexDirection: "row", alignItems: "center", gap: 6 },
  filaTitulo: {
    flexShrink: 1,
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  etiqueta: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: palette.panel,
  },
  etiquetaTexto: {
    color: palette.lima,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  filaSub: { color: GRIS, fontFamily: fonts.body, fontSize: 13 },
  filaMonto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
});
