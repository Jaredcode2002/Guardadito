import { StyleSheet } from "react-native";

import { colors, fonts, fontSizes, palette, radii, spacing } from "@/theme";

export const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  titulo: {
    color: colors.texto,
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
  },
  panel: {
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  muestra: { alignItems: "center", gap: spacing.xs },
  etiqueta: {
    color: colors.textoSobrePanel,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.md,
  },
  etiquetaChica: {
    color: colors.textoSobrePanel,
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: "#EAE2D0",
  },
  chipActivo: { backgroundColor: palette.lima },
  chipTexto: {
    color: colors.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
  },
  volver: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.panel,
  },
  volverTexto: {
    color: colors.textoSobrePanel,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.md,
  },
});
