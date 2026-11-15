import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  contenedor: { gap: 10 },
  rejilla: { flexDirection: "row", gap: 8 },
  tarjeta: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: t.borde,
    backgroundColor: t.superficie,
    overflow: "hidden",
  },
  tarjetaActiva: { borderColor: t.texto },
  presionada: { opacity: 0.8 },
  muestra: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: t.panel,
  },
  pie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 44,
    paddingHorizontal: 4,
  },
  nombre: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: t.texto },
  estados: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: t.panel,
  },
});
