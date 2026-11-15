import { Pressable, Text, View } from "react-native";

import { styles } from "@/styles/components/Paso.styles";
import { palette } from "@/theme";

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
