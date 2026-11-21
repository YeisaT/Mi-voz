import type { SceneManager } from '../core/SceneManager';
import { getState } from '../core/state';
import { BaseScene } from './BaseScene';
import { CharacterView } from '../ui/CharacterView';
import { DialogBox } from '../ui/DialogBox';
import { centerX } from '../ui/layout';

export class FinalScene extends BaseScene {
  private readonly avatar = new CharacterView();
  private readonly dialog = new DialogBox();

  constructor(sm: SceneManager) {
    super(sm);
    this.content.addChild(this.avatar);
    this.content.addChild(this.dialog);
  }

  onEnter(): void {
    const s = getState();
    this.setTitle('Fin de la aventura');

    const petLine =
      s.tieneMascota && s.nombreMascota
        ? ` ${s.nombreMascota} también está contenta de acompañarte.`
        : '';

    this.dialog.setText(
      `${s.nombrePersonaje} terminó su día.${petLine} Gracias por ayudar a decidir. Si algo se siente raro o triste, pedir ayuda está bien. El botón "?" siempre está ahí.`,
      this.m.bodySize,
    );

    this.footer.setActions(this.m, [
      {
        label: 'Jugar otra vez',
        variant: 'cta',
        width: Math.min(240, this.m.cardW),
        onTap: () => {
          void this.sm.goTo('creacion');
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
        label: 'Jugar otra vez',
        variant: 'cta',
        width: Math.min(240, m.cardW),
        onTap: () => {
          void this.sm.goTo('creacion');
        },
      },
    ]);
  }
}
