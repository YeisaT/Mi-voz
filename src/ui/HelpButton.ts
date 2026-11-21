import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { TEXTO_AYUDA } from '../config/ayuda';
import { Button } from './Button';

export class HelpButton extends Container {
  constructor(onTap: () => void) {
    super();
    const bg = new Graphics();
    bg.circle(0, 0, 26).fill({ color: PALETTE.rosa });
    this.addChild(bg);

    const label = new Text({
      text: '?',
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: 28,
        fill: PALETTE.texto,
        fontWeight: '800',
      }),
    });
    label.anchor.set(0.5);
    this.addChild(label);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointertap', onTap);
  }
}

export class HelpOverlay extends Container {
  constructor(screenW: number, screenH: number, onClose: () => void) {
    super();
    const dim = new Graphics();
    dim.rect(0, 0, screenW, screenH).fill({ color: 0x3a0a45, alpha: 0.35 });
    dim.eventMode = 'static';
    this.addChild(dim);

    const panelW = Math.min(520, screenW - 32);
    const title = new Text({
      text: TEXTO_AYUDA.titulo,
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: 28,
        fill: PALETTE.texto,
        fontWeight: '800',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: panelW - 40,
      }),
    });
    title.anchor.set(0.5, 0);

    const body = new Text({
      text: TEXTO_AYUDA.cuerpo,
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: 20,
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: panelW - 40,
        lineHeight: 28,
        align: 'left',
      }),
    });

    const panelH = title.height + body.height + 120;
    const panel = new Graphics();
    panel
      .roundRect(0, 0, panelW, panelH, 20)
      .fill({ color: PALETTE.fondo })
      .stroke({ color: PALETTE.lila, width: 3 });

    panel.position.set((screenW - panelW) / 2, Math.max(24, (screenH - panelH) / 2));
    this.addChild(panel);

    title.position.set(panelW / 2, 20);
    panel.addChild(title);

    body.position.set(20, 20 + title.height + 12);
    panel.addChild(body);

    const close = new Button({
      label: TEXTO_AYUDA.botonCerrar,
      width: Math.min(240, panelW - 40),
      variant: 'acento',
      onTap: onClose,
    });
    close.position.set((panelW - close.width) / 2, panelH - 70);
    // Button width is internal; use known width
    close.position.set((panelW - Math.min(240, panelW - 40)) / 2, panelH - 70);
    panel.addChild(close);
  }
}
