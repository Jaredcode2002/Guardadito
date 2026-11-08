import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Frasco } from "@/components/frasco/Frasco";
import {
  obtenerResumen,
  previsualizarGasto,
  registrarGasto,
  registrarIngreso,
} from "@/db";
import {
  CATEGORIAS,
  descripcionMovimiento,
  lineasVistaPrevia,
  TONO_VISTA_PREVIA,
} from "@/features/anadir/vistaPrevia";
import { avisoDeGasto } from "@/features/avisos/mensajes";
import { mostrarAviso } from "@/features/avisos/store";
import { useResumen } from "@/features/resumen/useResumen";
import { formatearLempirasCompacto, parsearLempiras } from "@/lib/formato";
import { simularMovimiento, type TipoMovimientoNuevo } from "@/lib/simulacion";
import { durations, fonts, palette } from "@/theme";

const GRIS = "#4A5850";

export default function Anadir() {
  const { db, resumen } = useResumen();
  const insets = useSafeAreaInsets();
  const [tipo, setTipo] = useState<TipoMovimientoNuevo>("gasto");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  const monto = parsearLempiras(texto);
  const simulacion =
    resumen && monto !== null ? simularMovimiento(resumen, tipo, monto) : null;
  const tono = simulacion ? TONO_VISTA_PREVIA[simulacion.estado] : null;
  const puedeGuardar = monto !== null && resumen !== null && !guardando;

  function cambiarTipo(t: TipoMovimientoNuevo) {
    setTipo(t);
    setCategoria(null);
  }

  async function ejecutar(accion: () => Promise<void>) {
    setGuardando(true);
    try {
      await accion();
      router.back();
    } catch (e) {
      mostrarAviso({
        tono: "coral",
        texto: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setGuardando(false);
    }
  }

  function guardarIngreso(m: number) {
    ejecutar(async () => {
      await registrarIngreso(db, {
        monto: m,
        categoria,
        descripcion: descripcionMovimiento(nota, categoria),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      mostrarAviso({
        tono: "oscuro",
        texto: `Ingreso de ${formatearLempirasCompacto(m)} registrado`,
      });
    });
  }

  function guardarGasto(m: number, mes: string) {
    ejecutar(async () => {
      const r = await registrarGasto(db, {
        monto: m,
        categoria,
        descripcion: descripcionMovimiento(nota, categoria),
      });
      const despues = await obtenerResumen(db, mes);
      const aviso = avisoDeGasto({ ...r, monto: m }, despues);
      Haptics.notificationAsync(
        aviso.tono === "oscuro"
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
      mostrarAviso(aviso);
    });
  }

  async function guardar() {
    if (monto === null || !resumen) return;
    if (tipo === "ingreso") {
      guardarIngreso(monto);
      return;
    }
    const plan = await previsualizarGasto(db, monto);
    if (plan.desdeAhorro === 0 && plan.enNegativo === 0) {
      guardarGasto(monto, resumen.mes);
      return;
    }
    const lineas: string[] = [];
    if (plan.desdeAhorro > 0) {
      lineas.push(
        `Este gasto tocará ${formatearLempirasCompacto(plan.desdeAhorro)} de tu ahorro.`,
      );
    }
    if (plan.enNegativo > 0) {
      lineas.push(
        `Quedarás ${formatearLempirasCompacto(plan.enNegativo)} en negativo.`,
      );
    }
    Alert.alert("¿Seguro?", lineas.join("\n"), [
      { text: "Gastar igual", onPress: () => guardarGasto(monto, resumen.mes) },
      { text: "Mejor no gastar", style: "cancel" },
    ]);
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.contenedor}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      />
      <Animated.View
        entering={SlideInDown.duration(durations.slow)}
        style={[styles.hoja, { paddingBottom: 28 + insets.bottom }]}
      >
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          <View style={styles.agarradera} />

          <View style={styles.selector}>
            {(["gasto", "ingreso"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => cambiarTipo(t)}
                accessibilityRole="button"
                accessibilityState={{ selected: tipo === t }}
                style={[styles.opcion, tipo === t && styles.opcionActiva]}
              >
                <Text
                  style={[
                    styles.opcionTexto,
                    tipo === t && styles.opcionTextoActivo,
                  ]}
                >
                  {t === "gasto" ? "Gasto" : "Ingreso"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.etiqueta}>MONTO</Text>
          <View style={styles.monto}>
            <Text style={styles.montoL}>L</Text>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="0"
              placeholderTextColor="#17231C40"
              keyboardType="decimal-pad"
              autoFocus
              accessibilityLabel="Monto en lempiras"
              style={styles.montoInput}
            />
          </View>

          {simulacion && tono && (
            <View style={[styles.vistaPrevia, { backgroundColor: tono.fondo }]}>
              <Frasco
                estado={simulacion.estado}
                porcentaje={simulacion.porcentaje}
                ancho={28}
                tema="claro"
              />
              <View style={styles.vistaPreviaTextos}>
                {lineasVistaPrevia(simulacion).map((l) => (
                  <Text
                    key={l}
                    style={[styles.vistaPreviaTexto, { color: tono.texto }]}
                  >
                    {l}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.etiqueta, styles.separado]}>CATEGORÍA</Text>
          <View style={styles.categorias}>
            {CATEGORIAS[tipo].map((c) => {
              const activa = categoria === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategoria(activa ? null : c)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  style={[styles.categoria, activa && styles.categoriaActiva]}
                >
                  <Text
                    style={[
                      styles.categoriaTexto,
                      activa && styles.categoriaTextoActivo,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.etiqueta, styles.separado]}>
            NOTA (OPCIONAL)
          </Text>
          <TextInput
            value={nota}
            onChangeText={setNota}
            placeholder={
              tipo === "gasto" ? "Ej. tacos con amigos" : "Ej. pago de quincena"
            }
            placeholderTextColor="#17231C70"
            accessibilityLabel="Nota"
            style={styles.nota}
          />

          <Pressable
            onPress={guardar}
            disabled={!puedeGuardar}
            accessibilityRole="button"
            style={[styles.guardar, !puedeGuardar && styles.guardarInactivo]}
          >
            <Text style={styles.guardarTexto}>
              {tipo === "gasto" ? "Guardar gasto" : "Guardar ingreso"}
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(20,35,27,0.55)",
  },
  hoja: {
    maxHeight: "92%",
    backgroundColor: palette.crema,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  agarradera: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#EAE2D0",
    marginBottom: 16,
  },
  selector: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 26,
    backgroundColor: palette.panel,
  },
  opcion: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionActiva: { backgroundColor: palette.lima },
  opcionTexto: { color: palette.crema, fontFamily: fonts.bodyMedium, fontSize: 15 },
  opcionTextoActivo: { color: palette.tinta, fontFamily: fonts.bodySemiBold },
  etiqueta: {
    color: GRIS,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    marginTop: 18,
  },
  separado: { marginBottom: 8 },
  monto: { flexDirection: "row", alignItems: "center", gap: 8 },
  montoL: { color: GRIS, fontFamily: fonts.display, fontSize: 30 },
  montoInput: {
    flex: 1,
    padding: 0,
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 60,
  },
  vistaPrevia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 22,
  },
  vistaPreviaTextos: { flex: 1, gap: 2 },
  vistaPreviaTexto: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoria: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAE2D0",
    backgroundColor: "#FFFDF8",
  },
  categoriaActiva: {
    borderColor: palette.panel,
    backgroundColor: palette.panel,
  },
  categoriaTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  categoriaTextoActivo: { color: palette.crema, fontFamily: fonts.bodySemiBold },
  nota: {
    height: 48,
    borderWidth: 1,
    borderColor: "#EAE2D0",
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#FFFDF8",
    color: palette.tinta,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  guardar: {
    height: 56,
    marginTop: 18,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.panel,
  },
  guardarInactivo: { opacity: 0.4 },
  guardarTexto: {
    color: palette.crema,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
});
