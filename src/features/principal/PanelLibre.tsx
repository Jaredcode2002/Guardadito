import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Frasco } from "@/components/frasco/Frasco";
import type { Resumen } from "@/db";
import { nombreMes } from "@/lib/fechas";
import { formatearLempirasCompacto, formatearNumero } from "@/lib/formato";
import { crearEstilos } from "@/styles/features/principal/PanelLibre.styles";
import { colorDeEstado, useEstilos, useTema } from "@/theme";

import { chipDelPanel, textosPanel } from "./textos";

export function PanelLibre({
  resumen,
  onMantenerFrasco,
}: {
  resumen: Resumen;
  onMantenerFrasco?: () => void;
}) {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
  const insets = useSafeAreaInsets();
  const chip = chipDelPanel(resumen);
  const { detalle, aviso } = textosPanel(resumen);

  return (
    <View style={[styles.panel, { paddingTop: insets.top + 22 }]}>
      <View style={styles.decoracion} />

      <View style={styles.encabezado}>
        <Text style={styles.mes}>{nombreMes(resumen.mes)}</Text>
        <View style={[styles.chip, { backgroundColor: colorDeEstado(tema, chip.estado) }]}>
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
            style={[styles.libre, { color: colorDeEstado(tema, resumen.estado) }]}
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
