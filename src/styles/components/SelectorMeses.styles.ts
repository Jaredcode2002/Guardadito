import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  scroll: { marginTop: 14, marginHorizontal: -22 },
  scrollFondo: { marginTop: 4, marginHorizontal: -20 },
  meses: { gap: 8, paddingHorizontal: 22 },
  mesesFondo: { paddingHorizontal: 20 },
  mes: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.lineaPanel,
  },
  mesFondo: { borderColor: t.borde },
  mesActivo: { borderColor: t.acento, backgroundColor: t.acento },
  texto: { color: t.textoSobrePanel, fontFamily: fonts.bodyMedium, fontSize: 14 },
  textoFondo: { color: t.texto },
  textoActivo: { color: t.sobreAcento, fontFamily: fonts.bodySemiBold },
});
