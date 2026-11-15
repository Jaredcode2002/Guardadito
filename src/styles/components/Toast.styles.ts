import { StyleSheet } from "react-native";

import { fonts, fontSizes, spacing, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  toast: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: t.panel,
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  toastSimple: {
    minHeight: 56,
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 6,
  },
  toastGrande: {
    borderRadius: 28,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 6,
  },
  textos: { flex: 1, gap: 4 },
  titulo: { fontFamily: fonts.display, fontSize: 19, lineHeight: 22 },
  texto: { fontFamily: fonts.body, fontSize: fontSizes.sm, lineHeight: 19 },
  boton: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  botonArriba: { alignSelf: "flex-start" },
  accion: { fontFamily: fonts.bodySemiBold, fontSize: fontSizes.sm },
});
