import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Scene, SceneManager } from '../core/SceneManager';
import { PALETTE } from '../config/palette';
import { HelpButton, HelpOverlay } from '../ui/HelpButton';
import { getLayout, type LayoutMetrics } from '../ui/layout';
import { FooterBar } from '../ui/FooterBar';

/**
 * Base común: fondo, título, ayuda, footer fijo y layout responsivo.
 */
export abstract class BaseScene implements Scene {
  readonly view = new Container();
  protected readonly content = new Container();
  protected readonly ui = new Container();
  protected readonly bg = new Graphics();
  protected readonly footer = new FooterBar();
  protected title!: Text;
  protected helpBtn!: HelpButton;
  protected helpLayer: HelpOverlay | null = null;
  protected w = 800;
  protected h = 600;
  protected m: LayoutMetrics = getLayout(800, 600);
  protected readonly sm: SceneManager;

  constructor(sm: SceneManager) {
    this.sm = sm;
    this.view.addChild(this.bg);
    this.view.addChild(this.content);
    this.view.addChild(this.ui);
    this.ui.addChild(this.footer);

    this.title = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: 26,
        fill: PALETTE.texto,
        fontWeight: '800',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 700,
      }),
    });
    this.title.anchor.set(0.5, 0);
    this.ui.addChild(this.title);

    this.helpBtn = new HelpButton(() => this.toggleHelp(true));
    this.ui.addChild(this.helpBtn);
  }

  onEnter(): void {
    // override
  }

  onLeave(): void {
    this.toggleHelp(false);
  }

  onResize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this.m = getLayout(width, height);

    this.bg.clear();
    this.bg.rect(0, 0, width, height).fill({ color: PALETTE.fondo });
    this.bg.circle(width * 0.1, height * 0.16, Math.min(70, width * 0.11)).fill({
      color: PALETTE.amarilloSuave,
      alpha: 0.4,
    });
    this.bg.circle(width * 0.9, height * 0.2, Math.min(60, width * 0.09)).fill({
      color: PALETTE.lila,
      alpha: 0.3,
    });
    this.bg.circle(width * 0.82, height * 0.9, Math.min(80, width * 0.12)).fill({
      color: PALETTE.celeste,
      alpha: 0.25,
    });

    this.title.style.fontSize = this.m.titleSize;
    this.title.style.wordWrapWidth = Math.min(700, width - 96);
    this.title.position.set(width / 2, this.m.titleTop);
    this.helpBtn.position.set(width - 36, this.m.titleTop + 22);
    this.footer.position.set(0, this.m.footerY);

    if (this.helpLayer) {
      this.toggleHelp(false);
      this.toggleHelp(true);
    }

    this.layout();
  }

  protected setTitle(text: string): void {
    this.title.text = text;
  }

  protected clearFooter(): void {
    this.footer.setActions(this.m, []);
  }

  protected makeText(
    value: string,
    size = 20,
    wrapWidth?: number,
  ): Text {
    return new Text({
      text: value,
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: Math.max(20, size),
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: wrapWidth ?? this.m.maxTextW,
        lineHeight: Math.max(20, size) + 8,
        align: 'center',
      }),
    });
  }

  protected toggleHelp(show: boolean): void {
    if (this.helpLayer) {
      this.view.removeChild(this.helpLayer);
      this.helpLayer.destroy({ children: true });
      this.helpLayer = null;
    }
    if (show) {
      this.helpLayer = new HelpOverlay(this.w, this.h, () => this.toggleHelp(false));
      this.view.addChild(this.helpLayer);
    }
  }

  protected abstract layout(): void;

  destroy(): void {
    this.toggleHelp(false);
    this.view.destroy({ children: true });
  }
}
