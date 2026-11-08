import { StyleSheet, Text, View } from "react-native";

import { BORDE, GRIS, PAPEL } from "@/components/formulario";
import { Icono, type NombreIcono } from "@/components/Icono";
import { formatearLempirasCompacto as L } from "@/lib/formato";
import { fonts, palette } from "@/theme";

import {
  signoDe,
  type DiaHistorico,
  type FilaHistorico,
  type TipoFila,
} from "./logica";

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

export function ListaDias({ dias }: { dias: readonly DiaHistorico[] }) {
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
});
