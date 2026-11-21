import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';

export class DialogBox extends Container {
  private readonly bg: Graphics;
  private readonly text: Text;
  private boxW: number;
  private minH: number;
  private pad = 16;

  constructor(width = 640, minHeight = 88) {
    super();
    this.boxW = width;
    this.minH = minHeight;

    this.bg = new Graphics();
    this.addChild(this.bg);

    this.text = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: 20,
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

  setText(value: string, fontSize = 20): void {
    this.text.style.fontSize = fontSize;
    this.text.style.lineHeight = fontSize + 8;
    this.text.text = value;
    this.redraw();
  }

  resize(width: number, _ignoredHeight?: number, fontSize?: number): void {
    this.boxW = width;
    if (fontSize) {
      this.text.style.fontSize = fontSize;
      this.text.style.lineHeight = fontSize + 8;
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
      .roundRect(0, 0, this.boxW, h, 16)
      .fill({ color: 0xffffff, alpha: 0.95 })
      .stroke({ color: PALETTE.acento, width: 2 });
  }
}
