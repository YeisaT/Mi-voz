import type { SceneManager } from '../core/SceneManager';
import { getState } from '../core/state';
import { BaseScene } from './BaseScene';
import { CharacterView } from '../ui/CharacterView';
import { DialogBox } from '../ui/DialogBox';

export class IntroScene extends BaseScene {
  private readonly avatar = new CharacterView();
  private readonly dialog = new DialogBox();

  constructor(sm: SceneManager) {
    super(sm);
    this.content.addChild(this.avatar);
    this.content.addChild(this.dialog);
  }

  onEnter(): void {
    const s = getState();
    this.setTitle(`Conoce a ${s.nombrePersonaje}`);

    const petLine =
      s.tieneMascota && s.nombreMascota
        ? ` A su lado está ${s.nombreMascota}.`
        : '';

    this.dialog.setText(
      `Hola, yo soy ${s.nombrePersonaje}.${petLine} Hoy vamos a vivir algunas historias juntas. Tú decides qué hago.`,
      this.m.bodySize,
    );

    this.footer.setActions(this.m, [
      {
        label: 'Empezar en casa',
        variant: 'cta',
        width: this.m.cardW,
        onTap: () => {
          void this.sm.goTo('casa');
        },
      },
    ]);
    this.layout();
  }

  protected layout(): void {
    const m = this.m;
    const scale = m.isPhone ? 0.95 : 1.15;
    this.avatar.position.set(m.columnX + m.columnW / 2, m.contentTop + (m.isPhone ? 78 : 96));
    this.avatar.draw(getState().apariencia, scale);
    if (getState().tieneMascota) this.avatar.drawPet(getState().tipoMascota, 0.5);

    const dw = m.cardW;
    this.dialog.resize(dw, undefined, m.bodySize);
    this.dialog.position.set(m.columnX, m.contentTop + (m.isPhone ? 168 : 200));

    this.footer.setActions(m, [
      {
        label: 'Empezar en casa',
        variant: 'cta',
        width: m.cardW,
        onTap: () => {
          void this.sm.goTo('casa');
        },
      },
    ]);
  }
}
