import { StyleSheet } from "react-native";

import { fonts, palette } from "@/theme";

export const styles = StyleSheet.create({
  fondo: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(20,35,27,0.62)",
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
    backgroundColor: palette.crema,
  },
  frasco: { alignItems: "center" },
  titulo: {
    marginTop: 10,
    color: palette.tinta,
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
    backgroundColor: palette.coral,
  },
  pildoraTexto: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 46,
    letterSpacing: -1,
  },
  negativo: {
    marginTop: 8,
    color: "#A12F22",
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    textAlign: "center",
  },
  detalle: {
    marginTop: 14,
    color: palette.tinta,
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
  mejorNo: { marginTop: 20, backgroundColor: palette.lima },
  igual: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: palette.tinta,
  },
  presionado: { opacity: 0.6 },
  botonTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
});
