import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  fondo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: t.fondo,
    zIndex: 100,
    elevation: 100,
  },
  toque: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },
  nombre: { flexDirection: "row" },
  letra: {
    color: t.texto,
    fontFamily: fonts.logo,
    fontSize: 48,
    lineHeight: 60,
  },
});
