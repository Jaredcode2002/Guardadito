import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, spacing } from '@/theme';

export default function Inicio() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Guardadito</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.fondo,
  },
  titulo: {
    fontSize: fontSizes.xl,
    color: colors.texto,
  },
});
