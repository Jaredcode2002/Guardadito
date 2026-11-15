import { Text, View } from "react-native";

import { Icono, type NombreIcono } from "@/components/Icono";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { crearEstilos } from "@/styles/features/historico/ListaDias.styles";
import { useEstilos, useTema, type Tema } from "@/theme";

import {
  signoDe,
  type DiaHistorico,
  type FilaHistorico,
  type TipoFila,
} from "./logica";

function iconoFila(
  t: Tema,
  tipo: TipoFila,
): { icono: NombreIcono; fondo: string; trazo: string } {
  switch (tipo) {
    case "ingreso":
      return { icono: "subir", fondo: t.acento, trazo: t.sobreAcento };
    case "alAhorro":
      return { icono: "mas", fondo: t.panel, trazo: t.acento };
    default:
      return { icono: "bajar", fondo: t.borde, trazo: t.texto };
  }
}

export function ListaDias({ dias }: { dias: readonly DiaHistorico[] }) {
  const styles = useEstilos(crearEstilos);
  return (
    <>
      {dias.map((d) => (
        <View key={d.fecha}>
          <Text style={styles.dia}>{d.titulo}</Text>
          <View style={styles.tarjeta}>
            {d.filas.map((f, i) => (
              <Fila key={f.id} fila={f} primera={i === 0} />
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

function Fila({ fila, primera }: { fila: FilaHistorico; primera: boolean }) {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
  const icono = iconoFila(tema, fila.tipo);
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
          fila.tipo === "ingreso" && styles.filaMontoIngreso,
        ]}
      >
        {signo}
        {L(fila.monto)}
      </Text>
    </View>
  );
}
