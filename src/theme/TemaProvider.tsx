import { useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { guardarPaleta, leerAjustes } from "@/db/ajustes";

import type { ClavePaleta } from "./paletas";
import { crearTema, TEMA_POR_DEFECTO, type Tema } from "./tema";

type ValorTema = {
  tema: Tema;
  cambiarPaleta: (clave: ClavePaleta) => Promise<void>;
};

const ContextoTema = createContext<ValorTema>({
  tema: TEMA_POR_DEFECTO,
  cambiarPaleta: async () => {},
});

export function TemaProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [clave, setClave] = useState<ClavePaleta | null>(null);

  useEffect(() => {
    let vigente = true;
    leerAjustes(db)
      .then((a) => vigente && setClave(a.paleta))
      .catch(() => vigente && setClave(TEMA_POR_DEFECTO.clave));
    return () => {
      vigente = false;
    };
  }, [db]);

  const tema = useMemo(() => (clave ? crearTema(clave) : null), [clave]);

  useEffect(() => {
    if (tema) SystemUI.setBackgroundColorAsync(tema.fondo);
  }, [tema]);

  const cambiarPaleta = useCallback(
    async (nueva: ClavePaleta) => {
      await guardarPaleta(db, nueva);
      setClave(nueva);
    },
    [db],
  );

  const valor = useMemo(
    () => (tema ? { tema, cambiarPaleta } : null),
    [tema, cambiarPaleta],
  );

  if (!valor) return null;

  return (
    <ContextoTema.Provider value={valor}>
      <StatusBar style={valor.tema.oscuro ? "light" : "dark"} />
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema(): ValorTema {
  return useContext(ContextoTema);
}

const cache = new WeakMap<object, Map<ClavePaleta, unknown>>();

export function useEstilos<T>(crear: (tema: Tema) => T): T {
  const { tema } = useContext(ContextoTema);
  let porTema = cache.get(crear) as Map<ClavePaleta, T> | undefined;
  if (!porTema) {
    porTema = new Map();
    cache.set(crear, porTema);
  }
  let estilos = porTema.get(tema.clave);
  if (estilos === undefined) {
    estilos = crear(tema);
    porTema.set(tema.clave, estilos);
  }
  return estilos;
}
