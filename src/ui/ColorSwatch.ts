import { Container, Graphics, Rectangle } from 'pixi.js';
import { PALETTE } from '../config/palette';

/** Selector de color circular (apariencia), sin etiquetas. */
export class ColorSwatch extends Container {
  private readonly bg: Graphics;
  private readonly ring: Graphics;
  private selected = false;
  readonly size: number;

  constructor(color: number, size: number, onTap: () => void) {
    super();
    this.size = size;
    this.bg = new Graphics();
    this.ring = new Graphics();
    this.addChild(this.bg);
    this.addChild(this.ring);

    this.bg.circle(size / 2, size / 2, size / 2 - 6).fill({ color });
    this.redraw();

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(0, 0, size, size);
    this.on('pointertap', onTap);
  }

  setSelected(value: boolean): void {
    this.selected = value;
    this.redraw();
  }

  private redraw(): void {
    this.ring.clear();
    if (this.selected) {
      this.ring
        .circle(this.size / 2, this.size / 2, this.size / 2 - 2)
        .stroke({ color: PALETTE.texto, width: 4 });
    }
  }
}
