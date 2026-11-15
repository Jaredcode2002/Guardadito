import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  rejilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tarjeta: {
    flexGrow: 1,
    flexBasis: "45%",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: t.borde,
    overflow: "hidden",
  },
  tarjetaActiva: { borderColor: t.texto },
  presionada: { opacity: 0.8 },
  muestraPanel: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  puntos: { flexDirection: "row", gap: 5, paddingBottom: 6 },
  punto: { width: 12, height: 12, borderRadius: 6 },
  pie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  nombre: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  linea: { height: 6, borderRadius: 3, marginTop: 4, width: "60%" },
});
