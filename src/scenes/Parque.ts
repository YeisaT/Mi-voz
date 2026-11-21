import type { SceneManager } from '../core/SceneManager';
import { DECISION_PARQUE } from '../config/decisiones';
import { DecisionScene } from './DecisionScene';

/** Parque / celular: decisión puntuada "Una invitación o mensaje raro". */
export function createParqueScene(sm: SceneManager): DecisionScene {
  return new DecisionScene(sm, DECISION_PARQUE, 'final', 'Parque');
}
