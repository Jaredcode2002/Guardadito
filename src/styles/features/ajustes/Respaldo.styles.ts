import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  tarjeta: {
    backgroundColor: t.superficie,
    borderWidth: 1,
    borderColor: t.borde,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  texto: {
    color: t.textoSecundario,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  ultimo: {
    color: t.texto,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  botones: { flexDirection: "row", gap: 10, marginTop: 2 },
  principal: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: t.acento,
  },
  principalTexto: {
    color: t.sobreAcento,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  secundario: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: t.bordeFuerte,
  },
  secundarioTexto: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  inactivo: { opacity: 0.5 },
});
