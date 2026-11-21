import { Container, Graphics } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { idleFloat } from '../motion/motion';

export type SceneKind = 'casa' | 'puerta' | 'recreo' | 'parque' | 'final';

/** Ilustración de fondo del cuento, dentro de una tarjeta redondeada. */
export class SceneCard extends Container {
  private kind: SceneKind;
  private boxW = 340;
  private boxH = 168;
  private readonly frame = new Graphics();
  private readonly clip = new Graphics();
  private readonly world = new Container();
  private readonly art = new Graphics();
  private readonly drift = new Container();

  constructor(kind: SceneKind) {
    super();
    this.kind = kind;
    this.world.addChild(this.art);
    this.world.addChild(this.drift);
    this.addChild(this.frame);
    this.addChild(this.clip);
    this.addChild(this.world);
    idleFloat(this.drift, 6, 3.4);
  }

  override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.world.mask = null;
    super.destroy(options);
  }

  setKind(kind: SceneKind): void {
    if (this.kind === kind) return;
    this.kind = kind;
    this.paint();
  }

  resize(width: number, height: number): void {
    this.boxW = width;
    this.boxH = height;
    this.paint();
  }

  private paint(): void {
    const w = this.boxW;
    const h = this.boxH;
    this.frame.clear();
    this.frame
      .roundRect(0, 6, w, h, 24)
      .fill({ color: PALETTE.texto, alpha: 0.06 });
    this.frame
      .roundRect(0, 0, w, h, 24)
      .fill({ color: PALETTE.superficie })
      .stroke({ color: PALETTE.borde, width: 2 });

    this.clip.clear();
    this.clip.roundRect(0, 0, w, h, 24).fill({ color: 0xffffff });

    this.world.scale.set(w / 340, h / 210);
    if (!this.world.mask && this.parent) this.world.mask = this.clip;
    this.art.clear();
    this.drift.removeChildren();

    if (this.kind === 'casa') this.paintCasa();
    else if (this.kind === 'puerta') this.paintPuerta();
    else if (this.kind === 'recreo') this.paintRecreo();
    else if (this.kind === 'parque') this.paintParque();
    else this.paintFinal();
  }

  private paintCasa(): void {
    this.art.rect(0, 0, 340, 150).fill({ color: PALETTE.superficie });
    this.art.rect(0, 150, 340, 60).fill({ color: PALETTE.amarilloSuave, alpha: 0.45 });
    this.art
      .roundRect(28, 36, 70, 78, 14)
      .fill({ color: PALETTE.celeste, alpha: 0.75 })
      .stroke({ color: PALETTE.acento, width: 3 });
    this.art.moveTo(63, 36).lineTo(63, 114).stroke({ color: 0xffffff, width: 3 });
    this.art.moveTo(28, 75).lineTo(98, 75).stroke({ color: 0xffffff, width: 3 });
    this.art.roundRect(210, 48, 78, 102, 16).fill({ color: PALETTE.rosa, alpha: 0.35 });
    this.art.circle(248, 92, 10).fill({ color: PALETTE.cta });
  }

  private paintPuerta(): void {
    this.art.rect(0, 0, 340, 150).fill({ color: 0xfffbf3 });
    this.art.rect(0, 150, 340, 60).fill({ color: PALETTE.amarilloSuave, alpha: 0.55 });
    this.art
      .roundRect(26, 26, 66, 82, 14)
      .fill({ color: PALETTE.celeste, alpha: 0.7 })
      .stroke({ color: PALETTE.acento, width: 3 });
    this.art.moveTo(59, 26).lineTo(59, 108).stroke({ color: 0xffffff, width: 3 });
    this.art.moveTo(26, 67).lineTo(92, 67).stroke({ color: 0xffffff, width: 3 });
    this.art.roundRect(210, 28, 84, 122, 14).fill({ color: PALETTE.acento });
    this.art.roundRect(220, 38, 64, 104, 10).fill({ color: PALETTE.lila, alpha: 0.65 });
    this.art.circle(226, 94, 6).fill({ color: PALETTE.cta });
  }

  private paintRecreo(): void {
    this.art.rect(0, 0, 340, 135).fill({ color: PALETTE.celeste, alpha: 0.55 });
    this.art.rect(0, 135, 340, 75).fill({ color: PALETTE.verdeSuave, alpha: 0.75 });
    const sun = new Graphics();
    sun.circle(0, 0, 18).fill({ color: 0xffffff, alpha: 0.8 });
    sun.position.set(290, 36);
    this.drift.addChild(sun);
    this.tree(40, 96);
    this.tree(286, 104);
    this.art.roundRect(150, 150, 16, 18, 6).fill({ color: PALETTE.rosa });
    this.art.circle(158, 142, 8).fill({ color: PALETTE.pielCalido });
    this.art.roundRect(188, 154, 16, 18, 6).fill({ color: PALETTE.azul });
    this.art.circle(196, 146, 8).fill({ color: PALETTE.pielCalido });
  }

  private paintParque(): void {
    this.art.rect(0, 0, 340, 145).fill({ color: PALETTE.celeste, alpha: 0.6 });
    this.art.rect(0, 145, 340, 65).fill({ color: PALETTE.verdeSuave, alpha: 0.75 });
    const cloud = new Graphics();
    cloud.circle(0, 0, 16).fill({ color: 0xffffff, alpha: 0.85 });
    cloud.circle(18, 4, 12).fill({ color: 0xffffff, alpha: 0.85 });
    cloud.position.set(250, 40);
    this.drift.addChild(cloud);
    this.art.roundRect(44, 148, 150, 12, 6).fill({ color: PALETTE.acento });
    this.art.roundRect(52, 166, 8, 22, 4).fill({ color: PALETTE.texto });
    this.art.roundRect(176, 166, 8, 22, 4).fill({ color: PALETTE.texto });
    this.art
      .roundRect(196, 48, 120, 52, 16)
      .fill({ color: 0xffffff })
      .stroke({ color: PALETTE.azul, width: 3 });
  }

  private paintFinal(): void {
    this.art.rect(0, 0, 340, 130).fill({ color: PALETTE.lila, alpha: 0.45 });
    this.art.rect(0, 70, 340, 80).fill({ color: PALETTE.amarilloSuave, alpha: 0.55 });
    const sun = new Graphics();
    sun.circle(0, 0, 28).fill({ color: PALETTE.cta, alpha: 0.9 });
    sun.position.set(170, 118);
    this.drift.addChild(sun);
    this.art
      .moveTo(0, 164)
      .quadraticCurveTo(170, 136, 340, 164)
      .lineTo(340, 210)
      .lineTo(0, 210)
      .fill({ color: PALETTE.verdeSuave, alpha: 0.85 });
  }

  private tree(x: number, y: number): void {
    this.art.roundRect(x, y, 12, 48, 6).fill({ color: PALETTE.acento });
    this.art.circle(x + 6, y - 8, 22).fill({ color: PALETTE.verdeSuave });
    this.art.circle(x - 8, y + 4, 16).fill({ color: PALETTE.calma, alpha: 0.85 });
    this.art.circle(x + 20, y + 2, 16).fill({ color: PALETTE.verdeSuave });
  }
}
