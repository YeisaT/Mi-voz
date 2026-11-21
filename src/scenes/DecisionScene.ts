import type { SceneManager } from '../core/SceneManager';
import { addPuntaje, getState } from '../core/state';
import { enviarDecision } from '../core/api';
import {
  reemplazarNombres,
  type DecisionPuntuada,
  type OpcionDecision,
} from '../config/decisiones';
import { PALETTE } from '../config/palette';
import { BaseScene } from './BaseScene';
import { CharacterView } from '../ui/CharacterView';
import { DialogBox } from '../ui/DialogBox';
import { Feedback } from '../ui/Feedback';
import { OptionCard } from '../ui/OptionCard';
import { ScrollArea } from '../ui/ScrollArea';
import { centerX } from '../ui/layout';

export class DecisionScene extends BaseScene {
  private readonly avatar = new CharacterView();
  private readonly dialog = new DialogBox();
  private readonly scroll = new ScrollArea();
  private readonly decision: DecisionPuntuada;
  private readonly nextScene: string;
  private readonly titleFallback: string;
  private chosen: OpcionDecision | null = null;
  private feedbackExtra = '';
  private phase: 'choose' | 'feedback' = 'choose';
  private built = false;

  constructor(
    sm: SceneManager,
    decision: DecisionPuntuada,
    nextScene: string,
    titleFallback: string,
  ) {
    super(sm);
    this.decision = decision;
    this.nextScene = nextScene;
    this.titleFallback = titleFallback;
    this.content.addChild(this.avatar);
    this.content.addChild(this.dialog);
    this.content.addChild(this.scroll);
  }

  onEnter(): void {
    const s = getState();
    this.setTitle(this.decision.titulo || this.titleFallback);
    this.avatar.draw(s.apariencia, 0.8);
    if (s.tieneMascota) this.avatar.drawPet(s.tipoMascota, 0.55);
    this.phase = 'choose';
    this.built = false;
    this.render();
  }

  protected layout(): void {
    const m = this.m;
    this.avatar.visible = !m.isPhone;
    this.avatar.position.set(m.w * 0.12, m.contentTop + 70);

    const dw = m.maxTextW;
    this.dialog.resize(dw, undefined, m.bodySize);
    this.dialog.position.set(centerX(m.w, dw), m.contentTop);
    this.dialog.visible = this.phase === 'choose';

    this.clearFooter();
    if (!this.built) this.render();

    const scrollTop =
      this.phase === 'choose'
        ? m.contentTop + this.dialog.boxHeight + 10
        : m.contentTop;
    const scrollH = Math.max(100, m.contentBottom - scrollTop);
    this.scroll.position.set(0, scrollTop);
    this.scroll.setViewport(m.w, scrollH);
  }

  private render(): void {
    this.scroll.clearInner();
    const s = getState();
    const n = s.nombrePersonaje;
    const m = this.m;
    const inner = this.scroll.inner;

    if (this.phase === 'feedback' && this.chosen) {
      this.dialog.visible = false;
      const msg = reemplazarNombres(this.chosen.feedback, n, s.nombreMascota);
      const panelW = Math.min(520, m.cardW);
      const fb = new Feedback({
        message: msg,
        extra: this.feedbackExtra || undefined,
        width: panelW,
        onContinue: () => {
          void this.sm.goTo(this.nextScene);
        },
      });
      fb.position.set(centerX(m.w, panelW), 12);
      inner.addChild(fb);
      this.built = true;
      return;
    }

    this.dialog.visible = true;
    this.dialog.setText(
      reemplazarNombres(this.decision.narracion, n, s.nombreMascota),
      m.bodySize,
    );

    const accents = [PALETTE.verdeSuave, PALETTE.amarilloSuave, PALETTE.rosa];
    let y = 6;
    this.decision.opciones.forEach((op, i) => {
      const card = new OptionCard({
        label: reemplazarNombres(op.texto, n, s.nombreMascota),
        width: m.cardW,
        height: 70,
        accent: accents[i] ?? PALETTE.celeste,
        fontSize: 18,
        onToggle: () => void this.pick(op),
      });
      card.position.set(centerX(m.w, m.cardW), y);
      inner.addChild(card);
      y += card.boxH + 10;
    });
    this.built = true;
  }

  private async pick(op: OpcionDecision): Promise<void> {
    this.chosen = op;
    addPuntaje(op.puntos);
    const res = await enviarDecision({
      codigo_acceso: getState().codigo_acceso,
      escenario: this.decision.escenario,
      opcion: op.id,
      puntos: op.puntos,
    });
    this.feedbackExtra = res.feedback_extra ?? '';
    this.phase = 'feedback';
    this.built = false;
    this.render();
    this.layout();
  }
}
