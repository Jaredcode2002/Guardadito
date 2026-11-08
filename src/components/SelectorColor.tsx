import { Pressable, StyleSheet, View } from "react-native";

import { COLORES_CATEGORIA, type ColorCategoria } from "@/lib/colores";
import { palette } from "@/theme";

import { Icono } from "./Icono";

export function SelectorColor({
  valor,
  onCambiar,
}: {
  valor: ColorCategoria | null;
  onCambiar: (c: ColorCategoria) => void;
}) {
  return (
    <View style={styles.fila}>
      {COLORES_CATEGORIA.map((c) => {
        const activo = c.clave === valor;
        return (
          <Pressable
            key={c.clave}
            onPress={() => onCambiar(c.clave)}
            accessibilityRole="button"
            accessibilityLabel={c.nombre}
            accessibilityState={{ selected: activo }}
            style={[styles.anillo, activo && styles.anilloActivo]}
          >
            <View style={[styles.muestra, { backgroundColor: c.hex }]}>
              {activo && <Icono nombre="check" color={palette.crema} tamano={18} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  anillo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  anilloActivo: { borderColor: palette.tinta },
  muestra: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
