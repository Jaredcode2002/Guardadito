import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  ayuda: { color: t.textoSecundario, fontFamily: fonts.body, fontSize: 14, marginTop: 6 },
});
