import { Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';

export type OptionCardOptions = {
  label: string;
  width?: number;
  height?: number;
  multi?: boolean;
  selected?: boolean;
  accent?: number;
  fontSize?: number;
  onToggle: (selected: boolean) => void;
};

export class OptionCard extends Container {
  private readonly bg: Graphics;
  private readonly caption: Text;
  readonly boxW: number;
  readonly boxH: number;
  private readonly accent: number;
  private readonly multi: boolean;
  private selected: boolean;

  constructor(opts: OptionCardOptions) {
    super();
    this.boxW = opts.width ?? 280;
    const fontSize = opts.fontSize ?? 20;
    this.accent = opts.accent ?? PALETTE.celeste;
    this.multi = opts.multi ?? false;
    this.selected = opts.selected ?? false;

    this.bg = new Graphics();
    this.addChild(this.bg);

    this.caption = new Text({
      text: opts.label,
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize,
        fill: PALETTE.texto,
        fontWeight: '600',
        wordWrap: true,
        wordWrapWidth: this.boxW - 28,
        align: 'center',
        lineHeight: fontSize + 6,
      }),
    });
    this.caption.anchor.set(0.5);

    const textH = this.caption.height;
    this.boxH = Math.max(opts.height ?? 52, Math.ceil(textH + 24));
    this.caption.position.set(this.boxW / 2, this.boxH / 2);
    this.addChild(this.caption);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(0, 0, this.boxW, this.boxH);

    this.on('pointertap', () => {
      if (this.multi) {
        this.setSelected(!this.selected);
      } else {
        this.setSelected(true);
      }
      opts.onToggle(this.selected);
    });

    this.redraw();
  }

  isSelected(): boolean {
    return this.selected;
  }

  setSelected(value: boolean): void {
    this.selected = value;
    this.redraw();
  }

  private redraw(): void {
    this.bg.clear();
    const fill = this.selected ? this.accent : 0xffffff;
    this.bg
      .roundRect(0, 0, this.boxW, this.boxH, 14)
      .fill({ color: fill, alpha: this.selected ? 1 : 0.96 })
      .stroke({
        color: this.selected ? PALETTE.texto : PALETTE.acento,
        width: this.selected ? 3 : 2,
      });
  }
}
