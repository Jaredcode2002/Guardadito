import { StyleSheet } from "react-native";

import { fonts } from "@/theme";

export const styles = StyleSheet.create({
  vistaPrevia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 22,
  },
  vistaPreviaTextos: { flex: 1, gap: 2 },
  vistaPreviaTexto: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
