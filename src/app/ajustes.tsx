import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
import { Frasco } from "@/components/frasco/Frasco";
import { Icono } from "@/components/Icono";
import { Interruptor } from "@/components/Interruptor";
import { Paso } from "@/components/Paso";
import {
  cambiarPendienteFijoActivo,
  guardarAvisarPendientes,
  guardarHoraRecordatorio,
  guardarRecordatorioActivo,
  guardarUmbrales,
  type TipoMovimiento,
} from "@/db";
import {
  formatearHora,
  partesHora,
  siguienteUmbral,
  textoDiaDelMes,
} from "@/features/ajustes/logica";
import { useAjustes } from "@/features/ajustes/useAjustes";
import { mostrarAviso } from "@/features/avisos/store";
import { usePermiso } from "@/features/notificaciones/usePermiso";
import type { Umbrales } from "@/lib/alertas";
import { hexDeColor } from "@/lib/colores";
import { formatearLempirasCompacto } from "@/lib/formato";
import { cambiarHora } from "@/lib/notificaciones";
import { colors, fonts, palette } from "@/theme";

const TIPOS = [
  { valor: "gasto", texto: "De gasto" },
  { valor: "ingreso", texto: "De ingreso" },
] as const;

const TEXTO_SUAVE = "rgba(246,241,231,0.74)";

