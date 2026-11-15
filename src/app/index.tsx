import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEsTablet } from "@/components/useEsTablet";
import {
  deshacerPago,
  momentoActual,
  pagarPendiente,
  type PendienteMes,
} from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import { ListaDias } from "@/features/historico/ListaDias";
import { agruparPorDia, armarFilas } from "@/features/historico/logica";
import { reprogramar } from "@/features/notificaciones/programar";
import {
  BarraInferior,
  type RutaAcceso,
} from "@/features/principal/BarraInferior";
import { PanelLateral } from "@/features/principal/PanelLateral";
import { PanelLibre } from "@/features/principal/PanelLibre";
import { TarjetaPendiente } from "@/features/principal/TarjetaPendiente";
import { resumenPendientes } from "@/features/principal/textos";
import { useResumen } from "@/features/resumen/useResumen";
import { formatearLempirasCompacto } from "@/lib/formato";
import { SEPARACION, styles } from "@/styles/app/index.styles";
import { colors } from "@/theme";

const RECIENTES = 8;
const MARGEN_TABLET = 40;

function mensajeDeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function Inicio() {
  const { db, resumen, pendientes, movimientos, error, recargar } =
    useResumen();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const esTablet = useEsTablet();
  const [pagando, setPagando] = useState<number | null>(null);
  const hoy = momentoActual().hoy;

  const recientes = useMemo(
    () => agruparPorDia(armarFilas(movimientos).slice(0, RECIENTES), hoy),
    [movimientos, hoy],
  );

  async function pagar(p: PendienteMes) {
    if (pagando !== null) return;
    setPagando(p.id);
    try {
      await pagarPendiente(db, p.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await recargar();
      reprogramar(db);
      mostrarAviso({
        tono: "oscuro",
        texto: `${p.nombre} pagado · −${formatearLempirasCompacto(p.monto)}`,
        duracion: 5000,
        accion: {
          texto: "Deshacer",
          alPresionar: async () => {
            try {
              await deshacerPago(db, p.id);
              await recargar();
              reprogramar(db);
            } catch (e) {
              mostrarAviso({ tono: "coral", texto: mensajeDeError(e) });
            }
          },
        },
      });
    } catch (e) {
      mostrarAviso({ tono: "coral", texto: mensajeDeError(e) });
    } finally {
      setPagando(null);
    }
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!resumen) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.texto} />
      </View>
    );
  }

  const abrirFrasco = () => router.push("/frasco");
  const anadir = () => router.push("/anadir");
  const ir = (ruta: RutaAcceso) => router.push(ruta);

  const encabezado = (
    <View style={styles.encabezado}>
      <Text style={[styles.titulo, esTablet && styles.tituloTablet]}>
        Pendientes
      </Text>
      {pendientes.length > 0 && (
        <View style={styles.chip}>
          <Text style={styles.chipTexto}>
            {resumenPendientes(pendientes.map((p) => p.monto))}
          </Text>
        </View>
      )}
    </View>
  );

  const vacio = (
    <View style={styles.vacio}>
      <Text style={styles.vacioTitulo}>Nada pendiente</Text>
      <Text style={styles.vacioTexto}>Agrega tus gastos fijos en Ajustes.</Text>
    </View>
  );

  const tarjeta = (p: PendienteMes, ancho?: number) => (
    <View key={p.id} style={ancho ? { width: ancho } : undefined}>
      <TarjetaPendiente
        pendiente={p}
        hoy={hoy}
        ocupado={pagando !== null}
        onPagar={() => pagar(p)}
      />
    </View>
  );

  if (esTablet) {
    const anchoPanel = Math.round(Math.min(470, Math.max(340, width * 0.4)));
    const anchoDerecha =
      width - anchoPanel - insets.left - insets.right - MARGEN_TABLET * 2;
    const columnas = anchoDerecha >= 560 ? 2 : 1;
    const anchoTarjeta =
      (anchoDerecha - SEPARACION * (columnas - 1)) / columnas;

    return (
      <View style={styles.tablet}>
        <StatusBar style="light" />
        <PanelLateral
          resumen={resumen}
          ancho={anchoPanel + insets.left}
          onMantenerFrasco={abrirFrasco}
          onAnadir={anadir}
          onAcceso={ir}
        />
        <ScrollView
          style={styles.derecha}
          contentContainerStyle={{
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 40,
            paddingLeft: MARGEN_TABLET,
            paddingRight: MARGEN_TABLET + insets.right,
          }}
          showsVerticalScrollIndicator={false}
        >
          {encabezado}
          {pendientes.length === 0 ? (
            vacio
          ) : (
            <View style={styles.cuadricula}>
              {pendientes.map((p) => tarjeta(p, anchoTarjeta))}
            </View>
          )}

          <View style={[styles.encabezado, styles.encabezadoRecientes]}>
            <Text style={[styles.titulo, styles.tituloTablet]}>
              Movimientos recientes
            </Text>
            {recientes.length > 0 && (
              <Pressable
                onPress={() => router.push("/historico")}
                accessibilityRole="link"
                style={styles.verTodo}
              >
                <Text style={styles.verTodoTexto}>Ver todo</Text>
              </Pressable>
            )}
          </View>
          {recientes.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>Sin movimientos este mes</Text>
              <Text style={styles.vacioTexto}>
                Lo que añadas aparecerá aquí.
              </Text>
            </View>
          ) : (
            <ListaDias dias={recientes} />
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <PanelLibre resumen={resumen} onMantenerFrasco={abrirFrasco} />

        <View style={styles.seccion}>
          {encabezado}
          {pendientes.length === 0 ? (
            vacio
          ) : (
            <View style={styles.lista}>
              {pendientes.map((p) => tarjeta(p))}
            </View>
          )}
        </View>
      </ScrollView>

      <BarraInferior onAnadir={anadir} onAcceso={ir} />
    </View>
  );
}
