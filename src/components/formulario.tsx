import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { fonts, palette } from "@/theme";

export const GRIS = "#4A5850";
export const PAPEL = "#FFFDF8";
export const BORDE = "#EAE2D0";

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

const styles = StyleSheet.create({
  titulo: { color: palette.tinta, fontFamily: fonts.display, fontSize: 24 },
  etiqueta: {
    color: GRIS,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 8,
  },
  campo: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDE,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: PAPEL,
    color: palette.tinta,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  monto: { flexDirection: "row", alignItems: "center", gap: 8 },
  montoL: { color: GRIS, fontFamily: fonts.display, fontSize: 30 },
  montoInput: {
    flex: 1,
    padding: 0,
    color: palette.tinta,
    fontFamily: fonts.display,
    fontSize: 60,
  },
  selector: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 26,
    backgroundColor: palette.panel,
  },
  opcion: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionActiva: { backgroundColor: palette.lima },
  opcionTexto: { color: palette.crema, fontFamily: fonts.bodyMedium, fontSize: 15 },
  opcionTextoActivo: { color: palette.tinta, fontFamily: fonts.bodySemiBold },
  chip: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDE,
    backgroundColor: PAPEL,
  },
  chipActivo: { borderColor: palette.panel, backgroundColor: palette.panel },
  chipTexto: { color: palette.tinta, fontFamily: fonts.bodyMedium, fontSize: 14 },
  chipTextoActivo: { color: palette.crema, fontFamily: fonts.bodySemiBold },
  principal: {
    height: 56,
    marginTop: 18,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.panel,
  },
  principalTexto: {
    color: palette.crema,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
  inactivo: { opacity: 0.4 },
  peligro: {
    height: 48,
    marginTop: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  peligroTexto: { color: "#B23A26", fontFamily: fonts.bodySemiBold, fontSize: 15 },
  error: {
    color: "#B23A26",
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginTop: 10,
  },
});
