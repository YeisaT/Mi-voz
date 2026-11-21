/**
 * Estado del juego SOLO en memoria.
 * Los nombres de personaje y mascota NUNCA van a API, log ni localStorage.
 */

export type PeinadoId = 0 | 1 | 2;
export type ColorAparienciaId = 0 | 1 | 2 | 3;
export type TipoMascota = 'perro' | 'gato' | 'conejo' | 'pajaro' | 'pez' | null;

export type Apariencia = {
  peinado: PeinadoId;
  color: ColorAparienciaId;
};

export type DecisionRegistro = {
  escenario: 1 | 2 | 3;
  id: string;
  titulo: string;
  opcion: 'A' | 'B' | 'C';
  puntos: 0 | 1 | 2;
  textoOpcion: string;
};

export type RespuestasCasa = {
  familiaPersonas: string[];
  familiaDinamica: string | null;
  confianza: string[];
  miedoPersona: string | null;
  miedoMotivo: string | null;
  bienestar: string | null;
};

export type GameState = {
  codigo_acceso: string;
  puntaje: number;
  nombrePersonaje: string;
  nombreMascota: string | null;
  tipoMascota: TipoMascota;
  apariencia: Apariencia;
  tieneMascota: boolean;
  respuestasCasa: RespuestasCasa;
  decisiones: DecisionRegistro[];
};

const emptyCasa = (): RespuestasCasa => ({
  familiaPersonas: [],
  familiaDinamica: null,
  confianza: [],
  miedoPersona: null,
  miedoMotivo: null,
  bienestar: null,
});

const state: GameState = {
  codigo_acceso: import.meta.env.VITE_CODIGO_ACCESO || 'SOFI-101',
  puntaje: 0,
  nombrePersonaje: '',
  nombreMascota: null,
  tipoMascota: null,
  apariencia: { peinado: 0, color: 0 },
  tieneMascota: false,
  respuestasCasa: emptyCasa(),
  decisiones: [],
};

export function getState(): Readonly<GameState> {
  return state;
}

export function setCodigoAcceso(codigo: string): void {
  state.codigo_acceso = codigo;
}

export function setApariencia(apariencia: Apariencia): void {
  state.apariencia = apariencia;
}

export function setNombrePersonaje(nombre: string): void {
  state.nombrePersonaje = nombre.trim();
}

export function setMascota(
  tipo: TipoMascota,
  nombre: string | null,
): void {
  state.tipoMascota = tipo;
  state.nombreMascota = nombre ? nombre.trim() : null;
  state.tieneMascota = Boolean(tipo && nombre);
}

export function clearMascota(): void {
  state.tipoMascota = null;
  state.nombreMascota = null;
  state.tieneMascota = false;
}

/** Puntaje interno acumulado. Nunca mostrar como "puntos" o "riesgo" a la niña. */
export function addPuntaje(puntos: number): void {
  state.puntaje += puntos;
}

export function getPuntaje(): number {
  return state.puntaje;
}

export function setRespuestaFamilia(personas: string[], dinamica: string | null): void {
  state.respuestasCasa.familiaPersonas = [...personas];
  state.respuestasCasa.familiaDinamica = dinamica;
}

export function setRespuestaConfianza(personas: string[]): void {
  state.respuestasCasa.confianza = [...personas];
}

export function setRespuestaMiedo(persona: string | null, motivo: string | null): void {
  state.respuestasCasa.miedoPersona = persona;
  state.respuestasCasa.miedoMotivo = motivo;
}

export function setRespuestaBienestar(noche: string | null): void {
  state.respuestasCasa.bienestar = noche;
}

export function registrarDecision(reg: DecisionRegistro): void {
  const idx = state.decisiones.findIndex((d) => d.escenario === reg.escenario);
  if (idx >= 0) {
    const prev = state.decisiones[idx]!;
    state.puntaje -= prev.puntos;
    state.decisiones[idx] = reg;
  } else {
    state.decisiones.push(reg);
  }
  state.puntaje += reg.puntos;
}

export function resetSesionJuego(): void {
  state.puntaje = 0;
  state.nombrePersonaje = '';
  state.nombreMascota = null;
  state.tipoMascota = null;
  state.tieneMascota = false;
  state.apariencia = { peinado: 0, color: 0 };
  state.respuestasCasa = emptyCasa();
  state.decisiones = [];
}

/** Interpretación suave para la profesional (no se muestra a la niña). */
export function interpretacionPuntaje(total: number): {
  etiqueta: string;
  detalle: string;
  colorHint: 'calma' | 'amarillo' | 'rosa';
} {
  if (total <= 1) {
    return {
      etiqueta: 'Atención baja',
      detalle:
        'Las elecciones de las historias sugieren pocas señales de alerta. Igual conviene conversar con calma sobre cómo se sintió.',
      colorHint: 'calma',
    };
  }
  if (total <= 3) {
    return {
      etiqueta: 'Atención media',
      detalle:
        'Hay señales intermedias. Vale la pena profundizar con preguntas abiertas y revisar redes de apoyo.',
      colorHint: 'amarillo',
    };
  }
  return {
    etiqueta: 'Atención alta',
    detalle:
      'Las elecciones sugieren necesidad de conversación protectora prioritaria. Revisar confianza, miedo y mensajes/secretos.',
    colorHint: 'rosa',
  };
}
