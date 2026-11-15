import { StyleSheet } from "react-native";

import { fonts, GRIS, palette } from "@/theme";

export const TAMANO = 220;

export const styles = StyleSheet.create({
  contenedor: { gap: 18 },
  grafico: {
    alignSelf: "center",
    width: TAMANO,
    height: TAMANO,
  },
  centro: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
  },
  centroEtiqueta: { color: GRIS, fontFamily: fonts.bodyMedium, fontSize: 13 },
  centroMonto: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 24,
  },
  leyenda: { gap: 2 },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  filaActiva: { backgroundColor: "#EAE2D0" },
  muestra: { width: 12, height: 12, borderRadius: 6 },
  nombre: {
    flex: 1,
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  valor: {
    color: GRIS,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
});
