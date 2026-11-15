import { StyleSheet } from "react-native";

import { fonts, type Tema } from "@/theme";

export const SEPARACION = 12;

export const crearEstilos = (t: Tema) => StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: t.fondo },
  tablet: { flex: 1, flexDirection: "row", backgroundColor: t.fondo },
  derecha: { flex: 1 },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: t.fondo,
  },
  error: {
    color: t.peligroTexto,
    fontFamily: fonts.body,
    fontSize: 16,
    textAlign: "center",
  },
  seccion: { paddingHorizontal: 20 },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  encabezadoRecientes: { marginTop: 30 },
  titulo: { color: t.texto, fontFamily: fonts.display, fontSize: 20 },
  tituloTablet: { fontSize: 24 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: t.borde,
  },
  chipTexto: {
    color: t.texto,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  lista: { gap: 8 },
  cuadricula: { flexDirection: "row", flexWrap: "wrap", gap: SEPARACION },
  verTodo: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  verTodoTexto: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  vacio: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 28,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: t.bordeFuerte,
  },
  vacioTitulo: {
    color: t.texto,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  vacioTexto: { color: t.textoSecundario, fontFamily: fonts.body, fontSize: 14 },
});
