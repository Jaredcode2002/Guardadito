import { Pressable, View } from "react-native";

import { COLORES_CATEGORIA, type ColorCategoria } from "@/lib/colores";
import { crearEstilos } from "@/styles/components/SelectorColor.styles";
import { useEstilos, useTema } from "@/theme";

import { Icono } from "./Icono";

export function SelectorColor({
  valor,
  onCambiar,
}: {
  valor: ColorCategoria | null;
  onCambiar: (c: ColorCategoria) => void;
}) {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
  return (
    <View style={styles.fila}>
      {COLORES_CATEGORIA.map((c) => {
        const activo = c.clave === valor;
        return (
          <Pressable
            key={c.clave}
            onPress={() => onCambiar(c.clave)}
            accessibilityRole="button"
            accessibilityLabel={c.nombre}
            accessibilityState={{ selected: activo }}
            style={[styles.anillo, activo && styles.anilloActivo]}
          >
            <View style={[styles.muestra, { backgroundColor: c.hex }]}>
              {activo && <Icono nombre="check" color={tema.textoSobrePanel} tamano={18} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
