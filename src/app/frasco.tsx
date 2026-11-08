import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Frasco } from "@/components/frasco/Frasco";
import { cargarPendientesDeEjemplo } from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import { estadoFrasco, type EstadoFrasco } from "@/lib/frasco";
import { colors, fonts, fontSizes, palette, radii, spacing } from "@/theme";

const MUESTRAS: { estado: EstadoFrasco; porcentaje: number }[] = [
  { estado: "ok", porcentaje: 0.68 },
  { estado: "mod", porcentaje: 0.28 },
  { estado: "crit", porcentaje: 0.08 },
  { estado: "zero", porcentaje: 0 },
  { estado: "roto", porcentaje: 0 },
];

const PORCENTAJES = [1, 0.68, 0.35, 0.28, 0.08, 0];

export default function Galeria() {
  const db = useSQLiteContext();
  const [porcentaje, setPorcentaje] = useState(0.68);
  const [roto, setRoto] = useState(false);
  const estado = estadoFrasco({
    libre: Math.round(porcentaje * 10_000),
    libreInicial: 10_000,
    ahorroTocadoSinReponer: roto,
  });

  async function cargarEjemplo() {
    try {
      const creadas = await cargarPendientesDeEjemplo(db);
      mostrarAviso({
        tono: "oscuro",
        texto:
          creadas > 0
            ? `Se cargaron ${creadas} pendientes de ejemplo`
            : "Los pendientes de ejemplo ya estaban cargados",
      });
    } catch (e) {
      mostrarAviso({
        tono: "coral",
        texto: e instanceof Error ? e.message : String(e),
      });
    }
  }

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

        <Pressable onPress={cargarEjemplo} style={styles.ejemplo}>
          <Text style={styles.ejemploTexto}>Cargar pendientes de ejemplo</Text>
        </Pressable>

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

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  titulo: {
    color: colors.texto,
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
  },
  panel: {
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  muestra: { alignItems: "center", gap: spacing.xs },
  etiqueta: {
    color: colors.textoSobrePanel,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.md,
  },
  etiquetaChica: {
    color: colors.textoSobrePanel,
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: "#EAE2D0",
  },
  chipActivo: { backgroundColor: palette.lima },
  chipTexto: {
    color: colors.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.sm,
  },
  ejemplo: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#4A5850",
  },
  ejemploTexto: {
    color: colors.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.md,
  },
  volver: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.panel,
  },
  volverTexto: {
    color: colors.textoSobrePanel,
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.md,
  },
});
