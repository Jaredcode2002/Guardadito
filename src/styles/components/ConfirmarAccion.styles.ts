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
    padding: 24,
    borderRadius: 36,
    backgroundColor: palette.crema,
  },
  titulo: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  mensaje: {
    marginTop: 10,
    color: palette.tinta,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  botones: { flexDirection: "row", gap: 10, marginTop: 22 },
  boton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelar: { borderWidth: 1.5, borderColor: palette.tinta },
  destructivo: { backgroundColor: palette.coral },
  presionado: { opacity: 0.6 },
  botonTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
});
