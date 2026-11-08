import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Frasco } from "@/components/frasco/Frasco";
import type { Resumen } from "@/db";
import { nombreMes } from "@/lib/fechas";
import { formatearLempirasCompacto, formatearNumero } from "@/lib/formato";
import { colors, fonts, palette } from "@/theme";

import { BarraInferior, type RutaAcceso } from "./BarraInferior";
import { chipDelPanel, COLOR_LIBRE, textosPanel } from "./textos";

const TEXTO_SUAVE = "rgba(246,241,231,0.74)";

export function PanelLateral({
  resumen,
  ancho,
  onMantenerFrasco,
  onAnadir,
  onAcceso,
}: {
  resumen: Resumen;
  ancho: number;
  onMantenerFrasco: () => void;
  onAnadir: () => void;
  onAcceso: (ruta: RutaAcceso) => void;
}) {
  const insets = useSafeAreaInsets();
  const chip = chipDelPanel(resumen);
  const { detalle, aviso } = textosPanel(resumen);

  return (
    <View
      style={[
        styles.panel,
        {
          width: ancho,
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 24,
          paddingLeft: insets.left + 32,
        },
      ]}
    >
      <View style={styles.decoracion} />
      <ScrollView
        style={styles.desplazable}
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <Text style={styles.mes}>{nombreMes(resumen.mes)}</Text>
          <View style={[styles.chip, { backgroundColor: chip.color }]}>
            <Text style={styles.chipTexto}>{chip.texto}</Text>
          </View>
        </View>

        <Text style={[styles.etiqueta, styles.etiquetaDinero]}>DINERO</Text>
        <View style={styles.dinero}>
          <Text style={styles.moneda}>{resumen.dinero < 0 ? "−L" : "L"}</Text>
          <Text
            style={styles.dineroNumero}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatearNumero(Math.abs(resumen.dinero))}
          </Text>
        </View>

        <View style={styles.libreFila}>
          <Pressable
            onLongPress={onMantenerFrasco}
            delayLongPress={600}
            accessibilityHint="Mantén presionado para abrir la galería del frasco"
          >
            <Frasco
              estado={resumen.estado}
              porcentaje={resumen.porcentaje}
              ancho={150}
            />
          </Pressable>
          <View style={styles.libreTextos}>
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
        </View>
      </ScrollView>

      <View style={styles.pie}>
        <View style={styles.ahorro}>
          <View style={styles.ahorroTextos}>
            <Text style={styles.etiqueta}>FONDO DE AHORRO</Text>
            <Text style={styles.detalle}>Solo se toca con tu confirmación</Text>
          </View>
          <Text style={styles.ahorroMonto}>
            {formatearLempirasCompacto(resumen.saldoAhorro)}
          </Text>
        </View>
        <BarraInferior incrustada onAnadir={onAnadir} onAcceso={onAcceso} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: "hidden",
    backgroundColor: colors.panel,
    borderTopRightRadius: 44,
    borderBottomRightRadius: 44,
    paddingRight: 32,
  },
  decoracion: {
    position: "absolute",
    right: -90,
    top: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(200,241,89,0.07)",
  },
  desplazable: { flex: 1 },
  contenido: { paddingBottom: 16 },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mes: { color: TEXTO_SUAVE, fontFamily: fonts.bodyMedium, fontSize: 15 },
  chip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  chipTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  etiqueta: {
    color: TEXTO_SUAVE,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 1.3,
  },
  etiquetaDinero: { marginTop: 22 },
  dinero: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  moneda: { color: TEXTO_SUAVE, fontFamily: fonts.display, fontSize: 30 },
  dineroNumero: {
    flexShrink: 1,
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 84,
    lineHeight: 92,
    letterSpacing: -3,
    fontVariant: ["tabular-nums"],
  },
  libreFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    marginTop: 26,
  },
  libreTextos: { flex: 1, minWidth: 0 },
  libre: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 52,
    fontVariant: ["tabular-nums"],
  },
  detalle: {
    marginTop: 4,
    color: TEXTO_SUAVE,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  aviso: {
    marginTop: 6,
    color: palette.coral,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  pie: { gap: 14 },
  ahorro: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: palette.panelSecundario,
  },
  ahorroTextos: { flex: 1, minWidth: 0 },
  ahorroMonto: {
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 30,
  },
});
