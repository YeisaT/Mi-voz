import { Application, Container, Graphics } from 'pixi.js';
import { PALETTE } from '../config/palette';

export interface Scene {
  readonly view: Container;
  onEnter?(): void;
  onLeave?(): void;
  onResize?(width: number, height: number): void;
  destroy(): void;
}

type SceneFactory = () => Scene;

/**
 * Cambio de escenas con fade suave sobre el fondo #FDF7EB.
 */
export class SceneManager {
  private readonly app: Application;
  private readonly root: Container;
  private readonly overlay: Graphics;
  private current: Scene | null = null;
  private transitioning = false;
  private readonly registry = new Map<string, SceneFactory>();

  constructor(app: Application) {
    this.app = app;
    this.root = new Container();
    this.app.stage.addChild(this.root);

    this.overlay = new Graphics();
    this.overlay.eventMode = 'none';
    this.app.stage.addChild(this.overlay);
    this.paintOverlay(0);
  }

  register(name: string, factory: SceneFactory): void {
    this.registry.set(name, factory);
  }

  get width(): number {
    return this.app.screen.width;
  }

  get height(): number {
    return this.app.screen.height;
  }

  get application(): Application {
    return this.app;
  }

  async goTo(name: string, fadeMs = 280): Promise<void> {
    const factory = this.registry.get(name);
    if (!factory) {
      throw new Error(`Escena no registrada: ${name}`);
    }
    if (this.transitioning) return;
    this.transitioning = true;

    try {
      await this.fadeTo(1, fadeMs);
      this.current?.onLeave?.();
      this.current?.destroy();
      this.current = null;
      this.root.removeChildren();

      const next = factory();
      this.current = next;
      this.root.addChild(next.view);
      next.onResize?.(this.width, this.height);
      next.onEnter?.();

      await this.fadeTo(0, fadeMs);
    } finally {
      this.transitioning = false;
    }
  }

  handleResize(): void {
    this.paintOverlay(this.overlay.alpha);
    this.current?.onResize?.(this.width, this.height);
  }

  private paintOverlay(alpha: number): void {
    const w = this.width;
    const h = this.height;
    this.overlay.clear();
    this.overlay.rect(0, 0, w, h).fill({ color: PALETTE.fondo, alpha: 1 });
    this.overlay.alpha = alpha;
  }

  private fadeTo(target: number, ms: number): Promise<void> {
    return new Promise((resolve) => {
      if (ms <= 0) {
        this.overlay.alpha = target;
        this.overlay.eventMode = target > 0.05 ? 'static' : 'none';
        resolve();
        return;
      }

      const start = this.overlay.alpha;
      const delta = target - start;
      const t0 = performance.now();
      this.overlay.eventMode = 'static';

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const eased = t * (2 - t);
        this.overlay.alpha = start + delta * eased;
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          this.overlay.alpha = target;
          this.overlay.eventMode = target > 0.05 ? 'static' : 'none';
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }
}
