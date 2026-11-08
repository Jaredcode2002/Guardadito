import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

import { inicializarDb } from "@/db/inicializar";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="guardadito.db"
      onInit={inicializarDb}
      onError={(e) => console.error("Error al abrir la base de datos", e)}
    >
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.fondo },
        }}
      />
    </SQLiteProvider>
  );
}
