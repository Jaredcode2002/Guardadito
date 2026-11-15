import type { ReactNode } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { styles } from "@/styles/components/formulario.styles";

export function Titulo({ children }: { children: ReactNode }) {
  return <Text style={styles.titulo}>{children}</Text>;
}

export function Etiqueta({ children }: { children: ReactNode }) {
  return <Text style={styles.etiqueta}>{children}</Text>;
}

export function CampoTexto(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#17231C70"
      {...props}
      style={[styles.campo, props.style]}
    />
  );
}

export function CampoMonto(props: TextInputProps) {
  return (
    <View style={styles.monto}>
      <Text style={styles.montoL}>L</Text>
      <TextInput
        placeholder="0"
        placeholderTextColor="#17231C40"
        keyboardType="decimal-pad"
        accessibilityLabel="Monto en lempiras"
        {...props}
        style={styles.montoInput}
      />
    </View>
  );
}

export function Selector<T extends string>({
  opciones,
  valor,
  onCambiar,
}: {
  opciones: readonly { valor: T; texto: string }[];
  valor: T;
  onCambiar: (v: T) => void;
}) {
  return (
    <View style={styles.selector}>
      {opciones.map((o) => {
        const activa = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onCambiar(o.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            style={[styles.opcion, activa && styles.opcionActiva]}
          >
            <Text style={[styles.opcionTexto, activa && styles.opcionTextoActivo]}>
              {o.texto}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({
  texto,
  activo = false,
  onPress,
}: {
  texto: string;
  activo?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={[styles.chip, activo && styles.chipActivo]}
    >
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
        {texto}
      </Text>
    </Pressable>
  );
}

export function BotonPrincipal({
  texto,
  onPress,
  activo = true,
}: {
  texto: string;
  onPress: () => void;
  activo?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!activo}
      accessibilityRole="button"
      style={[styles.principal, !activo && styles.inactivo]}
    >
      <Text style={styles.principalTexto}>{texto}</Text>
    </Pressable>
  );
}

export function BotonPeligro({
  texto,
  onPress,
}: {
  texto: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.peligro, pressed && styles.inactivo]}
    >
      <Text style={styles.peligroTexto}>{texto}</Text>
    </Pressable>
  );
}

export function MensajeError({ children }: { children: ReactNode }) {
  return <Text style={styles.error}>{children}</Text>;
}
