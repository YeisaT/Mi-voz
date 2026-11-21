import { Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { FONT_BODY } from './fonts';

export type ButtonVariant = 'cta' | 'acento' | 'calma' | 'rosa' | 'suave';

const FILL: Record<ButtonVariant, number> = {
  cta: PALETTE.cta,
  acento: PALETTE.acento,
  calma: PALETTE.calma,
  rosa: PALETTE.rosa,
  suave: PALETTE.amarilloSuave,
};

export type ButtonOptions = {
  label: string;
  width?: number;
  height?: number;
  variant?: ButtonVariant;
  fontSize?: number;
  onTap: () => void;
};

export class Button extends Container {
  private readonly face = new Container();
  private readonly bg: Graphics;
  private readonly caption: Text;
  readonly boxW: number;
  readonly boxH: number;
  private readonly fill: number;
  private enabled = true;

  constructor(opts: ButtonOptions) {
    super();
    this.boxW = opts.width ?? 220;
    this.boxH = opts.height ?? 56;
    this.fill = FILL[opts.variant ?? 'cta'];

    this.face.pivot.set(this.boxW / 2, this.boxH / 2);
    this.face.position.set(this.boxW / 2, this.boxH / 2);
    this.addChild(this.face);

    this.bg = new Graphics();
    this.face.addChild(this.bg);

    this.caption = new Text({
      text: opts.label,
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: opts.fontSize ?? 20,
        fill: PALETTE.texto,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.boxW - 24,
      }),
    });
    this.caption.anchor.set(0.5);
    this.caption.position.set(this.boxW / 2, this.boxH / 2);
    this.face.addChild(this.caption);
    this.drawBg();

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(0, 0, this.boxW, this.boxH);

    this.on('pointertap', () => {
      if (this.enabled) opts.onTap();
    });
    this.on('pointerdown', () => {
      if (this.enabled) this.face.scale.set(0.97);
    });
    const release = () => {
      this.face.scale.set(1);
    };
    this.on('pointerup', release);
    this.on('pointerupoutside', release);
  }

  setLabel(text: string): void {
    this.caption.text = text;
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    this.eventMode = value ? 'static' : 'none';
    this.cursor = value ? 'pointer' : 'default';
    this.drawBg();
  }

  private drawBg(): void {
    this.bg.clear();
    const radius = this.boxH / 2;
    if (!this.enabled) {
      this.bg
        .roundRect(0, 0, this.boxW, this.boxH, radius)
        .fill({ color: PALETTE.superficieAlta })
        .stroke({ color: PALETTE.borde, width: 2 });
      this.caption.style.fill = PALETTE.textoSuave;
      return;
    }
    this.caption.style.fill = PALETTE.texto;
    this.bg
      .roundRect(0, 3, this.boxW, this.boxH, radius)
      .fill({ color: PALETTE.texto, alpha: 0.08 });
    this.bg.roundRect(0, 0, this.boxW, this.boxH, radius).fill({ color: this.fill });
  }
}
