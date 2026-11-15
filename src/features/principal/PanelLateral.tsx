import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Frasco } from "@/components/frasco/Frasco";
import type { Resumen } from "@/db";
import { nombreMes } from "@/lib/fechas";
import { formatearLempirasCompacto, formatearNumero } from "@/lib/formato";
import { styles } from "@/styles/features/principal/PanelLateral.styles";

import { BarraInferior, type RutaAcceso } from "./BarraInferior";
import { chipDelPanel, COLOR_LIBRE, textosPanel } from "./textos";

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
