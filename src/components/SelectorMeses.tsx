import { Pressable, ScrollView, Text } from "react-native";

import { mesCorto, nombreMes, type MesId } from "@/lib/fechas";
import { crearEstilos } from "@/styles/components/SelectorMeses.styles";
import { useEstilos } from "@/theme";

export function SelectorMeses({
  meses,
  mes,
  mesActual,
  onElegir,
  sobre = "panel",
}: {
  meses: readonly MesId[];
  mes: MesId;
  mesActual: MesId;
  onElegir: (m: MesId) => void;
  sobre?: "panel" | "fondo";
}) {
  const styles = useEstilos(crearEstilos);
  const fondo = sobre === "fondo";
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.meses, fondo && styles.mesesFondo]}
      style={[styles.scroll, fondo && styles.scrollFondo]}
    >
      {meses.map((m) => {
        const activo = m === mes;
        return (
          <Pressable
            key={m}
            onPress={() => onElegir(m)}
            accessibilityRole="button"
            accessibilityLabel={nombreMes(m)}
            accessibilityState={{ selected: activo }}
            style={[
              styles.mes,
              fondo && styles.mesFondo,
              activo && styles.mesActivo,
            ]}
          >
            <Text
              style={[
                styles.texto,
                fondo && styles.textoFondo,
                activo && styles.textoActivo,
              ]}
            >
              {mesCorto(m, mesActual)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
