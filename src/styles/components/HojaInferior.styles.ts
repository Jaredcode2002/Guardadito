import { StyleSheet } from "react-native";

import { ANCHO_HOJA, palette } from "@/theme";

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(20,35,27,0.55)",
  },
  hoja: {
    width: "100%",
    maxWidth: ANCHO_HOJA,
    alignSelf: "center",
    maxHeight: "92%",
    backgroundColor: palette.crema,
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
    backgroundColor: "#EAE2D0",
    marginBottom: 16,
  },
});
