import type { SceneManager } from '../core/SceneManager';
import { getState, resetSesionJuego } from '../core/state';
import { BaseScene } from './BaseScene';
import { CharacterView } from '../ui/CharacterView';
import { DialogBox } from '../ui/DialogBox';
import { SceneCard } from '../ui/SceneCard';

export class FinalScene extends BaseScene {
  private readonly stage = new SceneCard('final');
  private readonly avatar = new CharacterView();
  private readonly dialog = new DialogBox();

  constructor(sm: SceneManager) {
    super(sm);
    this.content.addChild(this.stage);
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
    this.layout();
  }

  protected layout(): void {
    const m = this.m;
    const sh = m.isPhone ? 180 : 210;
    this.stage.resize(m.cardW, sh);
    this.stage.position.set(m.columnX, m.contentTop);
    const scale = m.isPhone ? 0.52 : 0.62;
    this.avatar.draw(getState().apariencia, scale);
    if (getState().tieneMascota) this.avatar.drawPet(getState().tipoMascota, 0.45);
    this.avatar.position.set(m.columnX + m.cardW * 0.4, m.contentTop + sh * 0.78);

    const dw = m.cardW;
    this.dialog.resize(dw, undefined, m.bodySize);
    this.dialog.position.set(m.columnX, m.contentTop + sh + 12);

    this.footer.setActions(m, [
      {
        label: 'Jugar otra vez',
        variant: 'suave',
        width: Math.min(170, m.cardW * 0.42),
        onTap: () => {
          resetSesionJuego();
          void this.sm.goTo('creacion');
        },
      },
      {
        label: 'Resultados',
        variant: 'cta',
        width: Math.min(180, m.cardW * 0.48),
        onTap: () => {
          void this.sm.goTo('dashboard');
        },
      },
    ]);
  }
}
