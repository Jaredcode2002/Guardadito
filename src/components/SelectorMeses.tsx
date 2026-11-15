import { Pressable, ScrollView, Text } from "react-native";

import { mesCorto, nombreMes, type MesId } from "@/lib/fechas";
import { styles } from "@/styles/components/SelectorMeses.styles";

export function SelectorMeses({
  meses,
  mes,
  mesActual,
  onElegir,
}: {
  meses: readonly MesId[];
  mes: MesId;
  mesActual: MesId;
  onElegir: (m: MesId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.meses}
      style={styles.scroll}
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
            style={[styles.mes, activo && styles.mesActivo]}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>
              {mesCorto(m, mesActual)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
