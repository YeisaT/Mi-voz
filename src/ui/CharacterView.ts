import { Container, Graphics } from 'pixi.js';
import { PALETTE } from '../config/palette';
import type { Apariencia, TipoMascota } from '../core/state';

/** Colores de piel/ropa (sin etiquetas de raza ni cuerpo). */
export const COLORES_APARIENCIA = [
  PALETTE.pielCalido,
  0xe8b896,
  0xc68642,
  PALETTE.rosa,
] as const;

const HAIR = [PALETTE.texto, PALETTE.acento, PALETTE.azul] as const;

/**
 * Avatar vectorial simple del personaje y mascota opcional.
 */
export class CharacterView extends Container {
  private readonly body = new Graphics();
  private readonly pet = new Graphics();

  constructor() {
    super();
    this.addChild(this.body);
    this.addChild(this.pet);
  }

  draw(apariencia: Apariencia, scale = 1): void {
    this.body.clear();
    const skin = COLORES_APARIENCIA[apariencia.color] ?? PALETTE.pielCalido;
    const hair = HAIR[apariencia.peinado] ?? HAIR[0];

    // Cabeza
    this.body.circle(0, -40, 28).fill({ color: skin });

    // Peinado (3 variantes visuales)
    if (apariencia.peinado === 0) {
      this.body.ellipse(0, -58, 30, 16).fill({ color: hair });
    } else if (apariencia.peinado === 1) {
      this.body.circle(-18, -48, 12).fill({ color: hair });
      this.body.circle(18, -48, 12).fill({ color: hair });
      this.body.ellipse(0, -60, 26, 12).fill({ color: hair });
    } else {
      this.body.moveTo(-30, -45);
      this.body.bezierCurveTo(-20, -80, 20, -80, 30, -45);
      this.body.fill({ color: hair });
    }

    // Cuerpo / ropa
    this.body.roundRect(-22, -10, 44, 55, 14).fill({ color: PALETTE.celeste });
    this.body.roundRect(-22, 20, 44, 28, 10).fill({ color: PALETTE.lila });

    // Piernas
    this.body.roundRect(-16, 45, 12, 22, 6).fill({ color: PALETTE.azul });
    this.body.roundRect(4, 45, 12, 22, 6).fill({ color: PALETTE.azul });

    this.scale.set(scale);
  }

  drawPet(tipo: TipoMascota, scale = 0.7): void {
    this.pet.clear();
    if (!tipo) {
      this.pet.visible = false;
      return;
    }
    this.pet.visible = true;
    this.pet.position.set(55, 30);

    const color =
      tipo === 'gato'
        ? PALETTE.amarilloSuave
        : tipo === 'conejo'
          ? 0xffffff
          : tipo === 'pajaro'
            ? PALETTE.celeste
            : tipo === 'pez'
              ? PALETTE.azul
              : PALETTE.pielCalido;

    if (tipo === 'pez') {
      this.pet.ellipse(0, 0, 18, 10).fill({ color });
      this.pet.moveTo(16, 0);
      this.pet.lineTo(28, -8);
      this.pet.lineTo(28, 8);
      this.pet.fill({ color });
    } else if (tipo === 'pajaro') {
      this.pet.circle(0, 0, 12).fill({ color });
      this.pet.ellipse(-10, 4, 10, 5).fill({ color: PALETTE.amarilloSuave });
      this.pet.moveTo(8, -2);
      this.pet.lineTo(18, 0);
      this.pet.lineTo(8, 2);
      this.pet.fill({ color: PALETTE.cta });
    } else {
      // perro / gato / conejo
      this.pet.ellipse(0, 8, 18, 14).fill({ color });
      this.pet.circle(0, -8, 12).fill({ color });
      if (tipo === 'conejo') {
        this.pet.ellipse(-6, -28, 5, 14).fill({ color });
        this.pet.ellipse(6, -28, 5, 14).fill({ color });
      } else if (tipo === 'gato') {
        this.pet.moveTo(-10, -14);
        this.pet.lineTo(-4, -24);
        this.pet.lineTo(0, -14);
        this.pet.fill({ color });
        this.pet.moveTo(10, -14);
        this.pet.lineTo(4, -24);
        this.pet.lineTo(0, -14);
        this.pet.fill({ color });
      } else {
        this.pet.ellipse(-10, -16, 6, 4).fill({ color });
        this.pet.ellipse(10, -16, 6, 4).fill({ color });
      }
    }

    this.pet.scale.set(scale);
  }
}
