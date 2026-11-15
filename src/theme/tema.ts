import { conAlfa, esOscuro, masLegible, mezclar, tonoLegible } from "@/lib/tonos";

import {
  PALETA_POR_DEFECTO,
  PALETAS,
  type ClavePaleta,
  type EstadoLiquido,
  type Paleta,
} from "./paletas";

export type Tono = { fuerte: string; suave: string; texto: string };

export type Tema = Paleta & {
  clave: ClavePaleta;
  oscuro: boolean;
  textoTenue: string;
  textoPista: string;
  textoSobrePanelSuave: string;
  lineaPanel: string;
  presionadoPanel: string;
  brilloPanel: string;
  velo: string;
  sobreAcento: string;
  sobreLiquido: string;
  tono: Record<EstadoLiquido, Tono>;
  peligroTexto: string;
  ingresoTexto: string;
};

function crearTono(p: Paleta, color: string): Tono {
  const suave = mezclar(p.superficie, color, 0.3);
  return {
    fuerte: color,
    suave,
    texto: tonoLegible(color, [suave, p.superficie, p.fondo]),
  };
}

export function crearTema(clave: ClavePaleta): Tema {
  const p: Paleta = PALETAS[clave];
  const tintas = [p.texto, p.textoSobrePanel, p.fondo, p.panel];
  const liquidos = [p.liquido.ok, p.liquido.mod, p.liquido.crit];
  const tono = {
    ok: crearTono(p, p.liquido.ok),
    mod: crearTono(p, p.liquido.mod),
    crit: crearTono(p, p.liquido.crit),
  };
  return {
    ...p,
    clave,
    oscuro: esOscuro(p.fondo),
    textoTenue: conAlfa(p.texto, 0.44),
    textoPista: conAlfa(p.texto, 0.25),
    textoSobrePanelSuave: conAlfa(p.textoSobrePanel, 0.74),
    lineaPanel: conAlfa(p.textoSobrePanel, 0.16),
    presionadoPanel: conAlfa(p.textoSobrePanel, 0.1),
    brilloPanel: conAlfa(p.acento, 0.07),
    velo: conAlfa(p.panel, 0.62),
    sobreAcento: masLegible([p.acento], tintas),
    sobreLiquido: masLegible(liquidos, tintas),
    tono,
    peligroTexto: tono.crit.texto,
    ingresoTexto: tono.ok.texto,
  };
}

export const TEMA_POR_DEFECTO = crearTema(PALETA_POR_DEFECTO);

export function colorDeEstado(tema: Tema, estado: string): string {
  if (estado === "ok" || estado === "mod") return tema.liquido[estado];
  return tema.liquido.crit;
}
