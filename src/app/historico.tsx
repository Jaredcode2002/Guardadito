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

import { BORDE, Chip, GRIS, PAPEL } from "@/components/formulario";
import { Icono, type NombreIcono } from "@/components/Icono";
import { momentoActual } from "@/db";
import {
  agruparPorDia,
  armarFilas,
  categoriasDelMes,
  filtrarPorCategoria,
  resumenDelFiltro,
  signoDe,
  totalesDelMes,
  type FilaHistorico,
  type TipoFila,
} from "@/features/historico/logica";
import { useHistorico } from "@/features/historico/useHistorico";
import { mesCorto, mesDe, nombreMes, type MesId } from "@/lib/fechas";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { colors, fonts, palette } from "@/theme";

const TEXTO_SUAVE = "rgba(246,241,231,0.74)";
const VERDE = "#1F7A52";

const ICONO_FILA: Record<
  TipoFila,
  { icono: NombreIcono; fondo: string; trazo: string }
> = {
  gasto: { icono: "bajar", fondo: BORDE, trazo: palette.tinta },
  pendiente: { icono: "bajar", fondo: BORDE, trazo: palette.tinta },
  ingreso: { icono: "subir", fondo: palette.lima, trazo: palette.tinta },
  alAhorro: { icono: "mas", fondo: palette.panel, trazo: palette.lima },
};

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
      dias: agruparPorDia(filtradas),
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
            <Text style={styles.tituloPanel}>Histórico</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.meses}
            style={styles.mesesScroll}
          >
            {meses.map((m) => {
              const activo = m === mes;
              return (
                <Pressable
                  key={m}
                  onPress={() => {
                    setCategoriaId(null);
                    elegirMes(m);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={nombreMes(m)}
                  accessibilityState={{ selected: activo }}
                  style={[styles.mes, activo && styles.mesActivo]}
                >
                  <Text style={[styles.mesTexto, activo && styles.mesTextoActivo]}>
                    {mesCorto(m, mesActual)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

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
            vista.dias.map((d) => (
              <View key={d.fecha}>
                <Text style={styles.dia}>{d.titulo}</Text>
                <View style={styles.tarjeta}>
                  {d.filas.map((f, i) => (
                    <Fila key={f.id} fila={f} primera={i === 0} />
                  ))}
                </View>
              </View>
            ))
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

function Fila({ fila, primera }: { fila: FilaHistorico; primera: boolean }) {
  const icono = ICONO_FILA[fila.tipo];
  const signo = signoDe(fila.tipo);
  return (
    <View
      style={[styles.fila, !primera && styles.divisor]}
      accessible
      accessibilityLabel={`${fila.titulo}, ${fila.subtitulo}, ${signo === "+" ? "más" : "menos"} ${L(fila.monto)}${fila.etiqueta ? `, ${fila.etiqueta}` : ""}`}
    >
      <View style={[styles.filaIcono, { backgroundColor: icono.fondo }]}>
        <Icono nombre={icono.icono} color={icono.trazo} tamano={20} />
      </View>
      <View style={styles.filaTextos}>
        <View style={styles.filaTituloLinea}>
          <Text style={styles.filaTitulo} numberOfLines={1}>
            {fila.titulo}
          </Text>
          {fila.etiqueta && (
            <View style={styles.etiqueta}>
              <Text style={styles.etiquetaTexto}>{fila.etiqueta}</Text>
            </View>
          )}
        </View>
        <Text style={styles.filaSub} numberOfLines={1}>
          {fila.subtitulo}
        </Text>
      </View>
      <Text
        style={[
          styles.filaMonto,
          fila.tipo === "ingreso" && { color: VERDE },
        ]}
      >
        {signo}
        {L(fila.monto)}
      </Text>
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
  mesesScroll: { marginTop: 14, marginHorizontal: -22 },
  meses: { gap: 8, paddingHorizontal: 22 },
  mes: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(246,241,231,0.16)",
  },
  mesActivo: { borderColor: palette.lima, backgroundColor: palette.lima },
  mesTexto: { color: palette.crema, fontFamily: fonts.bodyMedium, fontSize: 14 },
  mesTextoActivo: { color: palette.tinta, fontFamily: fonts.bodySemiBold },
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
  dia: {
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    color: GRIS,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  tarjeta: {
    paddingVertical: 2,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDE,
    backgroundColor: PAPEL,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
  },
  divisor: { borderTopWidth: 1, borderTopColor: BORDE },
  filaIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filaTextos: { flex: 1, paddingVertical: 10 },
  filaTituloLinea: { flexDirection: "row", alignItems: "center", gap: 6 },
  filaTitulo: {
    flexShrink: 1,
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  etiqueta: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: palette.panel,
  },
  etiquetaTexto: {
    color: palette.lima,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  filaSub: { color: GRIS, fontFamily: fonts.body, fontSize: 13 },
  filaMonto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
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
