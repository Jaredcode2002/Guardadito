import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Icono } from "@/components/Icono";
import { textoUltimoRespaldo } from "@/features/ajustes/logica";
import { useRespaldo } from "@/features/respaldo/useRespaldo";
import type { EstadoRestaurar } from "@/features/respaldo/useRestaurar";
import { crearEstilos } from "@/styles/features/ajustes/Respaldo.styles";
import { useEstilos, useTema } from "@/theme";

export function Respaldo({
  restaurando,
  onRestaurar,
}: {
  restaurando: EstadoRestaurar;
  onRestaurar: () => void;
}) {
  const styles = useEstilos(crearEstilos);
  const { tema } = useTema();
  const { ultimo, ocupado, respaldar } = useRespaldo();
  const apagado = ocupado !== null || restaurando !== null;

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

      <View style={styles.divisor} />
      <Text style={styles.texto}>
        ¿Cambiaste de teléfono? Elige un respaldo, también desde Google Drive,
        para traer tus datos.
      </Text>
      <Pressable
        onPress={onRestaurar}
        disabled={apagado}
        accessibilityRole="button"
        accessibilityState={{ disabled: apagado, busy: restaurando !== null }}
        style={[styles.restaurar, apagado && styles.inactivo]}
      >
        {restaurando !== null ? (
          <ActivityIndicator color={tema.texto} />
        ) : (
          <>
            <Icono nombre="bajar" color={tema.texto} tamano={18} />
            <Text style={styles.secundarioTexto}>Restaurar desde archivo</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
