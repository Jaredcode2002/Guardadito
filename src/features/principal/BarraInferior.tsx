import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icono, type NombreIcono } from "@/components/Icono";
import { fonts, palette } from "@/theme";

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

const styles = StyleSheet.create({
  barra: {
    height: 68,
    borderRadius: 34,
    backgroundColor: palette.panel,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 14,
    paddingRight: 8,
  },
  flotante: { position: "absolute", left: 20, right: 20 },
  incrustada: {
    backgroundColor: "transparent",
    paddingLeft: 0,
    paddingRight: 0,
  },
  accesos: { flexDirection: "row", gap: 2 },
  acceso: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  accesoPresionado: { backgroundColor: "rgba(246,241,231,0.1)" },
  anadir: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 14,
    paddingRight: 20,
    borderRadius: 26,
    backgroundColor: palette.lima,
  },
  anadirTexto: {
    color: palette.tinta,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
});
