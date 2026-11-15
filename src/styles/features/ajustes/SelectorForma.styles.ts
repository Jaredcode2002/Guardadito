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
  marca: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.acento,
  },
  pie: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 4,
  },
  nombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: t.texto,
    textAlign: "center",
  },
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
