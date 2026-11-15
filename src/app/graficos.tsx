import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Selector } from "@/components/formulario";
import { Icono } from "@/components/Icono";
import { SelectorMeses } from "@/components/SelectorMeses";
import { momentoActual } from "@/db";
import { Barras } from "@/features/graficos/Barras";
import { Dona } from "@/features/graficos/Dona";
import { gastosPorCategoria, totalGastado } from "@/features/graficos/logica";
import { useHistorico } from "@/features/historico/useHistorico";
import { mesDe, nombreMes } from "@/lib/fechas";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { styles } from "@/styles/app/graficos.styles";
import { colors, palette } from "@/theme";

type Vista = "barras" | "pastel";

const VISTAS = [
  { valor: "barras", texto: "Barras" },
  { valor: "pastel", texto: "Pastel" },
] as const;

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
        contentContainerStyle={[
          styles.columna,
          { paddingBottom: 40 + insets.bottom },
        ]}
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
