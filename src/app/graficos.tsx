import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BORDE, GRIS, PAPEL, Selector } from "@/components/formulario";
import { Icono } from "@/components/Icono";
import { SelectorMeses } from "@/components/SelectorMeses";
import { momentoActual } from "@/db";
import { Barras } from "@/features/graficos/Barras";
import { Dona } from "@/features/graficos/Dona";
import { gastosPorCategoria, totalGastado } from "@/features/graficos/logica";
import { useHistorico } from "@/features/historico/useHistorico";
import { mesDe, nombreMes } from "@/lib/fechas";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { colors, fonts, palette } from "@/theme";

type Vista = "barras" | "pastel";

const VISTAS = [
  { valor: "barras", texto: "Barras" },
  { valor: "pastel", texto: "Pastel" },
] as const;

const TEXTO_SUAVE = "rgba(246,241,231,0.74)";

export default function Graficos() {
  const { meses, mes, movimientos, error, elegirMes } = useHistorico();
  const insets = useSafeAreaInsets();
  const [vista, setVista] = useState<Vista>("barras");
  const mesActual = mesDe(momentoActual().hoy);
  const grupos = useMemo(
    () => (movimientos ? gastosPorCategoria(movimientos) : []),
    [movimientos],
  );

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!movimientos || !mes) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.texto} />
      </View>
    );
  }

  const nombreDelMes = nombreMes(mes).split(" ")[0].toLowerCase();

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.panel, { paddingTop: insets.top + 14 }]}>
          <View style={styles.decoracion} />
          <View style={styles.encabezado}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              style={styles.volver}
            >
              <Icono nombre="atras" color={palette.crema} />
            </Pressable>
            <Text style={styles.tituloPanel}>Gráficos</Text>
          </View>
          <SelectorMeses
            meses={meses}
            mes={mes}
            mesActual={mesActual}
            onElegir={elegirMes}
          />
          <Text style={styles.etiquetaPanel}>
            GASTADO EN {nombreDelMes.toUpperCase()}
          </Text>
          <Text style={styles.total}>{L(totalGastado(grupos))}</Text>
        </View>

        <View style={styles.contenido}>
          <View style={styles.encabezadoSeccion}>
            <Text style={styles.seccion}>Por categoría</Text>
          </View>

          {grupos.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>Sin gastos</Text>
              <Text style={styles.vacioTexto}>
                Cuando registres gastos en {nombreDelMes} verás aquí en qué se
                fue tu dinero.
              </Text>
            </View>
          ) : (
            <>
              <Selector opciones={VISTAS} valor={vista} onCambiar={setVista} />
              <View style={styles.tarjeta}>
                {vista === "barras" ? (
                  <Barras grupos={grupos} />
                ) : (
                  <Dona grupos={grupos} />
                )}
              </View>
              <Text style={styles.nota}>
                Lo que pasaste al ahorro no cuenta como gasto. Cambia el color
                de una categoría tocándola en Ajustes.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.fondo,
  },
  error: { color: colors.peligro, fontFamily: fonts.body, fontSize: 16 },
  panel: {
    overflow: "hidden",
    backgroundColor: colors.panel,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 22,
    paddingBottom: 26,
  },
  decoracion: {
    position: "absolute",
    right: -70,
    top: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(200,241,89,0.07)",
  },
  encabezado: { flexDirection: "row", alignItems: "center", gap: 4 },
  volver: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  tituloPanel: {
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.5,
  },
  etiquetaPanel: {
    marginTop: 18,
    color: TEXTO_SUAVE,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  total: {
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 56,
  },
  contenido: { paddingHorizontal: 20 },
  encabezadoSeccion: { marginTop: 22, marginBottom: 10 },
  seccion: { color: palette.tinta, fontFamily: fonts.display, fontSize: 20 },
  tarjeta: {
    marginTop: 12,
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDE,
    backgroundColor: PAPEL,
  },
  nota: {
    marginTop: 10,
    marginHorizontal: 4,
    color: GRIS,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  vacio: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C9BFA8",
  },
  vacioTitulo: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  vacioTexto: {
    color: GRIS,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: "center",
  },
});
