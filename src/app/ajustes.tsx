import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Selector } from "@/components/formulario";
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
import { SelectorForma } from "@/features/ajustes/SelectorForma";
import { SelectorPaleta } from "@/features/ajustes/SelectorPaleta";
import { useAjustes } from "@/features/ajustes/useAjustes";
import { mostrarAviso } from "@/features/avisos/store";
import { usePermiso } from "@/features/notificaciones/usePermiso";
import type { Umbrales } from "@/lib/alertas";
import { hexDeColor } from "@/lib/colores";
import { formatearLempirasCompacto } from "@/lib/formato";
import { cambiarHora } from "@/lib/notificaciones";
import { crearEstilos } from "@/styles/app/ajustes.styles";
import { useEstilos, useTema } from "@/theme";

const TIPOS = [
  { valor: "gasto", texto: "De gasto" },
  { valor: "ingreso", texto: "De ingreso" },
] as const;

export default function Ajustes() {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
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
        <ActivityIndicator color={tema.texto} />
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
            <Icono nombre="mas" color={tema.sobreAcento} tamano={18} />
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
              <Icono nombre="mas" color={tema.texto} tamano={16} />
              <Text style={styles.categoriaTexto}>Nueva</Text>
            </Pressable>
          </View>

          <Text style={styles.seccion}>Colores</Text>
          <SelectorPaleta />

          <Text style={styles.seccion}>Forma del frasco</Text>
          <SelectorForma />

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

          <Text style={styles.seccion}>Historial</Text>
          <View style={styles.tarjeta}>
            <Pressable
              onPress={() => router.push("/borrar-historial")}
              accessibilityRole="button"
              style={styles.fila}
            >
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo}>Borrar historial</Text>
                <Text style={styles.filaSub}>
                  Borra meses viejos sin cambiar tus saldos de hoy
                </Text>
              </View>
              <Icono nombre="flecha" color={tema.textoSecundario} tamano={20} />
            </Pressable>
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
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.punteado}
    >
      <Icono nombre="mas" color={tema.texto} tamano={18} />
      <Text style={styles.punteadoTexto}>{texto}</Text>
    </Pressable>
  );
}
