import { Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';

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
  private readonly bg: Graphics;
  private readonly caption: Text;
  readonly boxW: number;
  readonly boxH: number;
  private readonly fill: number;
  private enabled = true;

  constructor(opts: ButtonOptions) {
    super();
    this.boxW = opts.width ?? 220;
    this.boxH = opts.height ?? 52;
    this.fill = FILL[opts.variant ?? 'cta'];

    this.bg = new Graphics();
    this.drawBg(1);
    this.addChild(this.bg);

    this.caption = new Text({
      text: opts.label,
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: opts.fontSize ?? 20,
        fill: PALETTE.texto,
        fontWeight: '700',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.boxW - 20,
      }),
    });
    this.caption.anchor.set(0.5);
    this.caption.position.set(this.boxW / 2, this.boxH / 2);
    this.addChild(this.caption);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(0, 0, this.boxW, this.boxH);

    this.on('pointertap', () => {
      if (this.enabled) opts.onTap();
    });
    this.on('pointerover', () => {
      if (this.enabled) this.drawBg(0.92);
    });
    this.on('pointerout', () => {
      if (this.enabled) this.drawBg(1);
    });
  }

  setLabel(text: string): void {
    this.caption.text = text;
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    this.alpha = value ? 1 : 0.45;
    this.eventMode = value ? 'static' : 'none';
    this.cursor = value ? 'pointer' : 'default';
  }

  private drawBg(alpha: number): void {
    this.bg.clear();
    this.bg
      .roundRect(0, 0, this.boxW, this.boxH, 14)
      .fill({ color: this.fill, alpha });
  }
}
