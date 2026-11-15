import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icono, type NombreIcono } from "@/components/Icono";
import { styles } from "@/styles/features/principal/BarraInferior.styles";
import { palette } from "@/theme";

export type RutaAcceso = "/ajustes" | "/graficos" | "/historico";

const ACCESOS: { icono: NombreIcono; nombre: string; ruta: RutaAcceso }[] = [
  { icono: "ajustes", nombre: "Configuración", ruta: "/ajustes" },
  { icono: "graficos", nombre: "Gráficos", ruta: "/graficos" },
  { icono: "historico", nombre: "Histórico", ruta: "/historico" },
];

export function BarraInferior({
  onAnadir,
  onAcceso,
  incrustada = false,
}: {
  onAnadir: () => void;
  onAcceso: (ruta: RutaAcceso) => void;
  incrustada?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={
        incrustada
          ? [styles.barra, styles.incrustada]
          : [styles.barra, styles.flotante, { bottom: 24 + insets.bottom }]
      }
    >
      <View style={styles.accesos}>
        {ACCESOS.map((a) => (
          <Pressable
            key={a.icono}
            onPress={() => onAcceso(a.ruta)}
            accessibilityRole="button"
            accessibilityLabel={a.nombre}
            style={({ pressed }) => [
              styles.acceso,
              pressed && styles.accesoPresionado,
            ]}
          >
            <Icono nombre={a.icono} color={palette.crema} />
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={onAnadir}
        accessibilityRole="button"
        accessibilityLabel="Añadir movimiento"
        style={({ pressed }) => [styles.anadir, pressed && { opacity: 0.85 }]}
      >
        <Icono nombre="mas" color={palette.tinta} />
        <Text style={styles.anadirTexto}>Añadir</Text>
      </Pressable>
    </View>
  );
}
