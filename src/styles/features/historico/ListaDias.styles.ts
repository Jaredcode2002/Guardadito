import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  dia: {
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    color: t.textoSecundario,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  tarjeta: {
    paddingVertical: 2,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: t.borde,
    backgroundColor: t.superficie,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
  },
  divisor: { borderTopWidth: 1, borderTopColor: t.borde },
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
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  etiqueta: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: t.panel,
  },
  etiquetaTexto: {
    color: t.acento,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  filaSub: { color: t.textoSecundario, fontFamily: fonts.body, fontSize: 13 },
  filaMonto: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
  filaMontoIngreso: { color: t.ingresoTexto },
});
