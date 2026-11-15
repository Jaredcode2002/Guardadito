import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  fondo: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    padding: 24,
    backgroundColor: t.velo,
    zIndex: 10,
    elevation: 10,
  },
  tarjeta: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    alignItems: "center",
    padding: 24,
    borderRadius: 36,
    backgroundColor: t.fondo,
  },
  frasco: { alignItems: "center" },
  titulo: {
    marginTop: 10,
    color: t.texto,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    textAlign: "center",
  },
  pildora: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingTop: 2,
    paddingBottom: 4,
    borderRadius: 26,
    backgroundColor: t.liquido.crit,
  },
  pildoraTexto: {
    color: t.sobreLiquido,
    fontFamily: fonts.display,
    fontSize: 46,
    letterSpacing: -1,
  },
  nota: {
    marginTop: 8,
    color: t.peligroTexto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    textAlign: "center",
  },
  detalle: {
    marginTop: 14,
    color: t.texto,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  boton: {
    alignSelf: "stretch",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  mejorNo: { marginTop: 20, backgroundColor: t.acento },
  mejorNoTexto: { color: t.sobreAcento },
  igual: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: t.texto,
  },
  presionado: { opacity: 0.6 },
  botonTexto: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
});
