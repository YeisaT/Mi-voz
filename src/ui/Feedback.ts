import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { Button } from './Button';

export type FeedbackOptions = {
  message: string;
  extra?: string;
  width?: number;
  onContinue: () => void;
};

export class Feedback extends Container {
  constructor(opts: FeedbackOptions) {
    super();
    const w = opts.width ?? 520;
    const pad = 20;
    const body = opts.extra ? `${opts.message}\n\n${opts.extra}` : opts.message;

    const text = new Text({
      text: body,
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: 20,
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: w - pad * 2,
        lineHeight: 28,
        align: 'center',
      }),
    });
    text.anchor.set(0.5, 0);

    const h = Math.max(170, text.height + 100);
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 18)
      .fill({ color: PALETTE.verdeSuave, alpha: 0.95 })
      .stroke({ color: PALETTE.calma, width: 3 });
    this.addChild(bg);

    text.position.set(w / 2, pad);
    this.addChild(text);

    const btnW = Math.min(200, w - 40);
    const btn = new Button({
      label: 'Continuar',
      width: btnW,
      height: 48,
      variant: 'calma',
      onTap: opts.onContinue,
    });
    btn.position.set((w - btnW) / 2, h - 62);
    this.addChild(btn);
  }
}
