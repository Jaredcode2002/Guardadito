import Svg, { Circle, Path } from "react-native-svg";

const ICONOS = {
  ajustes: {
    trazos: ["M4 7h9M17 7h3M4 17h3M11 17h9"],
    circulos: [
      [15, 7, 2],
      [9, 17, 2],
    ],
  },
  graficos: { trazos: ["M5 20v-8M12 20V5M19 20v-5"], circulos: [] },
  historico: {
    trazos: ["M7 3h7l5 5v13H7z", "M14 3v5h5M10 13h6M10 17h6"],
    circulos: [],
  },
  atras: { trazos: ["M15 6l-6 6 6 6"], circulos: [] },
  mas: { trazos: ["M12 5v14M5 12h14"], circulos: [] },
  menos: { trazos: ["M6 12h12"], circulos: [] },
  flecha: { trazos: ["M5 12h14M13 6l6 6-6 6"], circulos: [] },
  check: { trazos: ["M5 12.5l4.5 4.5L19 7.5"], circulos: [] },
  cerrar: { trazos: ["M6 6l12 12M18 6L6 18"], circulos: [] },
} satisfies Record<
  string,
  { trazos: string[]; circulos: [number, number, number][] }
>;

export type NombreIcono = keyof typeof ICONOS;

export function Icono({
  nombre,
  color,
  tamano = 22,
}: {
  nombre: NombreIcono;
  color: string;
  tamano?: number;
}) {
  const { trazos, circulos } = ICONOS[nombre];
  return (
    <Svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {trazos.map((d) => (
        <Path key={d} d={d} />
      ))}
      {circulos.map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
    </Svg>
  );
}
