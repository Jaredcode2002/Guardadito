import { StyleSheet } from "react-native";

import { type Tema } from "@/theme";

export const crearEstilos = (t: Tema) => StyleSheet.create({
  pista: { width: 52, height: 32, borderRadius: 16, padding: 4 },
  pistaActiva: { backgroundColor: t.panel },
  pistaInactiva: { backgroundColor: t.bordeFuerte },
  perilla: { width: 24, height: 24, borderRadius: 12 },
  perillaActiva: { backgroundColor: t.acento },
  perillaInactiva: { backgroundColor: t.superficie },
});
