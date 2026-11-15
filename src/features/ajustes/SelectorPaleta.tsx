import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Frasco } from "@/components/frasco/Frasco";
import { Icono } from "@/components/Icono";
import { mostrarAviso } from "@/features/avisos/store";
import { crearEstilos } from "@/styles/features/ajustes/SelectorPaleta.styles";
import {
  CLAVES_PALETA,
  crearTema,
  useEstilos,
  useTema,
  type ClavePaleta,
  type Tema,
} from "@/theme";

export function SelectorPaleta() {
  const styles = useEstilos(crearEstilos);
  const { tema, cambiarPaleta } = useTema();
  const temas = useMemo(() => CLAVES_PALETA.map(crearTema), []);

  async function elegir(clave: ClavePaleta) {
    if (clave === tema.clave) return;
    try {
      await cambiarPaleta(clave);
      Haptics.selectionAsync();
    } catch (e) {
      mostrarAviso({
        tono: "coral",
        texto: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return (
    <View style={styles.rejilla} accessibilityRole="radiogroup">
      {temas.map((t) => (
        <Muestra
          key={t.clave}
          muestra={t}
          activa={t.clave === tema.clave}
          onPress={() => elegir(t.clave)}
        />
      ))}
    </View>
  );
}

function Muestra({
  muestra,
  activa,
  onPress,
}: {
  muestra: Tema;
  activa: boolean;
  onPress: () => void;
}) {
  const styles = useEstilos(crearEstilos);
  const { liquido } = muestra;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: activa }}
      accessibilityLabel={`Paleta ${muestra.nombre}`}
      style={({ pressed }) => [
        styles.tarjeta,
        activa && styles.tarjetaActiva,
        { backgroundColor: muestra.fondo },
        pressed && styles.presionada,
      ]}
    >
      <View style={[styles.muestraPanel, { backgroundColor: muestra.panel }]}>
        <Frasco estado="ok" porcentaje={0.68} ancho={34} tema={muestra} />
        <View style={styles.puntos}>
          {[liquido.ok, liquido.mod, liquido.crit].map((color) => (
            <View key={color} style={[styles.punto, { backgroundColor: color }]} />
          ))}
        </View>
      </View>
      <View style={styles.pie}>
        <View>
          <Text style={[styles.nombre, { color: muestra.texto }]}>
            {muestra.nombre}
          </Text>
          <View style={[styles.linea, { backgroundColor: muestra.borde }]} />
        </View>
        {activa && <Icono nombre="check" color={muestra.texto} tamano={18} />}
      </View>
    </Pressable>
  );
}
