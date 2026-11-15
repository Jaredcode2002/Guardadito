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
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path } from "react-native-svg";

import { NOMBRES_FORMA, type EstadoFrasco, type FormaFrasco } from "@/lib/frasco";
import { durations, useTema, type Tema } from "@/theme";

import {
  burbujaSumergida,
  caminoOla,
  coloresFrasco,
  colorRasgo,
  dibujoPara,
  GEOMETRIAS,
  GROSOR_ESPUMA,
  nivelSegunEstado,
  tieneLiquido,
  transformacionCara,
  type VarianteFrasco,
  VIEWBOX,
  zonasCara,
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
  variante?: VarianteFrasco;
  tema?: Tema;
  forma?: FormaFrasco;
  guino?: boolean;
};

export function Frasco({
  estado,
  porcentaje,
  ancho = 124,
  variante = "panel",
  tema,
  forma: formaElegida,
  guino = false,
}: Props) {
  const app = useTema();
  const forma = formaElegida ?? app.forma;
  const dibujo = dibujoPara(forma, porcentaje, estado);
  const g = GEOMETRIAS[dibujo];
  const zonas = zonasCara(dibujo);
  const colores = coloresFrasco(tema ?? app.tema, variante);
  const reducir = useReducedMotion();
  const idRecorte = `frasco${useId().replace(/[^a-zA-Z0-9]/g, "")}${dibujo}`;
  const liquido = tieneLiquido(estado);
  const nivelFinal = nivelSegunEstado(estado, porcentaje, dibujo);

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

  const propsEspuma = useAnimatedProps(() => ({
    d: caminoOla(nivel.get() - GROSOR_ESPUMA, desfase.get()),
  }));

  const propsMonedas = useAnimatedProps(() => ({
    translateY: caida.get() * 4,
  }));

  const ojos = colorRasgo(nivelFinal, zonas.ojos, colores);
  const boca = colorRasgo(nivelFinal, zonas.boca, colores);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${NOMBRES_FORMA[forma]} del libre al ${Math.round(porcentaje * 100)} %`}
    >
      <Svg
        key={dibujo}
        width={ancho}
        height={(ancho * VIEWBOX.alto) / VIEWBOX.ancho}
        viewBox={`0 0 ${VIEWBOX.ancho} ${VIEWBOX.alto}`}
      >
        <Defs>
          <ClipPath id={idRecorte}>
            <Path d={g.contorno} />
          </ClipPath>
        </Defs>

        <Path
          d={g.contorno}
          fill={g.vidrioAmbar ? colores.vidrioAmbar : colores.cuerpoRelleno}
          stroke={colores.cuerpoBorde}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {liquido && (
          <G clipPath={`url(#${idRecorte})`} clipRule="nonzero">
            {g.espuma && (
              <AnimatedPath
                animatedProps={propsEspuma}
                fill={colores.espuma[estado]}
              />
            )}
            <AnimatedPath
              animatedProps={propsOla}
              fill={colores.liquido[estado]}
              fillOpacity={colores.opacidadLiquido}
            />
            {g.burbujas
              .filter((b) => burbujaSumergida(b, nivelFinal))
              .map((b) => (
                <Circle
                  key={`${b.cx}-${b.cy}`}
                  cx={b.cx}
                  cy={b.cy}
                  r={b.r}
                  fill={colores.espuma[estado]}
                  fillOpacity={0.8}
                />
              ))}
          </G>
        )}

        {g.detalles !== "" && (
          <Path
            d={g.detalles}
            stroke={colores.cuerpoBorde}
            {...TRAZO}
            strokeWidth={2}
          />
        )}
        {g.sellos !== "" && <Path d={g.sellos} fill={colores.tapa} />}
        {g.alambre !== "" && (
          <Path d={g.alambre} stroke={colores.tapa} {...TRAZO} strokeWidth={3} />
        )}
        <Path
          d={g.tapa}
          fill={colores.tapa}
          transform={estado === "roto" ? g.tapaRota : undefined}
        />
        <Path
          d={g.brillo}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {liquido && g.destellos !== "" && (
          <Path d={g.destellos} fill={colores.destello} />
        )}

        {estado === "roto" && (
          <>
            <Path
              d={g.grieta}
              stroke={colores.grieta}
              {...TRAZO}
              strokeWidth={3}
            />
            <AnimatedG animatedProps={propsMonedas}>
              {g.monedas.map((m) => (
                <Circle
                  key={`${m.cx}-${m.cy}`}
                  cx={m.cx}
                  cy={m.cy}
                  r={m.r}
                  fill={colores.moneda}
                  stroke={colores.bordeMoneda}
                  strokeWidth={1.5}
                />
              ))}
            </AnimatedG>
          </>
        )}

        <G transform={transformacionCara(dibujo)}>
          {estado === "ok" && (
            <>
              {guino ? (
                <Path d="M40 82 q6 -7 12 0" stroke={ojos} {...TRAZO} />
              ) : (
                <Circle cx={46} cy={80} r={4.5} fill={ojos} />
              )}
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
                fill={colorRasgo(nivelFinal, zonas.gota, colores)}
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
                d="M41 75 l10 10 M51 75 l-10 10 M69 75 l10 10 M79 75 l-10 10"
                stroke={ojos}
                {...TRAZO}
              />
              <Path d="M47 101 q4 -6 8 0 t8 0 t8 0" stroke={boca} {...TRAZO} />
            </>
          )}
        </G>
      </Svg>
    </View>
  );
}
