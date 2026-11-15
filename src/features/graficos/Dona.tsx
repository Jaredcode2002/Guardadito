import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import Svg, { G, Path } from "react-native-svg";

import { formatearLempirasCompacto as L } from "@/lib/formato";
import { styles, TAMANO } from "@/styles/features/graficos/Dona.styles";
import { durations, PAPEL } from "@/theme";

import {
  sectoresDona,
  textoPorcentaje,
  totalGastado,
  type GastoCategoria,
} from "./logica";

const EXTERIOR = 106;
const INTERIOR = 70;

export function Dona({ grupos }: { grupos: readonly GastoCategoria[] }) {
  const reducir = useReducedMotion();
  const [elegida, setElegida] = useState<string | null>(null);
  const centro = TAMANO / 2;
  const sectores = sectoresDona(grupos, centro, centro, EXTERIOR, INTERIOR);
  const porClave = new Map(grupos.map((g) => [g.clave, g]));
  const actual = elegida ? porClave.get(elegida) : undefined;
  const alternar = (clave: string) =>
    setElegida((e) => (e === clave ? null : clave));

  return (
    <View style={styles.contenedor}>
      <Animated.View
        entering={reducir ? undefined : FadeIn.duration(durations.slow)}
        style={styles.grafico}
      >
        <Svg width={TAMANO} height={TAMANO}>
          <G>
            {sectores.map((s) => {
              const g = porClave.get(s.clave);
              const atenuado = elegida !== null && elegida !== s.clave;
              return (
                <Path
                  key={s.clave}
                  d={s.d}
                  fill={g?.color}
                  fillOpacity={atenuado ? 0.3 : 1}
                  stroke={PAPEL}
                  strokeWidth={2}
                  onPress={() => alternar(s.clave)}
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.centro} pointerEvents="none">
          <Text style={styles.centroEtiqueta} numberOfLines={1}>
            {actual ? actual.nombre : "Gastado"}
          </Text>
          <Text style={styles.centroMonto}>
            {L(actual ? actual.monto : totalGastado(grupos))}
          </Text>
          {actual && (
            <Text style={styles.centroEtiqueta}>
              {textoPorcentaje(actual.porcentaje)}
            </Text>
          )}
        </View>
      </Animated.View>

      <View style={styles.leyenda}>
        {grupos.map((g) => {
          const activa = elegida === g.clave;
          return (
            <Pressable
              key={g.clave}
              onPress={() => alternar(g.clave)}
              accessibilityRole="button"
              accessibilityState={{ selected: activa }}
              accessibilityLabel={`${g.nombre}: ${L(g.monto)}, ${textoPorcentaje(g.porcentaje)}`}
              style={[styles.fila, activa && styles.filaActiva]}
            >
              <View style={[styles.muestra, { backgroundColor: g.color }]} />
              <Text style={styles.nombre} numberOfLines={1}>
                {g.nombre}
              </Text>
              <Text style={styles.valor}>
                {L(g.monto)} · {textoPorcentaje(g.porcentaje)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
