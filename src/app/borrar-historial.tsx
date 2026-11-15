import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ConfirmarAccion } from "@/components/ConfirmarAccion";
import {
  BotonPeligro,
  Etiqueta,
  MensajeError,
  Titulo,
} from "@/components/formulario";
import { HojaInferior } from "@/components/HojaInferior";
import { SelectorMeses } from "@/components/SelectorMeses";
import {
  borrarMesesHasta,
  mesesBorrables,
  momentoActual,
  previsualizarBorrado,
  textoPendientesQueBloquean,
  type VistaBorrado,
} from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import {
  mensajeConfirmarBorrado,
  textoMeses,
  textoResumenBorrado,
  tituloConfirmarBorrado,
} from "@/features/historial/logica";
import { mesDe, type MesId } from "@/lib/fechas";
import { crearEstilos } from "@/styles/app/borrar-historial.styles";
import { useEstilos } from "@/theme";

export default function BorrarHistorialPantalla() {
  const db = useSQLiteContext();
  const styles = useEstilos(crearEstilos);
  const [mesActual] = useState(() => mesDe(momentoActual().hoy));
  const [meses, setMeses] = useState<MesId[] | null>(null);
  const [hasta, setHasta] = useState<MesId | null>(null);
  const [vista, setVista] = useState<VistaBorrado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const cancelarConfirmacion = useCallback(() => setConfirmando(false), []);

  useEffect(() => {
    mesesBorrables(db, mesActual).then((lista) => {
      setMeses(lista);
      setHasta(lista[0] ?? null);
    });
  }, [db, mesActual]);

  useEffect(() => {
    if (!hasta) return;
    let vigente = true;
    previsualizarBorrado(db, hasta).then((v) => {
      if (vigente) setVista(v);
    });
    return () => {
      vigente = false;
    };
  }, [db, hasta]);

  async function borrar() {
    if (!hasta) return;
    setBorrando(true);
    try {
      const r = await borrarMesesHasta(db, hasta);
      mostrarAviso({
        tono: "oscuro",
        texto: `Historial borrado: ${textoMeses(r.meses)}`,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setConfirmando(false);
    } finally {
      setBorrando(false);
    }
  }

  const vistaActual = vista && vista.hasta === hasta ? vista : null;
  const bloqueado = (vistaActual?.pendientesSinPagar.length ?? 0) > 0;

  return (
    <>
      <HojaInferior>
        <Titulo>Borrar historial</Titulo>
        <Text style={styles.nota}>
          Borra los meses viejos para que la app ocupe menos. Tu Dinero, tu
          Libre y tu ahorro de hoy no cambian. El mes actual nunca se borra.
        </Text>

        {meses !== null && meses.length === 0 && (
          <Text style={styles.resumen}>
            Todavía no hay meses anteriores para borrar.
          </Text>
        )}

        {meses !== null && meses.length > 0 && hasta && (
          <>
            <Etiqueta>BORRAR DESDE EL MÁS ANTIGUO HASTA</Etiqueta>
            <SelectorMeses
              meses={meses}
              mes={hasta}
              mesActual={mesActual}
              onElegir={(m) => {
                setHasta(m);
                setError(null);
              }}
              sobre="fondo"
            />
            {vistaActual && (
              <Text style={styles.resumen}>
                {textoResumenBorrado(vistaActual.meses, vistaActual.movimientos)}
              </Text>
            )}
            {vistaActual && bloqueado && (
              <View style={styles.aviso}>
                <Text style={styles.avisoTexto}>
                  {textoPendientesQueBloquean(vistaActual.pendientesSinPagar)}
                </Text>
              </View>
            )}
            {error && <MensajeError>{error}</MensajeError>}
            {vistaActual && !bloqueado && (
              <BotonPeligro
                texto={`Borrar ${textoMeses(vistaActual.meses.length)}`}
                onPress={() => setConfirmando(true)}
              />
            )}
          </>
        )}
      </HojaInferior>
      {confirmando && vistaActual && (
        <ConfirmarAccion
          titulo={tituloConfirmarBorrado(vistaActual.meses.length)}
          mensaje={mensajeConfirmarBorrado(
            vistaActual.meses,
            vistaActual.movimientos,
          )}
          textoConfirmar="Borrar"
          ocupado={borrando}
          onCancelar={cancelarConfirmacion}
          onConfirmar={borrar}
        />
      )}
    </>
  );
}
