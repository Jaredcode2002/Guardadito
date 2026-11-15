import type { ReactNode } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { Icono, type NombreIcono } from "@/components/Icono";
import { useColorAnimado } from "@/components/useColorAnimado";
import { styles } from "@/styles/components/formulario.styles";
import { palette, type Acento } from "@/theme";

const PressableAnimado = Animated.createAnimatedComponent(Pressable);

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

function InputMonto(props: TextInputProps) {
  return (
    <TextInput
      placeholder="0"
      placeholderTextColor="#17231C40"
      keyboardType="decimal-pad"
      accessibilityLabel="Monto en lempiras"
      {...props}
      style={styles.montoInput}
    />
  );
}

function CampoMontoConAcento({
  acento,
  signo,
  ...props
}: TextInputProps & { acento: Acento; signo?: string }) {
  const borde = useColorAnimado(acento.fuerte);
  const fondo = useColorAnimado(acento.suave);
  const tinta = useColorAnimado(acento.oscuro);
  const estiloCaja = useAnimatedStyle(() => ({
    borderColor: borde.get(),
    backgroundColor: fondo.get(),
  }));
  const estiloTinta = useAnimatedStyle(() => ({ color: tinta.get() }));

  return (
    <Animated.View style={[styles.monto, styles.montoAcento, estiloCaja]}>
      {signo && (
        <Animated.Text
          style={[styles.montoSigno, estiloTinta]}
          importantForAccessibility="no"
        >
          {signo}
        </Animated.Text>
      )}
      <Animated.Text style={[styles.montoL, estiloTinta]}>L</Animated.Text>
      <InputMonto {...props} />
    </Animated.View>
  );
}

export function CampoMonto({
  acento,
  signo,
  ...props
}: TextInputProps & { acento?: Acento; signo?: string }) {
  if (acento) {
    return <CampoMontoConAcento acento={acento} signo={signo} {...props} />;
  }
  return (
    <View style={styles.monto}>
      <Text style={styles.montoL}>L</Text>
      <InputMonto {...props} />
    </View>
  );
}

function OpcionSelector({
  texto,
  icono,
  activa,
  acento,
  onPress,
}: {
  texto: string;
  icono?: NombreIcono;
  activa: boolean;
  acento: string;
  onPress: () => void;
}) {
  const fondo = useColorAnimado(activa ? acento : palette.panel);
  const estiloFondo = useAnimatedStyle(() => ({
    backgroundColor: fondo.get(),
  }));

  return (
    <PressableAnimado
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={texto}
      style={[styles.opcion, estiloFondo]}
    >
      {icono && (
        <Icono
          nombre={icono}
          color={activa ? palette.tinta : palette.crema}
          tamano={18}
        />
      )}
      <Text style={[styles.opcionTexto, activa && styles.opcionTextoActivo]}>
        {texto}
      </Text>
    </PressableAnimado>
  );
}

export function Selector<T extends string>({
  opciones,
  valor,
  onCambiar,
  acento = palette.lima,
}: {
  opciones: readonly { valor: T; texto: string; icono?: NombreIcono }[];
  valor: T;
  onCambiar: (v: T) => void;
  acento?: string;
}) {
  return (
    <View style={styles.selector}>
      {opciones.map((o) => (
        <OpcionSelector
          key={o.valor}
          texto={o.texto}
          icono={o.icono}
          activa={o.valor === valor}
          acento={acento}
          onPress={() => onCambiar(o.valor)}
        />
      ))}
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
  acento,
}: {
  texto: string;
  onPress: () => void;
  activo?: boolean;
  acento?: string;
}) {
  const fondo = useColorAnimado(acento ?? palette.panel);
  const estiloFondo = useAnimatedStyle(() => ({
    backgroundColor: fondo.get(),
  }));

  return (
    <PressableAnimado
      onPress={onPress}
      disabled={!activo}
      accessibilityRole="button"
      accessibilityState={{ disabled: !activo }}
      style={[styles.principal, estiloFondo, !activo && styles.inactivo]}
    >
      <Text
        style={[
          styles.principalTexto,
          acento ? styles.principalTextoAcento : null,
        ]}
      >
        {texto}
      </Text>
    </PressableAnimado>
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
