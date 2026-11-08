import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Frasco } from "@/components/frasco/Frasco";
import type { Resumen } from "@/db";
import { nombreMes } from "@/lib/fechas";
import { formatearLempirasCompacto, formatearNumero } from "@/lib/formato";
import { colors, fonts, palette, spacing } from "@/theme";

import { chipDelPanel, COLOR_LIBRE, textosPanel } from "./textos";

const TEXTO_SUAVE = "rgba(246,241,231,0.74)";

export function PanelLibre({
  resumen,
  onMantenerFrasco,
}: {
  resumen: Resumen;
  onMantenerFrasco?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const chip = chipDelPanel(resumen);
  const { detalle, aviso } = textosPanel(resumen);

  return (
    <View style={[styles.panel, { paddingTop: insets.top + 22 }]}>
      <View style={styles.decoracion} />

      <View style={styles.encabezado}>
        <Text style={styles.mes}>{nombreMes(resumen.mes)}</Text>
        <View style={[styles.chip, { backgroundColor: chip.color }]}>
          <Text style={styles.chipTexto}>{chip.texto}</Text>
        </View>
      </View>

      <View style={styles.cuerpo}>
        <View style={styles.cifras}>
          <Text style={styles.etiqueta}>DINERO</Text>
          <View style={styles.dinero}>
            <Text style={styles.moneda}>
              {resumen.dinero < 0 ? "−L" : "L"}
            </Text>
            <Text
              style={styles.dineroNumero}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatearNumero(Math.abs(resumen.dinero))}
            </Text>
          </View>

          <View style={styles.divisor} />

          <Text style={styles.etiqueta}>LIBRE TRAS PENDIENTES</Text>
          <Text
            style={[styles.libre, { color: COLOR_LIBRE[resumen.estado] }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatearLempirasCompacto(resumen.libre)}
          </Text>
          <Text style={styles.detalle}>{detalle}</Text>
          {aviso && <Text style={styles.aviso}>{aviso}</Text>}
        </View>

        <Pressable
          onLongPress={onMantenerFrasco}
          delayLongPress={600}
          accessibilityHint="Mantén presionado para abrir la galería del frasco"
        >
          <Frasco estado={resumen.estado} porcentaje={resumen.porcentaje} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: "hidden",
    backgroundColor: colors.panel,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 22,
    paddingBottom: 26,
  },
  decoracion: {
    position: "absolute",
    right: -70,
    top: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(200,241,89,0.07)",
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mes: { color: TEXTO_SUAVE, fontFamily: fonts.bodyMedium, fontSize: 14 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  cuerpo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  cifras: { flex: 1, minWidth: 0 },
  etiqueta: {
    color: TEXTO_SUAVE,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  dinero: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },
  moneda: { color: TEXTO_SUAVE, fontFamily: fonts.display, fontSize: 22 },
  dineroNumero: {
    flexShrink: 1,
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 54,
    letterSpacing: -1.5,
    lineHeight: 58,
    fontVariant: ["tabular-nums"],
  },
  divisor: {
    height: 1,
    backgroundColor: "rgba(246,241,231,0.16)",
    marginTop: 16,
    marginBottom: 14,
  },
  libre: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    fontVariant: ["tabular-nums"],
  },
  detalle: {
    color: TEXTO_SUAVE,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  aviso: {
    color: palette.coral,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginTop: spacing.xs + 2,
  },
});
