import { Container, Graphics, Rectangle } from 'pixi.js';

/**
 * Scroll vertical con el dedo y con la rueda.
 * La altura se mide hijo por hijo: la máscara no debe recortar esa medida,
 * si no el contenido nunca baja.
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
  onMove: (() => void) | null = null;

  private readonly onNativeWheel = (event: WheelEvent): void => {
    if (this.destroyed || !this.parent) return;
    event.preventDefault();
    this.content.y = this.clamp(this.content.y - event.deltaY);
    this.onMove?.();
  };

  constructor() {
    super();
    this.viewport.addChild(this.content);
    this.viewport.addChild(this.maskG);
    this.addChild(this.viewport);

    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, 300, 200);

    this.on('pointerdown', (event) => {
      this.dragging = true;
      this.moved = false;
      this.dragY = event.global.y;
      this.startContentY = this.content.y;
    });
    this.on('pointerup', () => {
      this.dragging = false;
    });
    this.on('pointerupoutside', () => {
      this.dragging = false;
    });
    this.on('pointermove', (event) => {
      if (!this.dragging) return;
      const dy = event.global.y - this.dragY;
      if (Math.abs(dy) > 6) this.moved = true;
      this.content.y = this.clamp(this.startContentY + dy);
      this.onMove?.();
    });
    this.on('wheel', (event) => {
      const dy = 'deltaY' in event ? Number(event.deltaY) : 0;
      this.content.y = this.clamp(this.content.y - dy);
      this.onMove?.();
    });

    window.addEventListener('wheel', this.onNativeWheel, { passive: false });
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
    if (!this.content.mask && this.parent) this.content.mask = this.maskG;
    this.content.y = this.clamp(this.content.y);
  }

  resetScroll(): void {
    this.content.y = 0;
  }

  clearInner(): void {
    this.content.removeChildren().forEach((child) => child.destroy({ children: true }));
    this.resetScroll();
  }

  override destroy(options?: Parameters<Container['destroy']>[0]): void {
    window.removeEventListener('wheel', this.onNativeWheel);
    this.content.mask = null;
    super.destroy(options);
  }

  private contentSpan(): number {
    let bottom = 0;
    for (const child of this.content.children) {
      if (!child.visible) continue;
      const bounds = child.getLocalBounds();
      bottom = Math.max(bottom, child.y + bounds.y + bounds.height);
    }
    return bottom + 28;
  }

  private clamp(y: number): number {
    const maxScroll = Math.min(0, this.viewH - this.contentSpan());
    return Math.max(maxScroll, Math.min(0, y));
  }
}
