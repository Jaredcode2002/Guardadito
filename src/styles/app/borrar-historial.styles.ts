import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  nota: {
    color: t.textoSecundario,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  resumen: {
    color: t.texto,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 16,
  },
  aviso: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: t.tono.crit.suave,
  },
  avisoTexto: {
    color: t.tono.crit.texto,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
});
