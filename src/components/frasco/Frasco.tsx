import { useEffect, useId } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";

import type { EstadoFrasco } from "@/lib/frasco";
import { durations } from "@/theme";

import {
  caminoOla,
  colorRasgo,
  CUERPO,
  nivelSegunEstado,
  TEMAS_FRASCO,
  tieneLiquido,
  type TemaFrasco,
  VIEWBOX,
  ZONA_BOCA,
  ZONA_GOTA,
  ZONA_OJOS,
} from "./geometria";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const TRAZO = {
  fill: "none",
  strokeWidth: 3.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type Props = {
  estado: EstadoFrasco;
  porcentaje: number;
  ancho?: number;
  tema?: TemaFrasco;
};

export function Frasco({
  estado,
  porcentaje,
  ancho = 124,
  tema = "panel",
}: Props) {
  const colores = TEMAS_FRASCO[tema];
  const reducir = useReducedMotion();
  const idRecorte = `frasco${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const liquido = tieneLiquido(estado);
  const nivelFinal = nivelSegunEstado(estado, porcentaje);

  const nivel = useSharedValue(nivelFinal);
  const desfase = useSharedValue(0);
  const caida = useSharedValue(0);

  useEffect(() => {
    nivel.set(
      reducir
        ? nivelFinal
        : withTiming(nivelFinal, {
            duration: durations.slow,
            easing: Easing.out(Easing.cubic),
          }),
    );
  }, [nivel, nivelFinal, reducir]);

  useEffect(() => {
    desfase.set(0);
    if (reducir || !liquido) return;
    desfase.set(
      withRepeat(withTiming(50, { duration: 3000, easing: Easing.linear }), -1),
    );
    return () => cancelAnimation(desfase);
  }, [desfase, liquido, reducir]);

  useEffect(() => {
    caida.set(0);
    if (reducir || estado !== "roto") return;
    caida.set(
      withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(caida);
  }, [caida, estado, reducir]);

  const propsOla = useAnimatedProps(() => ({
    d: caminoOla(nivel.get(), desfase.get()),
  }));

  const propsMonedas = useAnimatedProps(() => ({
    translateY: caida.get() * 4,
  }));

  const ojos = colorRasgo(nivelFinal, ZONA_OJOS, tema);
  const boca = colorRasgo(nivelFinal, ZONA_BOCA, tema);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Frasco del libre al ${Math.round(porcentaje * 100)} %`}
    >
      <Svg
        width={ancho}
        height={(ancho * VIEWBOX.alto) / VIEWBOX.ancho}
        viewBox={`0 0 ${VIEWBOX.ancho} ${VIEWBOX.alto}`}
      >
        <Defs>
          <ClipPath id={idRecorte}>
            <Rect
              x={CUERPO.x}
              y={CUERPO.y}
              width={CUERPO.ancho}
              height={CUERPO.alto}
              rx={CUERPO.radio}
            />
          </ClipPath>
        </Defs>

        <Rect
          x={CUERPO.x}
          y={CUERPO.y}
          width={CUERPO.ancho}
          height={CUERPO.alto}
          rx={CUERPO.radio}
          fill={colores.cuerpoRelleno}
          stroke={colores.cuerpoBorde}
          strokeWidth={3}
        />

        {liquido && (
          <G clipPath={`url(#${idRecorte})`}>
            <AnimatedPath
              animatedProps={propsOla}
              fill={colores.liquido[estado]}
              fillOpacity={colores.opacidadLiquido}
            />
          </G>
        )}

        <Rect
          x={32}
          y={6}
          width={56}
          height={17}
          rx={6}
          fill={colores.tapa}
          rotation={estado === "roto" ? -14 : 0}
          originX={60}
          originY={14}
        />
        <Path
          d="M24 46 q-3 24 0 48"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {estado === "ok" && (
          <>
            <Circle cx={46} cy={80} r={4.5} fill={ojos} />
            <Circle cx={74} cy={80} r={4.5} fill={ojos} />
            <Path d="M47 94 Q60 107 73 94" stroke={boca} {...TRAZO} />
          </>
        )}

        {estado === "mod" && (
          <>
            <Circle cx={46} cy={80} r={4.5} fill={ojos} />
            <Circle cx={74} cy={80} r={4.5} fill={ojos} />
            <Path d="M40 70 L51 66 M69 66 L80 70" stroke={ojos} {...TRAZO} />
            <Path d="M50 98 H70" stroke={boca} {...TRAZO} />
          </>
        )}

        {estado === "crit" && (
          <>
            <Circle cx={46} cy={80} r={5.5} fill={ojos} />
            <Circle cx={74} cy={80} r={5.5} fill={ojos} />
            <Ellipse cx={60} cy={100} rx={6} ry={8} stroke={boca} {...TRAZO} />
            <Path
              d="M92 58 q6 9 0 13 q-6 -4 0 -13z"
              fill={colorRasgo(nivelFinal, ZONA_GOTA, tema)}
            />
          </>
        )}

        {estado === "zero" && (
          <>
            <Path d="M40 80 q6 6 12 0 M68 80 q6 6 12 0" stroke={ojos} {...TRAZO} />
            <Path d="M48 102 Q60 92 72 102" stroke={boca} {...TRAZO} />
          </>
        )}

        {estado === "roto" && (
          <>
            <Path
              d="M92 22 L84 42 L96 56 L84 76 L94 96"
              stroke={colores.grieta}
              {...TRAZO}
              strokeWidth={3}
            />
            <AnimatedG animatedProps={propsMonedas}>
              <Circle
                cx={98}
                cy={150}
                r={6}
                fill={colores.moneda}
                stroke={colores.bordeMoneda}
                strokeWidth={1.5}
              />
              <Circle
                cx={112}
                cy={141}
                r={4.5}
                fill={colores.moneda}
                stroke={colores.bordeMoneda}
                strokeWidth={1.5}
              />
            </AnimatedG>
            <Path
              d="M41 75 l10 10 M51 75 l-10 10 M69 75 l10 10 M79 75 l-10 10"
              stroke={ojos}
              {...TRAZO}
            />
            <Path d="M47 101 q4 -6 8 0 t8 0 t8 0" stroke={boca} {...TRAZO} />
          </>
        )}
      </Svg>
    </View>
  );
}
