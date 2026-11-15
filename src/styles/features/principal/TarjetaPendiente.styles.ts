import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 76,
    backgroundColor: t.superficie,
    borderColor: t.borde,
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
    backgroundColor: t.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  fichaMes: {
    color: t.acento,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  fichaVencida: { color: t.liquido.crit },
  fichaDia: {
    color: t.textoSobrePanel,
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 25,
  },
  textos: { flex: 1, minWidth: 0 },
  nombre: { color: t.texto, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  monto: {
    color: t.texto,
    fontFamily: fonts.display,
    fontSize: 19,
    fontVariant: ["tabular-nums"],
  },
  vencido: { color: t.peligroTexto, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingLeft: 4,
    paddingRight: 16,
    borderRadius: 22,
    backgroundColor: t.acento,
  },
  botonPresionado: { opacity: 0.7 },
  botonCirculo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: {
    color: t.sobreAcento,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
});
