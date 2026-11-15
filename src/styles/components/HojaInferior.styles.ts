import { StyleSheet } from "react-native";

import { ANCHO_HOJA, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: t.velo,
  },
  hoja: {
    width: "100%",
    maxWidth: ANCHO_HOJA,
    alignSelf: "center",
    maxHeight: "92%",
    backgroundColor: t.fondo,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  agarradera: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: t.borde,
    marginBottom: 16,
  },
});
