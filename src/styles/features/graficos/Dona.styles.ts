import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const TAMANO = 220;

export const crearEstilos = (t: Tema) => StyleSheet.create({
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
  centroEtiqueta: { color: t.textoSecundario, fontFamily: fonts.bodyMedium, fontSize: 13 },
  centroMonto: {
    color: t.texto,
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
  filaActiva: { backgroundColor: t.borde },
  muestra: { width: 12, height: 12, borderRadius: 6 },
  nombre: {
    flex: 1,
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  valor: {
    color: t.textoSecundario,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
});
