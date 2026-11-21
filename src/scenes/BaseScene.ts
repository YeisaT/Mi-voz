import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Scene, SceneManager } from '../core/SceneManager';
import { PALETTE } from '../config/palette';
import { HelpButton, HelpOverlay } from '../ui/HelpButton';
import { getLayout, type LayoutMetrics } from '../ui/layout';
import { FooterBar } from '../ui/FooterBar';
import { FONT_BODY, FONT_DISPLAY } from '../ui/fonts';
import { riseIn } from '../motion/motion';

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
  private entered = false;

  constructor(sm: SceneManager) {
    this.sm = sm;
    this.view.addChild(this.bg);
    this.view.addChild(this.content);
    this.view.addChild(this.ui);
    this.ui.addChild(this.footer);

    this.title = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: FONT_DISPLAY,
        fontSize: 30,
        fill: PALETTE.texto,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: 320,
      }),
    });
    this.title.anchor.set(0, 0);
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

    this.title.style.fontSize = this.m.titleSize;
    this.title.style.wordWrapWidth = Math.max(120, this.m.columnW - 68);
    this.title.position.set(this.m.columnX, this.m.titleTop);
    this.helpBtn.position.set(this.m.columnX + this.m.columnW - 24, this.m.titleTop + 18);
    this.footer.position.set(0, this.m.footerY);

    if (this.helpLayer) {
      this.toggleHelp(false);
      this.toggleHelp(true);
    }

    this.layout();
    if (!this.entered) {
      this.entered = true;
      riseIn(this.content, 40, 18);
    }
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
        fontFamily: FONT_BODY,
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
