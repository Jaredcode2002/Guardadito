import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";

import {
  BotonPrincipal,
  CampoMonto,
  CampoTexto,
  Chip,
  Etiqueta,
  Selector,
} from "@/components/formulario";
import { Frasco } from "@/components/frasco/Frasco";
import { HojaInferior } from "@/components/HojaInferior";
import {
  obtenerResumen,
  previsualizarGasto,
  registrarGasto,
  registrarIngreso,
  type Categoria,
} from "@/db";
import { useCategorias } from "@/features/ajustes/useAjustes";
import { requiereConfirmacion } from "@/features/anadir/confirmacion";
import { ConfirmarGasto } from "@/features/anadir/ConfirmarGasto";
import {
  descripcionMovimiento,
  lineasVistaPrevia,
  TONO_VISTA_PREVIA,
} from "@/features/anadir/vistaPrevia";
import { avisoDeGasto } from "@/features/avisos/mensajes";
import { mostrarAviso } from "@/features/avisos/store";
import { useResumen } from "@/features/resumen/useResumen";
import { formatearLempirasCompacto, parsearLempiras } from "@/lib/formato";
import type { PlanDeGasto } from "@/lib/money";
import { simularMovimiento, type TipoMovimientoNuevo } from "@/lib/simulacion";
import { fonts } from "@/theme";

const TIPOS = [
  { valor: "gasto", texto: "Gasto" },
  { valor: "ingreso", texto: "Ingreso" },
] as const;

export default function Anadir() {
  const { db, resumen } = useResumen();
  const [tipo, setTipo] = useState<TipoMovimientoNuevo>("gasto");
  const categorias = useCategorias(tipo);
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState<PlanDeGasto | null>(null);
  const cancelarConfirmacion = useCallback(() => setConfirmando(null), []);

  const monto = parsearLempiras(texto);
  const simulacion =
    resumen && monto !== null ? simularMovimiento(resumen, tipo, monto) : null;
  const tono = simulacion ? TONO_VISTA_PREVIA[simulacion.estado] : null;
  const puedeGuardar = monto !== null && resumen !== null && !guardando;
  const datos = (m: number) => ({
    monto: m,
    categoriaId: categoria?.id ?? null,
    descripcion: descripcionMovimiento(nota, categoria?.nombre ?? null),
  });

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
      await registrarIngreso(db, datos(m));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      mostrarAviso({
        tono: "oscuro",
        texto: `Ingreso de ${formatearLempirasCompacto(m)} registrado`,
      });
    });
  }

  function guardarGasto(m: number, mes: string) {
    ejecutar(async () => {
      const r = await registrarGasto(db, datos(m));
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
    if (!requiereConfirmacion(plan)) {
      guardarGasto(monto, resumen.mes);
      return;
    }
    Keyboard.dismiss();
    setConfirmando(plan);
  }

  return (
    <>
      <HojaInferior>
        <Selector opciones={TIPOS} valor={tipo} onCambiar={cambiarTipo} />

        <Etiqueta>MONTO</Etiqueta>
        <CampoMonto value={texto} onChangeText={setTexto} autoFocus />

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

        <Etiqueta>CATEGORÍA</Etiqueta>
        <View style={styles.categorias}>
          {categorias.map((c) => (
            <Chip
              key={c.id}
              texto={c.nombre}
              activo={categoria?.id === c.id}
              onPress={() => setCategoria(categoria?.id === c.id ? null : c)}
            />
          ))}
        </View>

        <Etiqueta>NOTA (OPCIONAL)</Etiqueta>
        <CampoTexto
          value={nota}
          onChangeText={setNota}
          placeholder={
            tipo === "gasto" ? "Ej. tacos con amigos" : "Ej. pago de quincena"
          }
          accessibilityLabel="Nota"
        />

        <BotonPrincipal
          texto={tipo === "gasto" ? "Guardar gasto" : "Guardar ingreso"}
          onPress={guardar}
          activo={puedeGuardar}
        />
      </HojaInferior>
      {confirmando && resumen && (
        <ConfirmarGasto
          plan={confirmando}
          saldoAhorro={resumen.saldoAhorro}
          ocupado={guardando}
          onCancelar={cancelarConfirmacion}
          onConfirmar={() => guardarGasto(confirmando.gasto, resumen.mes)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
});