export default function Ajustes() {
  const { db, datos, error, recargar } = useAjustes();
  const insets = useSafeAreaInsets();
  const [tipoCategoria, setTipoCategoria] = useState<TipoMovimiento>("gasto");
  const { permiso, pedir } = usePermiso();

  async function intentar(accion: () => Promise<unknown>) {
    try {
      await accion();
    } catch (e) {
      mostrarAviso({
        tono: "coral",
        texto: e instanceof Error ? e.message : String(e),
      });
    }
    await recargar();
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!datos) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.texto} />
      </View>
    );
  }

  const { umbrales } = datos.ajustes;
  const paso = (campo: keyof Umbrales, direccion: 1 | -1) => {
    const nuevos = siguienteUmbral(umbrales, campo, direccion);
    return nuevos ? () => intentar(() => guardarUmbrales(db, nuevos)) : null;
  };
  const { horaRecordatorio } = datos.ajustes;
  const hora = partesHora(horaRecordatorio);
  const moverHora = (campo: "hora" | "minuto", direccion: 1 | -1) => () =>
    intentar(() =>
      guardarHoraRecordatorio(db, cambiarHora(horaRecordatorio, campo, direccion)),
    );

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
            <Text style={styles.tituloPanel}>Ajustes</Text>
          </View>

          <View style={styles.ahorro}>
            <Frasco
              estado={datos.saldoAhorro > 0 ? "ok" : "zero"}
              porcentaje={datos.saldoAhorro > 0 ? 1 : 0}
              ancho={64}
            />
            <View style={styles.ahorroTextos}>
              <Text style={styles.etiquetaPanel}>FONDO DE AHORRO</Text>
              <Text style={styles.ahorroMonto}>
                {formatearLempirasCompacto(datos.saldoAhorro)}
              </Text>
              <Text style={styles.ahorroNota}>
                Solo se toca con tu confirmación
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/ahorro")}
            accessibilityRole="button"
            style={styles.botonAhorro}
          >
            <Icono nombre="mas" color={palette.tinta} tamano={18} />
            <Text style={styles.botonAhorroTexto}>Agregar al ahorro</Text>
          </Pressable>
        </View>

        <View style={styles.contenido}>
          <Text style={styles.seccion}>Pendientes fijos</Text>
          <View style={styles.tarjeta}>
            {datos.plantillas.length === 0 && (
              <Text style={styles.vacio}>
                Agrega lo que pagas cada mes: renta, internet, transporte…
              </Text>
            )}
            {datos.plantillas.map((p, i) => (
              <View key={p.id} style={[styles.fila, i > 0 && styles.divisor]}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/pendiente",
                      params: { id: String(p.id) },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityHint="Editar pendiente"
                  style={styles.filaTextos}
                >
                  <Text style={[styles.filaTitulo, !p.activa && styles.apagado]}>
                    {p.nombre}
                  </Text>
                  <Text style={styles.filaSub}>
                    {textoDiaDelMes(p.diaDelMes)}
                  </Text>
                </Pressable>
                <View style={styles.filaDerecha}>
                  <Text style={[styles.filaMonto, !p.activa && styles.apagado]}>
                    {formatearLempirasCompacto(p.monto)}
                  </Text>
                  <Interruptor
                    valor={p.activa}
                    etiqueta={`${p.nombre} activo`}
                    onCambiar={(activo) =>
                      intentar(() =>
                        cambiarPendienteFijoActivo(db, p.id, activo),
                      )
                    }
                  />
                </View>
              </View>
            ))}
            <BotonPunteado
              texto="Agregar pendiente"
              onPress={() => router.push("/pendiente")}
            />
          </View>

          <Text style={styles.seccion}>Categorías</Text>
          <Selector
            opciones={TIPOS}
            valor={tipoCategoria}
            onCambiar={setTipoCategoria}
          />
          <View style={styles.categorias}>
            {datos.categorias[tipoCategoria].map((c) => (
              <Pressable
                key={c.id}
                onPress={() =>
                  router.push({
                    pathname: "/categoria",
                    params: { id: String(c.id), tipo: c.tipo },
                  })
                }
                accessibilityRole="button"
                accessibilityHint="Editar categoría"
                style={styles.categoria}
              >
                <View
                  style={[styles.punto, { backgroundColor: hexDeColor(c.color) }]}
                />
                <Text style={styles.categoriaTexto}>{c.nombre}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/categoria",
                  params: { tipo: tipoCategoria },
                })
              }
              accessibilityRole="button"
              style={[styles.categoria, styles.categoriaNueva]}
            >
              <Icono nombre="mas" color={palette.tinta} tamano={16} />
              <Text style={styles.categoriaTexto}>Nueva</Text>
            </Pressable>
          </View>

          <Text style={styles.seccion}>Alertas</Text>
          {permiso && !permiso.concedido && (
            <View style={styles.permiso}>
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo}>Notificaciones apagadas</Text>
                <Text style={styles.permisoTexto}>
                  Sin permiso no te llegan el recordatorio ni los avisos de
                  pendientes.
                </Text>
              </View>
              <Pressable
                onPress={() => intentar(pedir)}
                accessibilityRole="button"
                style={styles.permisoBoton}
              >
                <Text style={styles.permisoBotonTexto}>
                  {permiso.puedePedir ? "Permitir" : "Abrir ajustes"}
                </Text>
              </Pressable>
            </View>
          )}
          <View style={styles.tarjeta}>
            <View style={styles.fila}>
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo}>Moderación</Text>
                <Text style={styles.filaSub}>Avisa cuando te quede menos de</Text>
              </View>
              <Paso
                texto={`${umbrales.moderacion}%`}
                etiqueta="moderación"
                onBajar={paso("moderacion", -1)}
                onSubir={paso("moderacion", 1)}
              />
            </View>
            <View style={[styles.fila, styles.divisor]}>
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo}>Casi en cero</Text>
                <Text style={styles.filaSub}>
                  Aviso fuerte cuando te quede menos de
                </Text>
              </View>
              <Paso
                texto={`${umbrales.casiCero}%`}
                etiqueta="casi en cero"
                onBajar={paso("casiCero", -1)}
                onSubir={paso("casiCero", 1)}
              />
            </View>
            <View style={[styles.fila, styles.divisor]}>
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo}>Recordatorio nocturno</Text>
                <Text style={styles.filaSub}>
                  Todos los días a las {formatearHora(horaRecordatorio)}
                </Text>
              </View>
              <Interruptor
                valor={datos.ajustes.recordatorioActivo}
                etiqueta="Recordatorio nocturno"
                onCambiar={(v) =>
                  intentar(() => guardarRecordatorioActivo(db, v))
                }
              />
            </View>
            {datos.ajustes.recordatorioActivo && (
              <>
                <View style={styles.filaHora}>
                  <Text style={styles.filaSub}>Hora</Text>
                  <Paso
                    texto={hora.hora}
                    etiqueta="hora del recordatorio"
                    onBajar={moverHora("hora", -1)}
                    onSubir={moverHora("hora", 1)}
                  />
                </View>
                <View style={styles.filaHora}>
                  <Text style={styles.filaSub}>Minutos</Text>
                  <Paso
                    texto={hora.minutos}
                    etiqueta="minutos del recordatorio"
                    onBajar={moverHora("minuto", -1)}
                    onSubir={moverHora("minuto", 1)}
                  />
                </View>
              </>
            )}
            <View style={[styles.fila, styles.divisor]}>
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo}>Aviso de pendientes</Text>
                <Text style={styles.filaSub}>
                  Un día antes de cada pago, a las 9:00 a. m.
                </Text>
              </View>
              <Interruptor
                valor={datos.ajustes.avisarPendientes}
                etiqueta="Aviso de pendientes"
                onCambiar={(v) => intentar(() => guardarAvisarPendientes(db, v))}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BotonPunteado({
  texto,
  onPress,
}: {
  texto: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.punteado}
    >
      <Icono nombre="mas" color={palette.tinta} tamano={18} />
      <Text style={styles.punteadoTexto}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filaHora: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    paddingLeft: 12,
  },
  permiso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#FFE1DB",
  },
  permisoTexto: {
    color: "#8A2A1B",
    fontFamily: fonts.body,
    fontSize: 13,
  },
  permisoBoton: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: palette.panel,
  },
  permisoBotonTexto: {
    color: palette.crema,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
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
    paddingBottom: 22,
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
  ahorro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  ahorroTextos: { flex: 1 },
  etiquetaPanel: {
    color: TEXTO_SUAVE,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  ahorroMonto: {
    color: palette.lima,
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 44,
  },
  ahorroNota: { color: TEXTO_SUAVE, fontFamily: fonts.body, fontSize: 13 },
  botonAhorro: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: palette.lima,
  },
  botonAhorroTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  contenido: { paddingHorizontal: 20 },
  seccion: {
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  tarjeta: {
    backgroundColor: PAPEL,
    borderWidth: 1,
    borderColor: BORDE,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  vacio: {
    color: GRIS,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingVertical: 14,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 60,
    paddingVertical: 6,
  },
  divisor: { borderTopWidth: 1, borderTopColor: BORDE },
  filaTextos: { flex: 1, minWidth: 0, paddingVertical: 4 },
  filaTitulo: { color: palette.tinta, fontFamily: fonts.bodySemiBold, fontSize: 15 },
  filaSub: { color: GRIS, fontFamily: fonts.body, fontSize: 13, marginTop: 1 },
  apagado: { opacity: 0.45 },
  filaDerecha: { flexDirection: "row", alignItems: "center", gap: 10 },
  filaMonto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
  punteado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: GRIS,
    borderRadius: 24,
  },
  punteadoTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  categoria: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDE,
    backgroundColor: PAPEL,
  },
  categoriaNueva: {
    borderStyle: "dashed",
    borderColor: GRIS,
    backgroundColor: "transparent",
  },
  punto: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  categoriaTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
});
