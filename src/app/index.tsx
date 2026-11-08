import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { previsualizarGasto, registrarGasto, registrarIngreso } from "@/db";
import { useResumen } from "@/features/resumen/useResumen";
import type { NivelAlerta } from "@/lib/alertas";
import { formatearLempiras, parsearLempiras } from "@/lib/formato";
import type { EstadoFrasco } from "@/lib/frasco";
import type { Centavos } from "@/lib/money";
import { colors, fontSizes, palette, radii, spacing } from "@/theme";

const ESTADO: Record<EstadoFrasco, { texto: string; color: string }> = {
  ok: { texto: "Vas bien", color: palette.lima },
  mod: { texto: "Con moderación", color: palette.ambar },
  crit: { texto: "Casi en cero", color: palette.coral },
  zero: { texto: "En cero", color: palette.crema },
  roto: { texto: "Tocaste el ahorro", color: palette.coral },
};

const ALERTA: Record<NivelAlerta, string> = {
  moderacion: "Te queda menos del 30 % de tu Libre.",
  casiCero: "Te queda menos del 10 % de tu Libre.",
  cero: "Tu Libre llegó a cero.",
};

export default function Inicio() {
  const { db, resumen, error, recargar } = useResumen();
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const monto = parsearLempiras(texto);

  async function intentar(accion: () => Promise<string>) {
    try {
      setAviso(await accion());
      setTexto("");
    } catch (e) {
      setAviso(e instanceof Error ? e.message : String(e));
    }
    await recargar();
  }

  function ingresar() {
    if (monto === null) return;
    intentar(async () => {
      await registrarIngreso(db, { monto, descripcion: "Prueba" });
      return `Ingreso de ${formatearLempiras(monto)} registrado.`;
    });
  }

  function guardarGasto(m: Centavos) {
    intentar(async () => {
      const r = await registrarGasto(db, { monto: m, descripcion: "Prueba" });
      return r.alerta
        ? ALERTA[r.alerta]
        : `Gasto de ${formatearLempiras(m)} registrado.`;
    });
  }

  async function gastar() {
    if (monto === null) return;
    const plan = await previsualizarGasto(db, monto);
    if (plan.desdeAhorro === 0 && plan.enNegativo === 0) {
      guardarGasto(monto);
      return;
    }
    const lineas: string[] = [];
    if (plan.desdeAhorro > 0) {
      lineas.push(
        `Este gasto tocará ${formatearLempiras(plan.desdeAhorro)} de tu ahorro.`,
      );
    }
    if (plan.enNegativo > 0) {
      lineas.push(
        `Quedarás ${formatearLempiras(plan.enNegativo)} en negativo.`,
      );
    }
    Alert.alert("¿Seguro?", lineas.join("\n"), [
      { text: "Gastar igual", onPress: () => guardarGasto(monto) },
      { text: "Mejor no gastar", style: "cancel" },
    ]);
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centro}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!resumen) {
    return (
      <SafeAreaView style={styles.centro}>
        <ActivityIndicator color={colors.texto} />
      </SafeAreaView>
    );
  }

  const estado = ESTADO[resumen.estado];

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.panel}>
        <Text style={styles.etiquetaPanel}>Libre</Text>
        <Text style={[styles.libre, { color: estado.color }]}>
          {formatearLempiras(resumen.libre)}
        </Text>
        <Text style={styles.estado}>
          {estado.texto} · {Math.round(resumen.porcentaje * 100)} %
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <Fila etiqueta="Dinero" valor={resumen.dinero} />
        <Fila etiqueta="Pendientes" valor={resumen.pendientesSinPagar} />
        <Fila etiqueta="Libre inicial" valor={resumen.libreInicial} />
        <Fila etiqueta="Ahorro" valor={resumen.saldoAhorro} />
      </View>

      <TextInput
        style={styles.input}
        value={texto}
        onChangeText={setTexto}
        placeholder="Monto en lempiras"
        placeholderTextColor="#17231C80"
        keyboardType="decimal-pad"
      />
      <View style={styles.botones}>
        <Boton texto="Ingreso" onPress={ingresar} activo={monto !== null} />
        <Boton
          texto="Gasto"
          onPress={gastar}
          activo={monto !== null}
          oscuro
        />
      </View>

      {aviso && <Text style={styles.aviso}>{aviso}</Text>}
    </SafeAreaView>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: Centavos }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.filaValor}>{formatearLempiras(valor)}</Text>
    </View>
  );
}

function Boton({
  texto,
  onPress,
  activo,
  oscuro = false,
}: {
  texto: string;
  onPress: () => void;
  activo: boolean;
  oscuro?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!activo}
      style={({ pressed }) => [
        styles.boton,
        oscuro && styles.botonOscuro,
        (!activo || pressed) && { opacity: activo ? 0.8 : 0.4 },
      ]}
    >
      <Text style={[styles.botonTexto, oscuro && styles.botonTextoOscuro]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.fondo,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.fondo,
  },
  error: { color: colors.peligro, fontSize: fontSizes.md, textAlign: "center" },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  etiquetaPanel: { color: colors.textoSobrePanel, fontSize: fontSizes.sm },
  libre: { fontSize: fontSizes.xxl, fontWeight: "700" },
  estado: { color: colors.textoSobrePanel, fontSize: fontSizes.sm },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fila: { flexDirection: "row", justifyContent: "space-between" },
  filaEtiqueta: { color: colors.texto, fontSize: fontSizes.md },
  filaValor: { color: colors.texto, fontSize: fontSizes.md, fontWeight: "600" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSizes.lg,
    color: colors.texto,
  },
  botones: { flexDirection: "row", gap: spacing.md },
  boton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.acento,
  },
  botonOscuro: { backgroundColor: colors.panel },
  botonTexto: { color: colors.texto, fontSize: fontSizes.md, fontWeight: "600" },
  botonTextoOscuro: { color: colors.textoSobrePanel },
  aviso: { color: colors.texto, fontSize: fontSizes.md, textAlign: "center" },
});
