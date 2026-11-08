import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { mesCorto, nombreMes, type MesId } from "@/lib/fechas";
import { fonts, palette } from "@/theme";

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

const styles = StyleSheet.create({
  scroll: { marginTop: 14, marginHorizontal: -22 },
  meses: { gap: 8, paddingHorizontal: 22 },
  mes: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(246,241,231,0.16)",
  },
  mesActivo: { borderColor: palette.lima, backgroundColor: palette.lima },
  texto: { color: palette.crema, fontFamily: fonts.bodyMedium, fontSize: 14 },
  textoActivo: { color: palette.tinta, fontFamily: fonts.bodySemiBold },
});
