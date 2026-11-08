import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { Toast } from "@/components/Toast";
import { inicializarDb } from "@/db/inicializar";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync();

const HOJAS = ["anadir", "pendiente", "categoria", "ahorro"] as const;

const OPCIONES_HOJA = {
  presentation: "transparentModal",
  animation: "fade",
  contentStyle: { backgroundColor: "transparent" },
} as const;

export default function RootLayout() {
  const [fuentesListas, errorFuentes] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  const listo = fuentesListas || errorFuentes !== null;

  useEffect(() => {
    if (listo) SplashScreen.hideAsync();
  }, [listo]);

  if (!listo) return null;

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
      >
        {HOJAS.map((nombre) => (
          <Stack.Screen key={nombre} name={nombre} options={OPCIONES_HOJA} />
        ))}
      </Stack>
      <Toast />
    </SQLiteProvider>
  );
}
