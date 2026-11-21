/**
 * Decisiones puntuadas. El puntaje es interno (nunca se muestra como puntos/riesgo).
 * A = 0, B = 1, C = 2.
 * Usa {nombre_personaje} y opcionalmente {nombre_mascota}.
 */
export type OpcionDecision = {
  id: 'A' | 'B' | 'C';
  puntos: 0 | 1 | 2;
  texto: string;
  feedback: string;
};

export type DecisionPuntuada = {
  id: string;
  escenario: 1 | 2 | 3;
  titulo: string;
  narracion: string;
  opciones: OpcionDecision[];
};

export const DECISION_PUERTA: DecisionPuntuada = {
  id: 'puerta',
  escenario: 1,
  titulo: 'La puerta cerrada',
  narracion:
    'En la casa hay una puerta cerrada. Alguien le dice a {nombre_personaje}: "Ven, es un secreto. No se lo cuentes a nadie." ¿Qué hace {nombre_personaje}?',
  opciones: [
    {
      id: 'A',
      puntos: 0,
      texto: 'Busca a una persona adulta de confianza y le cuenta lo que pasó.',
      feedback:
        '{nombre_personaje} hace bien en pedir ayuda. Los secretos que dan miedo se pueden contar a alguien que cuida.',
    },
    {
      id: 'B',
      puntos: 1,
      texto: 'Se queda cerca de la puerta, pero no entra y no dice nada.',
      feedback:
        '{nombre_personaje} no entró. A veces también ayuda decirle a alguien de confianza cómo se siente.',
    },
    {
      id: 'C',
      puntos: 2,
      texto: 'Entra y promete guardar el secreto.',
      feedback:
        'Guardar secretos que dan miedo puede ser pesado. {nombre_personaje} siempre puede hablar con alguien de confianza.',
    },
  ],
};

export const DECISION_RECREO: DecisionPuntuada = {
  id: 'recreo',
  escenario: 2,
  titulo: 'La hora del recreo',
  narracion:
    'En el recreo, alguien le pide a {nombre_personaje} que vaya a un lugar solo/a, lejos de las profes, "solo un ratito". ¿Qué hace {nombre_personaje}?',
  opciones: [
    {
      id: 'A',
      puntos: 0,
      texto: 'Dice que no y se queda donde hay más niños y adultos.',
      feedback:
        '{nombre_personaje} eligió quedarse en un lugar seguro. Eso es una buena idea.',
    },
    {
      id: 'B',
      puntos: 1,
      texto: 'Duda un momento y mira alrededor, sin decidirse.',
      feedback:
        'Dudar está bien. Si algo se siente raro, {nombre_personaje} puede pedir ayuda a una profe.',
    },
    {
      id: 'C',
      puntos: 2,
      texto: 'Va al lugar apartado porque no quiere quedar mal.',
      feedback:
        'A {nombre_personaje} le puede costar decir que no. Está bien pedir ayuda cuando algo no se siente bien.',
    },
  ],
};

export const DECISION_PARQUE: DecisionPuntuada = {
  id: 'parque',
  escenario: 3,
  titulo: 'Una invitación o mensaje raro',
  narracion:
    '{nombre_personaje} recibe un mensaje o una invitación de alguien que no conoce bien: "Ven sola, no se lo digas a nadie." ¿Qué hace {nombre_personaje}?',
  opciones: [
    {
      id: 'A',
      puntos: 0,
      texto: 'Se lo muestra a una persona adulta de confianza.',
      feedback:
        '{nombre_personaje} hizo bien en contarlo. Los mensajes raros se pueden enseñar a alguien que cuida.',
    },
    {
      id: 'B',
      puntos: 1,
      texto: 'Borra el mensaje y no le dice a nadie.',
      feedback:
        'Borrar puede ayudar un poco. También está bien contárselo a alguien de confianza.',
    },
    {
      id: 'C',
      puntos: 2,
      texto: 'Responde o acepta ir sin contárselo a nadie.',
      feedback:
        'Si un mensaje pide ir sola y en secreto, {nombre_personaje} puede pedirle ayuda a una persona adulta.',
    },
  ],
};

export function reemplazarNombres(
  plantilla: string,
  nombrePersonaje: string,
  nombreMascota?: string | null,
): string {
  let out = plantilla.replaceAll('{nombre_personaje}', nombrePersonaje);
  if (nombreMascota) {
    out = out.replaceAll('{nombre_mascota}', nombreMascota);
  } else {
    out = out.replaceAll('{nombre_mascota}', 'su mascota');
  }
  return out;
}
