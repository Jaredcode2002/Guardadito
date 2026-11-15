import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Frasco } from "@/components/frasco/Frasco";
import { estadoFrasco, type EstadoFrasco } from "@/lib/frasco";
import { styles } from "@/styles/app/frasco.styles";

const MUESTRAS: { estado: EstadoFrasco; porcentaje: number }[] = [
  { estado: "ok", porcentaje: 0.68 },
  { estado: "mod", porcentaje: 0.28 },
  { estado: "crit", porcentaje: 0.08 },
  { estado: "zero", porcentaje: 0 },
  { estado: "roto", porcentaje: 0 },
];

const PORCENTAJES = [1, 0.68, 0.35, 0.28, 0.08, 0];

export default function Galeria() {
  const [porcentaje, setPorcentaje] = useState(0.68);
  const [roto, setRoto] = useState(false);
  const estado = estadoFrasco({
    libre: Math.round(porcentaje * 10_000),
    libreInicial: 10_000,
    ahorroTocadoSinReponer: roto,
  });

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Galería del frasco</Text>

        <View style={styles.panel}>
          <Frasco estado={estado} porcentaje={porcentaje} ancho={160} />
          <Text style={styles.etiqueta}>
            {estado} · {Math.round(porcentaje * 100)} %
          </Text>
        </View>

        <View style={styles.chips}>
          {PORCENTAJES.map((p) => (
            <Chip
              key={p}
              texto={`${Math.round(p * 100)} %`}
              activo={p === porcentaje}
              onPress={() => setPorcentaje(p)}
            />
          ))}
          <Chip
            texto="Ahorro tocado"
            activo={roto}
            onPress={() => setRoto((r) => !r)}
          />
        </View>

        <View style={[styles.panel, styles.fila]}>
          {MUESTRAS.map((m) => (
            <View key={m.estado} style={styles.muestra}>
              <Frasco estado={m.estado} porcentaje={m.porcentaje} ancho={56} />
              <Text style={styles.etiquetaChica}>{m.estado}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.back()} style={styles.volver}>
          <Text style={styles.volverTexto}>Volver</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  texto,
  activo,
  onPress,
}: {
  texto: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, activo && styles.chipActivo]}
    >
      <Text style={styles.chipTexto}>{texto}</Text>
    </Pressable>
  );
}
