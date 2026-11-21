import type { SceneManager } from '../core/SceneManager';
import { getState } from '../core/state';
import { BaseScene } from './BaseScene';
import { CharacterView } from '../ui/CharacterView';
import { DialogBox } from '../ui/DialogBox';
import { centerX } from '../ui/layout';

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
        width: Math.min(240, this.m.cardW),
        onTap: () => {
          void this.sm.goTo('casa');
        },
      },
    ]);
    this.layout();
  }

  protected layout(): void {
    const m = this.m;
    const scale = m.isPhone ? 1.05 : 1.3;
    this.avatar.position.set(m.w * 0.5, m.contentTop + (m.isPhone ? 70 : 90));
    this.avatar.draw(getState().apariencia, scale);
    if (getState().tieneMascota) this.avatar.drawPet(getState().tipoMascota);

    const dw = m.maxTextW;
    this.dialog.resize(dw, undefined, m.bodySize);
    this.dialog.position.set(
      centerX(m.w, dw),
      m.contentTop + (m.isPhone ? 140 : 180),
    );

    this.footer.setActions(m, [
      {
        label: 'Empezar en casa',
        variant: 'cta',
        width: Math.min(240, m.cardW),
        onTap: () => {
          void this.sm.goTo('casa');
        },
      },
    ]);
  }
}
