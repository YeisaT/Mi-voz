import { Container, Graphics, Rectangle } from 'pixi.js';

/**
 * Scroll vertical táctil/rueda.
 * El mask vive en el mismo contenedor que el contenido (evita warnings de Pixi).
 */
export class ScrollArea extends Container {
  private readonly viewport = new Container();
  private readonly maskG = new Graphics();
  private readonly content = new Container();
  private viewW = 300;
  private viewH = 200;
  private dragY = 0;
  private dragging = false;
  private startContentY = 0;
  private moved = false;

  constructor() {
    super();
    this.viewport.addChild(this.content);
    this.viewport.addChild(this.maskG);
    this.content.mask = this.maskG;
    this.addChild(this.viewport);

    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, 300, 200);

    this.on('pointerdown', (e) => {
      this.dragging = true;
      this.moved = false;
      this.dragY = e.global.y;
      this.startContentY = this.content.y;
    });
    this.on('pointerup', () => {
      this.dragging = false;
    });
    this.on('pointerupoutside', () => {
      this.dragging = false;
    });
    this.on('pointermove', (e) => {
      if (!this.dragging) return;
      const dy = e.global.y - this.dragY;
      if (Math.abs(dy) > 6) this.moved = true;
      this.content.y = this.clamp(this.startContentY + dy);
    });
    this.on('wheel', (e) => {
      const dy = 'deltaY' in e ? Number(e.deltaY) : 0;
      this.content.y = this.clamp(this.content.y - dy * 0.45);
    });
  }

  get inner(): Container {
    return this.content;
  }

  /** true si el último gesto fue un arrastre (para no confundir con tap). */
  didDrag(): boolean {
    return this.moved;
  }

  setViewport(width: number, height: number): void {
    this.viewW = Math.max(1, width);
    this.viewH = Math.max(1, height);
    this.hitArea = new Rectangle(0, 0, this.viewW, this.viewH);

    this.maskG.clear();
    this.maskG.rect(0, 0, this.viewW, this.viewH).fill({ color: 0xffffff });
    this.content.y = this.clamp(this.content.y);
  }

  resetScroll(): void {
    this.content.y = 0;
  }

  clearInner(): void {
    this.content.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.resetScroll();
  }

  private clamp(y: number): number {
    const contentH = Math.max(this.content.height + 16, this.viewH);
    const maxScroll = Math.min(0, this.viewH - contentH);
    return Math.max(maxScroll, Math.min(0, y));
  }
}
