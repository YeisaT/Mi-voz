import { Container, Graphics } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { Button, type ButtonVariant } from './Button';
import { centerX, type LayoutMetrics } from './layout';

type FooterAction = {
  label: string;
  variant?: ButtonVariant;
  width?: number;
  enabled?: boolean;
  onTap: () => void;
};

/**
 * Barra inferior fija: el CTA siempre visible y tocable.
 */
export class FooterBar extends Container {
  private readonly bg = new Graphics();
  private readonly actions = new Container();
  private buttons: Button[] = [];

  constructor() {
    super();
    this.addChild(this.bg);
    this.addChild(this.actions);
  }

  setActions(m: LayoutMetrics, items: FooterAction[]): void {
    this.actions.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.buttons = [];

    this.bg.clear();
    this.bg.rect(0, 0, m.w, m.footerH).fill({ color: PALETTE.fondo, alpha: 0.97 });
    this.bg.rect(0, 0, m.w, 2).fill({ color: PALETTE.acento, alpha: 0.35 });

    const btnH = m.isPhone ? 48 : 52;
    const gap = 10;
    const widths = items.map((it) => it.width ?? (items.length === 1 ? Math.min(240, m.cardW) : 140));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
    let x = centerX(m.w, total);
    const y = (m.footerH - btnH) / 2;

    items.forEach((it, i) => {
      const btn = new Button({
        label: it.label,
        width: widths[i],
        height: btnH,
        fontSize: m.isPhone ? 18 : 20,
        variant: it.variant ?? 'cta',
        onTap: it.onTap,
      });
      btn.setEnabled(it.enabled ?? true);
      btn.position.set(x, y);
      this.actions.addChild(btn);
      this.buttons.push(btn);
      x += widths[i]! + gap;
    });
  }

  setEnabled(index: number, value: boolean): void {
    this.buttons[index]?.setEnabled(value);
  }
}
