import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { FONT_BODY, FONT_DISPLAY } from './fonts';
import { TEXTO_AYUDA } from '../config/ayuda';
import { Button } from './Button';
import { springTo } from '../motion/motion';

export class HelpButton extends Container {
  constructor(onTap: () => void) {
    super();
    const bg = new Graphics();
    bg.circle(0, 3, 24).fill({ color: PALETTE.texto, alpha: 0.1 });
    bg.circle(0, 0, 24).fill({ color: PALETTE.calma });
    this.addChild(bg);

    const label = new Text({
      text: '?',
      style: new TextStyle({
        fontFamily: FONT_DISPLAY,
        fontSize: 28,
        fill: 0x002021,
      }),
    });
    label.anchor.set(0.5);
    this.addChild(label);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => this.scale.set(0.94));
    this.on('pointerup', () => this.scale.set(1));
    this.on('pointerupoutside', () => this.scale.set(1));
    this.on('pointertap', onTap);
  }
}

export class HelpOverlay extends Container {
  constructor(screenW: number, screenH: number, onClose: () => void) {
    super();
    const dim = new Graphics();
    dim.rect(0, 0, screenW, screenH).fill({ color: PALETTE.texto, alpha: 0.28 });
    dim.eventMode = 'static';
    dim.on('pointertap', onClose);
    this.addChild(dim);

    const panelW = Math.min(440, screenW - 24);
    const title = new Text({
      text: TEXTO_AYUDA.titulo,
      style: new TextStyle({
        fontFamily: FONT_DISPLAY,
        fontSize: 30,
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: panelW - 40,
      }),
    });

    const body = new Text({
      text: TEXTO_AYUDA.cuerpo,
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: 18,
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: panelW - 40,
        lineHeight: 26,
      }),
    });

    const panelH = Math.min(screenH * 0.62, title.height + body.height + 130);
    const panel = new Graphics();
    panel
      .roundRect(0, 0, panelW, panelH + 40, 28)
      .fill({ color: PALETTE.fondo });

    const sheet = new Container();
    sheet.addChild(panel);
    title.position.set(20, 22);
    sheet.addChild(title);
    body.position.set(20, 22 + title.height + 12);
    sheet.addChild(body);

    const close = new Button({
      label: TEXTO_AYUDA.botonCerrar,
      width: panelW - 40,
      height: 56,
      variant: 'cta',
      onTap: onClose,
    });
    close.position.set(20, panelH - 76);
    sheet.addChild(close);

    sheet.position.set((screenW - panelW) / 2, screenH);
    this.addChild(sheet);
    void springTo(
      () => sheet.y,
      (v) => {
        if (sheet.destroyed || sheet.position == null) return;
        sheet.y = v;
      },
      screenH - panelH,
      220,
      24,
    );
  }
}
