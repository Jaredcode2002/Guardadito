import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  boton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.borde,
    backgroundColor: t.fondo,
    alignItems: "center",
    justifyContent: "center",
  },
  inactivo: { opacity: 0.35 },
  valor: {
    minWidth: 44,
    textAlign: "center",
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
});
