import { StyleSheet } from "react-native";

import { fonts, fontSizes, radii, spacing, type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: t.fondo },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  titulo: {
    color: t.texto,
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
  },
  panel: {
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: t.panel,
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
    color: t.textoSobrePanel,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.md,
  },
  etiquetaChica: {
    color: t.textoSobrePanel,
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: t.borde,
  },
  chipActivo: { backgroundColor: t.acento },
  chipTexto: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
  },
  chipTextoActivo: { color: t.sobreAcento },
  volver: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: t.panel,
  },
  volverTexto: {
    color: t.textoSobrePanel,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.md,
  },
});
