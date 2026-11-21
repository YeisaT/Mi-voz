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

export type GameState = {
  codigo_acceso: string;
  puntaje: number;
  nombrePersonaje: string;
  nombreMascota: string | null;
  tipoMascota: TipoMascota;
  apariencia: Apariencia;
  tieneMascota: boolean;
};

const state: GameState = {
  codigo_acceso: import.meta.env.VITE_CODIGO_ACCESO || 'SOFI-101',
  puntaje: 0,
  nombrePersonaje: '',
  nombreMascota: null,
  tipoMascota: null,
  apariencia: { peinado: 0, color: 0 },
  tieneMascota: false,
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

/** Puntaje interno acumulado. Nunca mostrar como "puntos" o "riesgo". */
export function addPuntaje(puntos: number): void {
  state.puntaje += puntos;
}

export function getPuntaje(): number {
  return state.puntaje;
}
