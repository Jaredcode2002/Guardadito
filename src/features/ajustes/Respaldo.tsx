import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { textoUltimoRespaldo } from "@/features/ajustes/logica";
import { useRespaldo } from "@/features/respaldo/useRespaldo";
import { crearEstilos } from "@/styles/features/ajustes/Respaldo.styles";
import { useEstilos, useTema } from "@/theme";

export function Respaldo() {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
  const { ultimo, ocupado, respaldar } = useRespaldo();
  const apagado = ocupado !== null;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.texto}>
        Guarda una copia de todos tus datos en un archivo. Al elegir la
        carpeta puedes escoger Google Drive.
      </Text>
      <Text style={styles.ultimo}>{textoUltimoRespaldo(ultimo, new Date())}</Text>
      <View style={styles.botones}>
        <Pressable
          onPress={() => respaldar("carpeta")}
          disabled={apagado}
          accessibilityRole="button"
          accessibilityState={{ disabled: apagado, busy: ocupado === "carpeta" }}
          style={[styles.principal, apagado && styles.inactivo]}
        >
          {ocupado === "carpeta" ? (
            <ActivityIndicator color={tema.sobreAcento} />
          ) : (
            <Text style={styles.principalTexto}>Guardar en carpeta</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => respaldar("compartir")}
          disabled={apagado}
          accessibilityRole="button"
          accessibilityState={{ disabled: apagado, busy: ocupado === "compartir" }}
          style={[styles.secundario, apagado && styles.inactivo]}
        >
          {ocupado === "compartir" ? (
            <ActivityIndicator color={tema.texto} />
          ) : (
            <Text style={styles.secundarioTexto}>Compartir</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
