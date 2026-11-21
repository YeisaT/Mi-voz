import { Container, Graphics, Rectangle, Text, TextStyle } from 'pixi.js';
import { PALETTE } from '../config/palette';
import { FONT_BODY } from './fonts';
import { paintPet } from './CharacterView';
import type { TipoMascota } from '../core/state';

export class PetCard extends Container {
  private readonly bg = new Graphics();
  private readonly icon = new Graphics();
  readonly boxW: number;
  readonly boxH: number;
  private selected = false;

  constructor(
    tipo: TipoMascota,
    label: string,
    width: number,
    height: number,
    onTap: () => void,
  ) {
    super();
    this.boxW = width;
    this.boxH = height;
    this.addChild(this.bg);
    this.icon.position.set(width / 2, height * 0.38);
    paintPet(this.icon, tipo ?? 'ninguna', 0, 0, 0.85);
    this.addChild(this.icon);

    const caption = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: 18,
        fill: PALETTE.texto,
        align: 'center',
      }),
    });
    caption.anchor.set(0.5, 1);
    caption.position.set(width / 2, height - 12);
    this.addChild(caption);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Rectangle(0, 0, width, height);
    this.on('pointerdown', () => this.scale.set(0.96));
    this.on('pointerup', () => this.scale.set(1));
    this.on('pointerupoutside', () => this.scale.set(1));
    this.on('pointertap', onTap);
    this.redraw();
  }

  setSelected(value: boolean): void {
    this.selected = value;
    this.redraw();
  }

  private redraw(): void {
    this.bg.clear();
    this.bg
      .roundRect(0, 4, this.boxW, this.boxH, 20)
      .fill({ color: PALETTE.texto, alpha: 0.05 });
    this.bg
      .roundRect(0, 0, this.boxW, this.boxH, 20)
      .fill({ color: 0xffffff })
      .stroke({
        color: this.selected ? PALETTE.acento : PALETTE.borde,
        width: this.selected ? 3 : 2,
      });
  }
}
