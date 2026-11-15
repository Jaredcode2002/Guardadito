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
  secundario: {
    height: 52,
    marginTop: 10,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: t.bordeFuerte,
    alignItems: "center",
    justifyContent: "center",
  },
  secundarioTexto: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  inactivo: { opacity: 0.4 },
});
