import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import {
  BotonPrincipal,
  Etiqueta,
  MensajeError,
  Selector,
  Titulo,
} from "@/components/formulario";
import { HojaInferior } from "@/components/HojaInferior";
import { SelectorMeses } from "@/components/SelectorMeses";
import {
  listarMeses,
  listarMovimientosEntre,
  momentoActual,
  type Movimiento,
} from "@/db";
import { mostrarAviso } from "@/features/avisos/store";
import {
  ARCHIVO_CSV,
  compartirArchivo,
  guardarEnCarpeta,
} from "@/features/exportar/archivo";
import {
  filasCsv,
  nombreArchivoCsv,
  rangoExportar,
  textoResumenExportar,
  type ModoRango,
  type Rango,
} from "@/features/exportar/logica";
import { generarCsv } from "@/lib/csv";
import { mesDe, type MesId } from "@/lib/fechas";
import { crearEstilos } from "@/styles/app/exportar.styles";
import { useEstilos } from "@/theme";

const MODOS = [
  { valor: "mes", texto: "Este mes" },
  { valor: "rango", texto: "Rango" },
  { valor: "todo", texto: "Todo" },
] as const;

export default function ExportarPantalla() {
  const db = useSQLiteContext();
  const styles = useEstilos(crearEstilos);
  const [mesActual] = useState(() => mesDe(momentoActual().hoy));
  const [meses, setMeses] = useState<MesId[]>([mesActual]);
  const [modo, setModo] = useState<ModoRango>("mes");
  const [elegido, setElegido] = useState<Rango>({
    desde: mesActual,
    hasta: mesActual,
  });
  const [movimientos, setMovimientos] = useState<{
    clave: string;
    lista: Movimiento[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    listarMeses(db).then((lista) => {
      const orden = [...new Set([...lista, mesActual])].sort();
      setMeses(orden);
      setElegido({ desde: orden[0], hasta: mesActual });
    });
  }, [db, mesActual]);

  const rango = useMemo(
    () => rangoExportar(modo, meses, mesActual, elegido),
    [modo, meses, mesActual, elegido],
  );
  const nombre = nombreArchivoCsv(rango);

  useEffect(() => {
    let vigente = true;
    listarMovimientosEntre(db, rango.desde, rango.hasta).then((lista) => {
      if (vigente) setMovimientos({ clave: nombre, lista });
    });
    return () => {
      vigente = false;
    };
  }, [db, rango.desde, rango.hasta, nombre]);

  const lista = movimientos?.clave === nombre ? movimientos.lista : null;
  const puede = !ocupado && lista !== null && lista.length > 0;

  async function exportar(como: "carpeta" | "compartir") {
    if (!lista) return;
    setOcupado(true);
    setError(null);
    try {
      const contenido = generarCsv(filasCsv(lista));
      if (como === "compartir") {
        await compartirArchivo(nombre, contenido, ARCHIVO_CSV);
      } else if (await guardarEnCarpeta(nombre, contenido, ARCHIVO_CSV)) {
        mostrarAviso({ tono: "oscuro", texto: `Guardado: ${nombre}` });
        router.back();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <HojaInferior>
      <Titulo>Exportar CSV</Titulo>
      <Text style={styles.nota}>
        Un archivo con tus movimientos para abrirlo en Excel o Google Sheets.
      </Text>

      <Etiqueta>QUÉ MESES</Etiqueta>
      <Selector opciones={MODOS} valor={modo} onCambiar={setModo} />

      {modo === "rango" && (
        <>
          <Etiqueta>DESDE</Etiqueta>
          <SelectorMeses
            meses={meses}
            mes={elegido.desde}
            mesActual={mesActual}
            onElegir={(m) => setElegido((r) => ({ ...r, desde: m }))}
            sobre="fondo"
          />
          <Etiqueta>HASTA</Etiqueta>
          <SelectorMeses
            meses={meses}
            mes={elegido.hasta}
            mesActual={mesActual}
            onElegir={(m) => setElegido((r) => ({ ...r, hasta: m }))}
            sobre="fondo"
          />
        </>
      )}

      {lista && (
        <Text style={styles.resumen}>
          {lista.length === 0
            ? "No hay movimientos en esos meses."
            : textoResumenExportar(rango, lista.length)}
        </Text>
      )}
      {error && <MensajeError>{error}</MensajeError>}

      <BotonPrincipal
        texto="Guardar en una carpeta"
        activo={puede}
        onPress={() => exportar("carpeta")}
      />
      <Pressable
        onPress={() => exportar("compartir")}
        disabled={!puede}
        accessibilityRole="button"
        accessibilityState={{ disabled: !puede }}
        style={({ pressed }) => [
          styles.secundario,
          (!puede || pressed) && styles.inactivo,
        ]}
      >
        <Text style={styles.secundarioTexto}>Compartir</Text>
      </Pressable>
    </HojaInferior>
  );
}
