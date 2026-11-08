import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  deshacerPago,
  momentoActual,
  pagarPendiente,
  type PendienteMes,
} from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import { reprogramar } from "@/features/notificaciones/programar";
import { BarraInferior } from "@/features/principal/BarraInferior";
import { PanelLibre } from "@/features/principal/PanelLibre";
import { TarjetaPendiente } from "@/features/principal/TarjetaPendiente";
import { resumenPendientes } from "@/features/principal/textos";
import { useResumen } from "@/features/resumen/useResumen";
import { formatearLempirasCompacto } from "@/lib/formato";
import { colors, fonts, palette } from "@/theme";

function mensajeDeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function Inicio() {
  const { db, resumen, pendientes, error, recargar } = useResumen();
  const insets = useSafeAreaInsets();
  const [pagando, setPagando] = useState<number | null>(null);
  const hoy = momentoActual().hoy;

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

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <PanelLibre
          resumen={resumen}
          onMantenerFrasco={() => router.push("/frasco")}
        />

        <View style={styles.seccion}>
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Pendientes</Text>
            {pendientes.length > 0 && (
              <View style={styles.chip}>
                <Text style={styles.chipTexto}>
                  {resumenPendientes(pendientes.map((p) => p.monto))}
                </Text>
              </View>
            )}
          </View>

          {pendientes.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>Nada pendiente</Text>
              <Text style={styles.vacioTexto}>
                Agrega tus gastos fijos en Ajustes.
              </Text>
            </View>
          ) : (
            <View style={styles.lista}>
              {pendientes.map((p) => (
                <TarjetaPendiente
                  key={p.id}
                  pendiente={p}
                  hoy={hoy}
                  ocupado={pagando !== null}
                  onPagar={() => pagar(p)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BarraInferior
        onAnadir={() => router.push("/anadir")}
        onAcceso={(nombre) => {
          if (nombre === "Configuración") {
            router.push("/ajustes");
            return;
          }
          if (nombre === "Histórico") {
            router.push("/historico");
            return;
          }
          mostrarAviso({
            tono: "oscuro",
            texto: `${nombre} llega en un próximo paso.`,
          });
        }}
      />
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
  error: {
    color: colors.peligro,
    fontFamily: fonts.body,
    fontSize: 16,
    textAlign: "center",
  },
  seccion: { paddingHorizontal: 20 },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  titulo: { color: palette.tinta, fontFamily: fonts.display, fontSize: 20 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#EAE2D0",
  },
  chipTexto: { color: palette.tinta, fontFamily: fonts.bodyMedium, fontSize: 13 },
  lista: { gap: 8 },
  vacio: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 28,
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
  vacioTexto: { color: "#4A5850", fontFamily: fonts.body, fontSize: 14 },
});
