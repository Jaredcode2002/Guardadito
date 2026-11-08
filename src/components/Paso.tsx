import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts, palette } from "@/theme";

import { Icono } from "./Icono";

export function Paso({
  texto,
  etiqueta,
  onBajar,
  onSubir,
}: {
  texto: string;
  etiqueta: string;
  onBajar: (() => void) | null;
  onSubir: (() => void) | null;
}) {
  return (
    <View style={styles.fila}>
      <Boton
        icono="menos"
        etiqueta={`Bajar ${etiqueta}`}
        onPress={onBajar}
      />
      <Text style={styles.valor}>{texto}</Text>
      <Boton icono="mas" etiqueta={`Subir ${etiqueta}`} onPress={onSubir} />
    </View>
  );
}

function Boton({
  icono,
  etiqueta,
  onPress,
}: {
  icono: "mas" | "menos";
  etiqueta: string;
  onPress: (() => void) | null;
}) {
  return (
    <Pressable
      onPress={onPress ?? undefined}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={[styles.boton, !onPress && styles.inactivo]}
    >
      <Icono nombre={icono} color={palette.tinta} tamano={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  boton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAE2D0",
    backgroundColor: palette.crema,
    alignItems: "center",
    justifyContent: "center",
  },
  inactivo: { opacity: 0.35 },
  valor: {
    minWidth: 44,
    textAlign: "center",
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
});
