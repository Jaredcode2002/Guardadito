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
    padding: 24,
    borderRadius: 36,
    backgroundColor: t.fondo,
  },
  titulo: {
    color: t.texto,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  mensaje: {
    marginTop: 10,
    color: t.texto,
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
  cancelar: { borderWidth: 1.5, borderColor: t.texto },
  destructivo: { backgroundColor: t.liquido.crit },
  destructivoTexto: { color: t.sobreLiquido },
  presionado: { opacity: 0.6 },
  botonTexto: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
});
