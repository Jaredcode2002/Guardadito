import { StyleSheet } from "react-native";

import { type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  anillo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  anilloActivo: { borderColor: t.texto },
  muestra: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
