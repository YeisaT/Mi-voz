import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { FONT_BODY } from './fonts';

export class DialogBox extends Container {
  private readonly bg: Graphics;
  private readonly text: Text;
  private boxW: number;
  private minH: number;
  private pad = 18;

  constructor(width = 400, minHeight = 72) {
    super();
    this.boxW = width;
    this.minH = minHeight;

    this.bg = new Graphics();
    this.addChild(this.bg);

    this.text = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: 19,
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: width - this.pad * 2,
        lineHeight: 28,
      }),
    });
    this.text.position.set(this.pad, this.pad);
    this.addChild(this.text);
    this.redraw();
  }

  setText(value: string, fontSize = 19): void {
    this.text.style.fontSize = fontSize;
    this.text.style.lineHeight = fontSize + 9;
    this.text.text = value;
    this.redraw();
  }

  resize(width: number, _ignoredHeight?: number, fontSize?: number): void {
    this.boxW = width;
    if (fontSize) {
      this.text.style.fontSize = fontSize;
      this.text.style.lineHeight = fontSize + 9;
    }
    this.text.style.wordWrapWidth = width - this.pad * 2;
    this.redraw();
  }

  get boxHeight(): number {
    return Math.max(this.minH, this.text.height + this.pad * 2);
  }

  private redraw(): void {
    const h = this.boxHeight;
    this.bg.clear();
    this.bg
      .roundRect(0, 5, this.boxW, h, 24)
      .fill({ color: PALETTE.texto, alpha: 0.05 });
    this.bg
      .roundRect(0, 0, this.boxW, h, 24)
      .fill({ color: 0xffffff })
      .stroke({ color: PALETTE.borde, width: 2 });
  }
}
