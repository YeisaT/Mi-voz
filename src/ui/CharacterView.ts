import { Container, Graphics } from 'pixi.js';
import { PALETTE } from '../config/palette';
import type { Apariencia, TipoMascota } from '../core/state';
import { idleFloat } from '../motion/motion';

/** Cuatro colores de ropa (el peinado cambia la forma, no el color del pelo). */
export const COLORES_APARIENCIA = [
  PALETTE.acento,
  PALETTE.calma,
  PALETTE.rosa,
  PALETTE.verdeSuave,
] as const;

const HAIR = PALETTE.texto;
const SKIN = PALETTE.pielCalido;

/**
 * Personaje por capas, alineado al avatar de Stitch.
 * El contenedor exterior se posiciona en los pies; por dentro flota y parpadea.
 */
export class CharacterView extends Container {
  private readonly float = new Container();
  private readonly body = new Graphics();
  private readonly eyes = new Graphics();
  private readonly pet = new Graphics();

  constructor() {
    super();
    this.float.addChild(this.body);
    this.float.addChild(this.eyes);
    this.float.addChild(this.pet);
    this.addChild(this.float);
    idleFloat(this.float, 5, 2.8);
    this.blinkLoop();
  }

  draw(apariencia: Apariencia, scale = 1): void {
    this.body.clear();
    const outfit = COLORES_APARIENCIA[apariencia.color] ?? COLORES_APARIENCIA[0];
    const pelo = apariencia.peinado;

    this.body.circle(0, -18, 62).fill({ color: PALETTE.amarilloSuave, alpha: 0.45 });
    this.body.circle(0, -18, 48).fill({ color: PALETTE.celeste, alpha: 0.22 });

    this.drawHairBack(pelo);
    this.drawDress(outfit);

    this.body.roundRect(-11, 6, 22, 22, 10).fill({ color: SKIN });
    this.body.circle(-46, -18, 10).fill({ color: SKIN });
    this.body.circle(46, -18, 10).fill({ color: SKIN });
    this.body.circle(0, -22, 38).fill({ color: SKIN });
    this.body.ellipse(-24, -10, 9, 6).fill({ color: PALETTE.rosa, alpha: 0.5 });
    this.body.ellipse(24, -10, 9, 6).fill({ color: PALETTE.rosa, alpha: 0.5 });
    this.body
      .moveTo(-10, 0)
      .quadraticCurveTo(0, 10, 10, 0)
      .stroke({ color: HAIR, width: 4, cap: 'round' });

    this.drawHairFront(pelo);
    this.drawEyes();
    this.scale.set(scale);
  }

  /** Cabello detrás de la cara: copete, melena hasta los hombros o coleta. */
  private drawHairBack(pelo: number): void {
    if (pelo === 1) {
      this.body.roundRect(-58, -28, 24, 86, 14).fill({ color: HAIR });
      this.body.roundRect(34, -28, 24, 86, 14).fill({ color: HAIR });
      this.body.ellipse(0, -36, 52, 40).fill({ color: HAIR });
      return;
    }
    this.body.ellipse(0, -36, 50, 38).fill({ color: HAIR });
    if (pelo === 2) {
      this.body.ellipse(58, 6, 16, 40).fill({ color: HAIR });
      this.body.circle(44, -18, 8).fill({ color: PALETTE.rosa });
    }
  }

  /** Flequillo y mechones por encima de la cara, para que no se vea calva. */
  private drawHairFront(pelo: number): void {
    this.body.ellipse(0, -50, 42, 16).fill({ color: HAIR });
    this.body.ellipse(-32, -40, 14, 16).fill({ color: HAIR });
    this.body.ellipse(32, -40, 14, 16).fill({ color: HAIR });
    if (pelo === 0) {
      this.body.circle(-18, -58, 8).fill({ color: HAIR });
      this.body.circle(0, -62, 9).fill({ color: HAIR });
      this.body.circle(18, -58, 8).fill({ color: HAIR });
    } else if (pelo === 1) {
      this.body.roundRect(-52, -8, 16, 62, 10).fill({ color: HAIR });
      this.body.roundRect(36, -8, 16, 62, 10).fill({ color: HAIR });
    } else {
      this.body.ellipse(62, 18, 13, 34).fill({ color: HAIR });
      this.body.circle(48, -16, 7).fill({ color: PALETTE.rosa });
      this.body.circle(40, -10, 5).fill({ color: PALETTE.cta });
    }
  }

  private drawDress(outfit: number): void {
    this.body
      .moveTo(-54, 96)
      .bezierCurveTo(-36, 36, -18, 24, 0, 24)
      .bezierCurveTo(18, 24, 36, 36, 54, 96)
      .closePath()
      .fill({ color: outfit });
    this.body
      .moveTo(-14, 28)
      .quadraticCurveTo(0, 42, 14, 28)
      .stroke({ color: PALETTE.fondo, width: 4, cap: 'round' });
    this.body.roundRect(-46, 30, 22, 16, 8).fill({ color: outfit });
    this.body.roundRect(24, 30, 22, 16, 8).fill({ color: outfit });
    this.body
      .moveTo(-40, 40)
      .bezierCurveTo(-56, 54, -54, 74, -42, 82)
      .stroke({ color: SKIN, width: 12, cap: 'round' });
    this.body
      .moveTo(40, 40)
      .bezierCurveTo(56, 54, 54, 74, 42, 82)
      .stroke({ color: SKIN, width: 12, cap: 'round' });
  }

