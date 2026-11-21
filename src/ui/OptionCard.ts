import { Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { FONT_BODY } from './fonts';

export type OptionCardOptions = {
  label: string;
  width?: number;
  height?: number;
  multi?: boolean;
  selected?: boolean;
  accent?: number;
  fontSize?: number;
  align?: 'left' | 'center';
  onToggle: (selected: boolean) => void;
};

export class OptionCard extends Container {
  private readonly bg: Graphics;
  private readonly caption: Text;
  readonly boxW: number;
  readonly boxH: number;
  private readonly multi: boolean;
  private selected: boolean;

  constructor(opts: OptionCardOptions) {
    super();
    this.boxW = opts.width ?? 280;
    const fontSize = opts.fontSize ?? 18;
    const align = opts.align ?? 'center';
    this.multi = opts.multi ?? false;
    this.selected = opts.selected ?? false;

    this.bg = new Graphics();
    this.addChild(this.bg);

    this.caption = new Text({
      text: opts.label,
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize,
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: this.boxW - (align === 'left' ? 36 : 16),
        align,
        lineHeight: fontSize + 8,
      }),
    });

    const textH = this.caption.height;
    this.boxH = Math.max(opts.height ?? 56, Math.ceil(textH + 28));
    if (align === 'left') {
      this.caption.anchor.set(0, 0.5);
      this.caption.position.set(18, this.boxH / 2);
    } else {
      this.caption.anchor.set(0.5);
      this.caption.position.set(this.boxW / 2, this.boxH / 2);
    }
    this.addChild(this.caption);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(0, 0, this.boxW, this.boxH);
    this.on('pointerdown', () => this.scale.set(0.98));
    this.on('pointerup', () => this.scale.set(1));
    this.on('pointerupoutside', () => this.scale.set(1));
    this.on('pointertap', () => {
      if (this.multi) this.setSelected(!this.selected);
      else this.setSelected(true);
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
    this.bg
      .roundRect(0, 3, this.boxW, this.boxH, 20)
      .fill({ color: PALETTE.texto, alpha: 0.04 });
    this.bg
      .roundRect(0, 0, this.boxW, this.boxH, 20)
      .fill({ color: this.selected ? 0xf6e8fb : 0xffffff })
      .stroke({
        color: this.selected ? PALETTE.acento : PALETTE.borde,
        width: this.selected ? 3 : 2,
      });
  }
}
