import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  barra: {
    height: 68,
    borderRadius: 34,
    backgroundColor: t.panel,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 14,
    paddingRight: 8,
  },
  flotante: { position: "absolute", left: 20, right: 20 },
  incrustada: {
    backgroundColor: "transparent",
    paddingLeft: 0,
    paddingRight: 0,
  },
  accesos: { flexDirection: "row", gap: 2 },
  acceso: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  accesoPresionado: { backgroundColor: t.presionadoPanel },
  anadir: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 14,
    paddingRight: 20,
    borderRadius: 26,
    backgroundColor: t.acento,
  },
  anadirTexto: {
    color: t.sobreAcento,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
});
