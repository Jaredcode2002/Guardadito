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

import { Chip, GRIS } from "@/components/formulario";
import { Icono } from "@/components/Icono";
import { SelectorMeses } from "@/components/SelectorMeses";
import { momentoActual } from "@/db";
import {
  agruparPorDia,
  armarFilas,
  categoriasDelMes,
  filtrarPorCategoria,
  resumenDelFiltro,
  totalesDelMes,
} from "@/features/historico/logica";
import { ListaDias } from "@/features/historico/ListaDias";
import { useHistorico } from "@/features/historico/useHistorico";
import { mesDe, nombreMes, type MesId } from "@/lib/fechas";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { ANCHO_CONTENIDO, colors, fonts, palette } from "@/theme";

const TEXTO_SUAVE = "rgba(246,241,231,0.74)";
function nombreDelMes(mes: MesId): string {
  return nombreMes(mes).split(" ")[0].toLowerCase();
}

export default function Historico() {
  const { meses, mes, movimientos, error, elegirMes } = useHistorico();
  const insets = useSafeAreaInsets();
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const mesActual = mesDe(momentoActual().hoy);

  const vista = useMemo(() => {
    if (!movimientos) return null;
    const filas = armarFilas(movimientos);
    const filtradas = filtrarPorCategoria(filas, categoriaId);
    return {
      totales: totalesDelMes(movimientos),
      categorias: categoriasDelMes(movimientos),
      filtradas,
      dias: agruparPorDia(filtradas, momentoActual().hoy),
    };
  }, [movimientos, categoriaId]);

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!vista || !mes) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.texto} />
      </View>
    );
  }

  const { totales } = vista;

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
            <Text style={styles.tituloPanel}>Histórico</Text>
          </View>

          <SelectorMeses
            meses={meses}
            mes={mes}
            mesActual={mesActual}
            onElegir={(m) => {
              setCategoriaId(null);
              elegirMes(m);
            }}
          />

          <View style={styles.totales}>
            <Total etiqueta="Ingresos" monto={totales.ingresos} />
            <Total etiqueta="Gastos" monto={totales.gastos} />
          </View>
          {totales.ahorroUsado > 0 && (
            <View style={[styles.franja, { backgroundColor: palette.ambar }]}>
              <Text style={styles.franjaTexto}>
                Ahorro usado en {nombreDelMes(mes)}
              </Text>
              <Text style={styles.franjaMonto}>{L(totales.ahorroUsado)}</Text>
            </View>
          )}
          {totales.alAhorro > 0 && (
            <View style={[styles.franja, styles.franjaGuardado]}>
              <Text style={[styles.franjaTexto, { color: palette.crema }]}>
                Guardado en el ahorro
              </Text>
              <Text style={[styles.franjaMonto, { color: palette.lima }]}>
                {L(totales.alAhorro)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.contenido}>
          {vista.categorias.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categorias}
              style={styles.categoriasScroll}
            >
              <Chip
                texto="Todas"
                activo={categoriaId === null}
                onPress={() => setCategoriaId(null)}
              />
              {vista.categorias.map((c) => (
                <Chip
                  key={c.id}
                  texto={c.texto}
                  activo={categoriaId === c.id}
                  onPress={() =>
                    setCategoriaId(categoriaId === c.id ? null : c.id)
                  }
                />
              ))}
            </ScrollView>
          )}

          {categoriaId !== null && (
            <Text style={styles.resumenFiltro}>
              {resumenDelFiltro(vista.filtradas)}
            </Text>
          )}

          {vista.dias.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>Sin movimientos</Text>
              <Text style={styles.vacioTexto}>
                Lo que registres en {nombreDelMes(mes)} aparecerá aquí.
              </Text>
            </View>
          ) : (
            <ListaDias dias={vista.dias} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Total({ etiqueta, monto }: { etiqueta: string; monto: number }) {
  return (
    <View style={styles.total}>
      <Text style={styles.totalEtiqueta}>{etiqueta}</Text>
      <Text style={styles.totalMonto}>{L(monto)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  columna: { width: "100%", maxWidth: ANCHO_CONTENIDO, alignSelf: "center" },
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
  totales: { flexDirection: "row", gap: 10, marginTop: 16 },
  total: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: palette.panelSecundario,
  },
  totalEtiqueta: { color: TEXTO_SUAVE, fontFamily: fonts.body, fontSize: 12 },
  totalMonto: {
    marginTop: 2,
    color: palette.crema,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  franja: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  franjaGuardado: { backgroundColor: palette.panelSecundario },
  franjaTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  franjaMonto: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 24,
  },
  contenido: { paddingHorizontal: 20 },
  categoriasScroll: { marginTop: 16, marginHorizontal: -20 },
  categorias: { gap: 8, paddingHorizontal: 20 },
  resumenFiltro: {
    marginTop: 10,
    marginLeft: 4,
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  vacio: {
    alignItems: "center",
    gap: 4,
    marginTop: 18,
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
