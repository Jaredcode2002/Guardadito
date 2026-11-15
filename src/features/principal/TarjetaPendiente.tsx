import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  LinearTransition,
  SlideOutRight,
} from "react-native-reanimated";

import { Icono } from "@/components/Icono";
import type { PendienteMes } from "@/db";
import { abreviaturaMes, diaDe, type Fecha } from "@/lib/fechas";
import { formatearLempirasCompacto } from "@/lib/formato";
import { styles } from "@/styles/features/principal/TarjetaPendiente.styles";
import { durations, palette } from "@/theme";

export function TarjetaPendiente({
  pendiente,
  hoy,
  ocupado,
  onPagar,
}: {
  pendiente: PendienteMes;
  hoy: Fecha;
  ocupado: boolean;
  onPagar: () => void;
}) {
  const vencido = pendiente.fechaVence < hoy;

  return (
    <Animated.View
      entering={FadeIn.duration(durations.fast)}
      exiting={SlideOutRight.duration(durations.normal)}
      layout={LinearTransition.duration(durations.normal)}
      style={styles.tarjeta}
    >
      <View style={styles.ficha}>
        <Text style={[styles.fichaMes, vencido && styles.fichaVencida]}>
          {abreviaturaMes(pendiente.fechaVence)}
        </Text>
        <Text style={styles.fichaDia}>{diaDe(pendiente.fechaVence)}</Text>
      </View>

      <View style={styles.textos}>
        <Text style={styles.nombre} numberOfLines={1}>
          {pendiente.nombre}
        </Text>
        <Text style={styles.monto}>
          {formatearLempirasCompacto(pendiente.monto)}
        </Text>
        {vencido && <Text style={styles.vencido}>Vencido</Text>}
      </View>

      <Pressable
        onPress={onPagar}
        disabled={ocupado}
        accessibilityRole="button"
        accessibilityLabel={`Pagar ${pendiente.nombre}`}
        style={({ pressed }) => [
          styles.boton,
          (pressed || ocupado) && styles.botonPresionado,
        ]}
      >
        <View style={styles.botonCirculo}>
          <Icono nombre="flecha" color={palette.lima} tamano={18} />
        </View>
        <Text style={styles.botonTexto}>Pagar</Text>
      </Pressable>
    </Animated.View>
  );
}
