import type { SceneManager } from '../core/SceneManager';
import { DECISION_RECREO } from '../config/decisiones';
import { DecisionScene } from './DecisionScene';

/** Colegio: decisión puntuada "La hora del recreo". */
export function createColegioScene(sm: SceneManager): DecisionScene {
  return new DecisionScene(sm, DECISION_RECREO, 'parque', 'Colegio');
}
