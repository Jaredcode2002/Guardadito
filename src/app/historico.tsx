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

import { Chip } from "@/components/formulario";
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
import { crearEstilos } from "@/styles/app/historico.styles";
import { useEstilos, useTema } from "@/theme";

function nombreDelMes(mes: MesId): string {
  return nombreMes(mes).split(" ")[0].toLowerCase();
}

export default function Historico() {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
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
        <ActivityIndicator color={tema.texto} />
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
              <Icono nombre="atras" color={tema.textoSobrePanel} />
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
            <View style={[styles.franja, styles.franjaUsado]}>
              <Text style={styles.franjaTexto}>
                Ahorro usado en {nombreDelMes(mes)}
              </Text>
              <Text style={styles.franjaMonto}>{L(totales.ahorroUsado)}</Text>
            </View>
          )}
          {totales.alAhorro > 0 && (
            <View style={[styles.franja, styles.franjaGuardado]}>
              <Text style={[styles.franjaTexto, styles.franjaGuardadoTexto]}>
                Guardado en el ahorro
              </Text>
              <Text style={[styles.franjaMonto, styles.franjaGuardadoMonto]}>
                {L(totales.alAhorro)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.contenido}>
          <View style={styles.opciones}>
            <Pressable
              onPress={() => router.push("/exportar")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.opcion, pressed && styles.presionada]}
            >
              <Icono nombre="bajar" color={tema.texto} tamano={18} />
              <Text style={styles.opcionTexto}>Exportar CSV</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/borrar-historial")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.opcion, pressed && styles.presionada]}
            >
              <Icono nombre="basura" color={tema.peligroTexto} tamano={18} />
              <Text style={[styles.opcionTexto, styles.opcionPeligro]}>
                Borrar historial
              </Text>
            </Pressable>
          </View>

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
  const styles = useEstilos(crearEstilos);
  return (
    <View style={styles.total}>
      <Text style={styles.totalEtiqueta}>{etiqueta}</Text>
      <Text style={styles.totalMonto}>{L(monto)}</Text>
    </View>
  );
}
