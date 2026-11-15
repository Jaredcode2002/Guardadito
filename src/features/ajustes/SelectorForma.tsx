import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

import { Frasco } from "@/components/frasco/Frasco";
import { Icono } from "@/components/Icono";
import { mostrarAviso } from "@/features/avisos/store";
import {
  FORMAS_FRASCO,
  NOMBRES_FORMA,
  type EstadoFrasco,
  type FormaFrasco,
} from "@/lib/frasco";
import { crearEstilos } from "@/styles/features/ajustes/SelectorForma.styles";
import { useEstilos, useTema } from "@/theme";

const ESTADOS: { estado: EstadoFrasco; porcentaje: number }[] = [
  { estado: "ok", porcentaje: 0.68 },
  { estado: "mod", porcentaje: 0.28 },
  { estado: "crit", porcentaje: 0.08 },
  { estado: "zero", porcentaje: 0 },
  { estado: "roto", porcentaje: 0 },
];

export function SelectorForma() {
  const styles = useEstilos(crearEstilos);
  const { tema, forma, cambiarForma } = useTema();

  async function elegir(nueva: FormaFrasco) {
    if (nueva === forma) return;
    try {
      await cambiarForma(nueva);
      Haptics.selectionAsync();
    } catch (e) {
      mostrarAviso({
        tono: "coral",
        texto: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.rejilla} accessibilityRole="radiogroup">
        {FORMAS_FRASCO.map((f) => {
          const activa = f === forma;
          return (
            <Pressable
              key={f}
              onPress={() => elegir(f)}
              accessibilityRole="radio"
              accessibilityState={{ checked: activa }}
              accessibilityLabel={`Forma ${NOMBRES_FORMA[f]}`}
              style={({ pressed }) => [
                styles.tarjeta,
                activa && styles.tarjetaActiva,
                pressed && styles.presionada,
              ]}
            >
              <View style={styles.muestra}>
                <Frasco estado="ok" porcentaje={0.68} ancho={44} forma={f} />
              </View>
              <View style={styles.pie}>
                <Text style={styles.nombre}>{NOMBRES_FORMA[f]}</Text>
                {activa && <Icono nombre="check" color={tema.texto} tamano={14} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View
        style={styles.estados}
        accessible
        accessibilityLabel={`Vista previa de ${NOMBRES_FORMA[forma]} en sus cinco estados`}
      >
        {ESTADOS.map((m) => (
          <Frasco
            key={m.estado}
            estado={m.estado}
            porcentaje={m.porcentaje}
            ancho={40}
            forma={forma}
          />
        ))}
      </View>
    </View>
  );
}
