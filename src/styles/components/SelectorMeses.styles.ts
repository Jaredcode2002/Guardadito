import { StyleSheet } from "react-native";

import { fonts, palette } from "@/theme";

export const styles = StyleSheet.create({
  scroll: { marginTop: 14, marginHorizontal: -22 },
  meses: { gap: 8, paddingHorizontal: 22 },
  mes: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(246,241,231,0.16)",
  },
  mesActivo: { borderColor: palette.lima, backgroundColor: palette.lima },
  texto: { color: palette.crema, fontFamily: fonts.bodyMedium, fontSize: 14 },
  textoActivo: { color: palette.tinta, fontFamily: fonts.bodySemiBold },
});
