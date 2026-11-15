import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  lista: { gap: 16 },
  fila: { gap: 6 },
  textos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
  },
  nombre: {
    flexShrink: 1,
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  valor: {
    color: t.textoSecundario,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  barra: {
    height: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});
