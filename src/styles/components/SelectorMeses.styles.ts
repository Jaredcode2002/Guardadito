import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  scroll: { marginTop: 14, marginHorizontal: -22 },
  meses: { gap: 8, paddingHorizontal: 22 },
  mes: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.lineaPanel,
  },
  mesActivo: { borderColor: t.acento, backgroundColor: t.acento },
  texto: { color: t.textoSobrePanel, fontFamily: fonts.bodyMedium, fontSize: 14 },
  textoActivo: { color: t.sobreAcento, fontFamily: fonts.bodySemiBold },
});