  drawPet(tipo: TipoMascota, scale = 0.55): void {
    this.pet.clear();
    if (!tipo) {
      this.pet.visible = false;
      return;
    }
    this.pet.visible = true;
    this.pet.position.set(104, 62);
    paintPet(this.pet, tipo, 0, 0, scale);
  }

  private drawEyes(): void {
    this.eyes.clear();
    this.eyes.circle(-22, 0, 6.5).fill({ color: HAIR });
    this.eyes.circle(22, 0, 6.5).fill({ color: HAIR });
    this.eyes.circle(-20, -2, 2).fill({ color: 0xffffff });
    this.eyes.circle(24, -2, 2).fill({ color: 0xffffff });
    this.eyes.position.set(0, -32);
    this.eyes.pivot.set(0, 0);
  }

  private blinkLoop(): void {
    const wait = 1800 + Math.random() * 2200;
    window.setTimeout(() => {
      if (this.destroyed) return;
      const start = performance.now();
      const tick = (now: number) => {
        if (this.destroyed || this.eyes.destroyed) return;
        const t = Math.min(1, (now - start) / 140);
        const blink = t < 0.5 ? 1 - t * 1.7 : (t - 0.5) * 2;
        this.eyes.scale.y = Math.max(0.12, blink);
        if (t < 1) requestAnimationFrame(tick);
        else {
          this.eyes.scale.y = 1;
          this.blinkLoop();
        }
      };
      requestAnimationFrame(tick);
    }, wait);
  }
}

export function paintPet(
  g: Graphics,
  tipo: Exclude<TipoMascota, null> | 'ninguna',
  x: number,
  y: number,
  scale = 1,
): void {
  g.scale.set(scale);
  const ox = x / scale;
  const oy = y / scale;
  if (tipo === 'ninguna') {
    g.star(ox, oy, 5, 16, 7).fill({ color: PALETTE.acento });
    return;
  }
  if (tipo === 'perro') {
    g.circle(ox, oy, 28).fill({ color: PALETTE.amarilloSuave, alpha: 0.45 });
    g.ellipse(ox - 18, oy - 4, 7, 14).fill({ color: PALETTE.acento });
    g.ellipse(ox + 18, oy - 4, 7, 14).fill({ color: PALETTE.acento });
    g.circle(ox, oy, 16).fill({ color: SKIN });
    g.circle(ox - 6, oy - 3, 2.4).fill({ color: HAIR });
    g.circle(ox + 6, oy - 3, 2.4).fill({ color: HAIR });
    g.ellipse(ox, oy + 4, 3.5, 2.4).fill({ color: HAIR });
    return;
  }
  if (tipo === 'gato') {
    g.circle(ox, oy, 26).fill({ color: PALETTE.lila, alpha: 0.4 });
    g.poly([ox - 16, oy - 6, ox - 12, oy - 24, ox - 2, oy - 12]).fill({ color: PALETTE.rosa });
    g.poly([ox + 16, oy - 6, ox + 12, oy - 24, ox + 2, oy - 12]).fill({ color: PALETTE.rosa });
    g.circle(ox, oy, 15).fill({ color: PALETTE.superficie }).stroke({ color: PALETTE.rosa, width: 3 });
    g.circle(ox - 5, oy - 2, 2.2).fill({ color: HAIR });
    g.circle(ox + 5, oy - 2, 2.2).fill({ color: HAIR });
    g.poly([ox - 3, oy + 4, ox + 3, oy + 4, ox, oy + 8]).fill({ color: PALETTE.rosa });
    return;
  }
  if (tipo === 'conejo') {
    g.circle(ox, oy + 4, 26).fill({ color: PALETTE.verdeSuave, alpha: 0.35 });
    g.ellipse(ox - 8, oy - 22, 5, 14).fill({ color: 0xffffff }).stroke({ color: PALETTE.acento, width: 2 });
    g.ellipse(ox + 8, oy - 22, 5, 14).fill({ color: 0xffffff }).stroke({ color: PALETTE.acento, width: 2 });
    g.circle(ox, oy + 2, 15).fill({ color: 0xffffff }).stroke({ color: PALETTE.acento, width: 2 });
    g.circle(ox - 5, oy, 2.2).fill({ color: HAIR });
    g.circle(ox + 5, oy, 2.2).fill({ color: HAIR });
    g.circle(ox, oy + 6, 2.2).fill({ color: PALETTE.rosa });
    return;
  }
  if (tipo === 'pajaro') {
    g.circle(ox, oy, 26).fill({ color: PALETTE.celeste, alpha: 0.4 });
    g.circle(ox, oy + 2, 15).fill({ color: PALETTE.calma });
    g.ellipse(ox - 6, oy + 8, 9, 7).fill({ color: PALETTE.celeste });
    g.circle(ox + 4, oy - 2, 2.4).fill({ color: HAIR });
    g.poly([ox + 12, oy - 2, ox + 22, oy + 2, ox + 12, oy + 6]).fill({ color: PALETTE.cta });
    return;
  }
  g.circle(ox, oy, 26).fill({ color: PALETTE.celeste, alpha: 0.45 });
  g.poly([ox - 22, oy - 10, ox - 8, oy, ox - 22, oy + 10]).fill({ color: PALETTE.cta });
  g.ellipse(ox + 4, oy, 16, 11).fill({ color: PALETTE.cta });
  g.circle(ox + 10, oy - 3, 2.2).fill({ color: HAIR });
}
