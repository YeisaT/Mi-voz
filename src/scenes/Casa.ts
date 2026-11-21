import type { SceneManager } from '../core/SceneManager';
import { addPuntaje, getState } from '../core/state';
import { enviarDecision, enviarPreguntas } from '../core/api';
import {
  DECISION_PUERTA,
  reemplazarNombres,
  type OpcionDecision,
} from '../config/decisiones';
import { PALETTE } from '../config/palette';
import { BaseScene } from './BaseScene';
import { CharacterView } from '../ui/CharacterView';
import { DialogBox } from '../ui/DialogBox';
import { Feedback } from '../ui/Feedback';
import { OptionCard } from '../ui/OptionCard';
import { ScrollArea } from '../ui/ScrollArea';
import { SceneCard } from '../ui/SceneCard';

type Bloque = 'familia' | 'confianza' | 'miedo' | 'bienestar' | 'puerta' | 'feedback';

const PERSONAS_CASA = ['papá', 'mamá', 'abuela', 'primos', 'tíos'] as const;
const DINAMICAS = [
  'Se llevan bien',
  'A veces discuten',
  'Hay mucho silencio',
  'Se ríen mucho',
  'Prefiero no decirlo',
] as const;
const CONFIANZA = ['mamá', 'papá', 'abuela', 'profe', 'amiga', 'nadie'] as const;
const MIEDO_PERSONAS = [
  'nadie',
  'alguien de la casa',
  'alguien del colegio',
  'alguien que no vive conmigo',
  'prefiero no decirlo',
] as const;
const MIEDO_MOTIVOS = [
  'Grita o se enoja mucho',
  'Dice cosas que duelen',
  'Hace cosas que no me gustan',
  'No sé explicarlo',
  'Prefiero no decirlo',
] as const;
const BIENESTAR = [
  'Sueña cosas raras',
  'Le cuesta dormir',
  'Se siente triste',
  'Se siente tranquila',
  'Nada',
  'Prefiero no decirlo',
] as const;

export class CasaScene extends BaseScene {
  private bloque: Bloque = 'familia';
  private readonly scroll = new ScrollArea();
  private readonly stage = new SceneCard('casa');
  private readonly avatar = new CharacterView();
  private readonly dialog = new DialogBox();
  private fadeAlpha = 1;
  private built = false;

  private familiaPersonas = new Set<string>();
  private familiaDinamica: string | null = null;
  private confianza = new Set<string>();
  private miedoPersona: string | null = null;
  private miedoMotivo: string | null = null;
  private bienestar: string | null = null;
  private chosen: OpcionDecision | null = null;
  private feedbackExtra = '';

  constructor(sm: SceneManager) {
    super(sm);
    this.content.addChild(this.stage);
    this.content.addChild(this.avatar);
    this.content.addChild(this.dialog);
    this.content.addChild(this.scroll);
  }

  onEnter(): void {
    const s = getState();
    this.setTitle(`Casa de ${s.nombrePersonaje}`);
    this.avatar.draw(s.apariencia, 0.8);
    if (s.tieneMascota) this.avatar.drawPet(s.tipoMascota, 0.55);
    this.built = false;
    void this.showBloque('familia');
  }

  protected layout(): void {
    const m = this.m;
    const sh = m.isPhone ? 120 : 146;
    this.stage.resize(m.cardW, sh);
    this.stage.position.set(m.columnX, m.contentTop);
    const s = getState();
    const scale = m.isPhone ? 0.4 : 0.48;
    this.avatar.draw(s.apariencia, scale);
    if (s.tieneMascota) this.avatar.drawPet(s.tipoMascota, 0.4);
    this.avatar.position.set(m.columnX + m.cardW * 0.36, m.contentTop + sh * 0.8);

    const dw = m.cardW;
    this.dialog.resize(dw, undefined, m.bodySize);
    this.dialog.position.set(m.columnX, m.contentTop + sh + 10);

    if (!this.built) this.renderBloque();
    else this.applyFooter();

    const scrollTop =
      this.bloque === 'feedback'
        ? m.contentTop + sh + 8
        : this.dialog.y + this.dialog.boxHeight + 10;
    const scrollH = Math.max(100, m.contentBottom - scrollTop);
    this.scroll.position.set(0, scrollTop);
    this.scroll.setViewport(m.w, scrollH);
  }

  private async showBloque(next: Bloque): Promise<void> {
    await this.fade(0);
    this.bloque = next;
    this.built = false;
    this.dialog.visible = next !== 'feedback';
    this.renderBloque();
    this.layout();
    await this.fade(1);
  }

  private fade(target: number): Promise<void> {
    return new Promise((resolve) => {
      const start = this.fadeAlpha;
      const delta = target - start;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / 200);
        this.fadeAlpha = start + delta * t;
        this.scroll.alpha = this.fadeAlpha;
        this.dialog.alpha = this.fadeAlpha;
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  private renderBloque(): void {
    this.scroll.clearInner();
    this.stage.setKind(this.bloque === 'puerta' || this.bloque === 'feedback' ? 'puerta' : 'casa');
    const n = getState().nombrePersonaje;
    if (this.bloque === 'familia') this.renderFamilia(n);
    else if (this.bloque === 'confianza') this.renderConfianza(n);
    else if (this.bloque === 'miedo') this.renderMiedo(n);
    else if (this.bloque === 'bienestar') this.renderBienestar(n);
    else if (this.bloque === 'puerta') this.renderPuerta(n);
    else this.renderFeedback();
    this.applyFooter();
    this.built = true;
  }

  private applyFooter(): void {
    const m = this.m;
    if (this.bloque === 'puerta' || this.bloque === 'feedback') {
      this.clearFooter();
      return;
    }

    const canContinue =
      this.bloque === 'familia'
        ? this.familiaPersonas.size > 0 && !!this.familiaDinamica
        : this.bloque === 'confianza'
          ? this.confianza.size > 0
          : this.bloque === 'miedo'
            ? !!this.miedoPersona &&
              (this.miedoPersona === 'nadie' ||
                this.miedoPersona === 'prefiero no decirlo' ||
                !!this.miedoMotivo)
            : !!this.bienestar;

    this.footer.setActions(m, [
      {
        label: 'Continuar',
        variant: 'cta',
        width: Math.min(220, m.cardW),
        enabled: canContinue,
        onTap: () => void this.onContinue(),
      },
    ]);
  }

  private async onContinue(): Promise<void> {
    const codigo = getState().codigo_acceso;
    if (this.bloque === 'familia') {
      void enviarPreguntas({
        codigo_acceso: codigo,
        escena: 'casa',
        bloque: 'familia',
        payload: {
          personas: [...this.familiaPersonas],
          dinamica: this.familiaDinamica,
        },
      });
      await this.showBloque('confianza');
      return;
    }
    if (this.bloque === 'confianza') {
      void enviarPreguntas({
        codigo_acceso: codigo,
        escena: 'casa',
        bloque: 'confianza',
        payload: { personas: [...this.confianza] },
      });
      await this.showBloque('miedo');
      return;
    }
    if (this.bloque === 'miedo') {
      void enviarPreguntas({
        codigo_acceso: codigo,
        escena: 'casa',
        bloque: 'miedo',
        payload: { persona: this.miedoPersona, motivo: this.miedoMotivo },
      });
      await this.showBloque('bienestar');
      return;
    }
    if (this.bloque === 'bienestar') {
      void enviarPreguntas({
        codigo_acceso: codigo,
        escena: 'casa',
        bloque: 'bienestar',
        payload: { noche: this.bienestar },
      });
      await this.showBloque('puerta');
    }
  }

  private placeGrid(
    labels: readonly string[],
    selected: (label: string) => boolean,
    accent: number,
    multi: boolean,
    onToggle: (label: string, sel: boolean, cards: OptionCard[]) => void,
  ): number {
    const m = this.m;
    const inner = this.scroll.inner;
    const cols = m.columnW < 380 ? 2 : 3;
    const gap = 8;
    const cardW = (m.columnW - (cols - 1) * gap) / cols;
    const startX = m.columnX;
    const cards: OptionCard[] = [];
    let y = 6;

    labels.forEach((label, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const card = new OptionCard({
        label,
        width: cardW,
        height: 50,
        multi,
        accent,
        selected: selected(label),
        fontSize: 18,
        onToggle: (sel) => {
          onToggle(label, sel, cards);
          this.applyFooter();
        },
      });
      card.position.set(startX + col * (cardW + gap), y + row * (card.boxH + gap));
      inner.addChild(card);
      cards.push(card);
    });
    const rowH = (cards[0]?.boxH ?? 50) + gap;
    return y + Math.ceil(labels.length / cols) * rowH + 8;
  }

  private placeList(
    labels: readonly string[],
    y0: number,
    selected: string | null,
    accent: number,
    onPick: (label: string, cards: OptionCard[]) => void,
  ): number {
    const m = this.m;
    const inner = this.scroll.inner;
    const cardW = m.cardW;
    const cards: OptionCard[] = [];
    let y = y0;

    labels.forEach((label, i) => {
      const card = new OptionCard({
        label,
        width: cardW,
        height: 48,
        accent,
        selected: selected === label,
        fontSize: 18,
        align: 'left',
        onToggle: () => {
          onPick(label, cards);
          cards.forEach((c, idx) => c.setSelected(idx === i));
          this.applyFooter();
        },
      });
      card.position.set(m.columnX, y);
      inner.addChild(card);
      cards.push(card);
      y += card.boxH + 8;
    });
    return y;
  }

  private renderFamilia(n: string): void {
    this.dialog.setText(
      `¿Quiénes están en la casa de ${n}? Elige personas y luego qué pasa entre ellas.`,
      this.m.bodySize,
    );

    const y0 = this.placeGrid(
      PERSONAS_CASA,
      (p) => this.familiaPersonas.has(p),
      PALETTE.celeste,
      true,
      (p, sel) => {
        if (sel) this.familiaPersonas.add(p);
        else this.familiaPersonas.delete(p);
      },
    );

    const m = this.m;
    const inner = this.scroll.inner;
    const label = this.makeText('¿Qué pasa entre ellas?', 20, m.maxTextW);
    label.anchor.set(0, 0);
    label.position.set(m.columnX, y0);
    inner.addChild(label);

    this.placeList(
      DINAMICAS,
      y0 + label.height + 8,
      this.familiaDinamica,
      PALETTE.amarilloSuave,
      (d) => {
        this.familiaDinamica = d;
      },
    );
  }

  private renderConfianza(n: string): void {
    this.dialog.setText(
      `¿A quién le cuenta ${n} sus cosas? Elige todas las que quieras.`,
      this.m.bodySize,
    );

    this.placeGrid(
      CONFIANZA,
      (p) => this.confianza.has(p),
      PALETTE.lila,
      true,
      (p, sel, cards) => {
        if (p === 'nadie') {
          if (sel) {
            this.confianza.clear();
            this.confianza.add('nadie');
            cards.forEach((c, idx) => c.setSelected(CONFIANZA[idx] === 'nadie'));
          } else {
            this.confianza.delete('nadie');
          }
        } else {
          this.confianza.delete('nadie');
          cards.forEach((c, idx) => {
            if (CONFIANZA[idx] === 'nadie') c.setSelected(false);
          });
          if (sel) this.confianza.add(p);
          else this.confianza.delete(p);
        }
      },
    );
  }

  private renderMiedo(n: string): void {
    this.dialog.setText(`¿Hay alguien a quien ${n} le tenga miedo?`, this.m.bodySize);
    const m = this.m;
    let y = this.placeList(
      MIEDO_PERSONAS,
      6,
      this.miedoPersona,
      PALETTE.rosa,
      (p) => {
        this.miedoPersona = p;
        if (p === 'nadie' || p === 'prefiero no decirlo') {
          this.miedoMotivo = p === 'nadie' ? 'ninguno' : 'prefiero no decirlo';
        }
      },
    );

    const label = this.makeText('Si hay alguien, ¿por qué motivo?', 20, m.maxTextW);
    label.anchor.set(0.5, 0);
    label.position.set(m.w / 2, y);
    this.scroll.inner.addChild(label);
    y += label.height + 8;

    this.placeList(
      MIEDO_MOTIVOS,
      y,
      this.miedoMotivo,
      PALETTE.amarilloSuave,
      (motivo) => {
        this.miedoMotivo = motivo;
      },
    );
  }

  private renderBienestar(n: string): void {
    this.dialog.setText(
      `A veces a ${n} le pasa algo en la noche. ¿Qué le pasa?`,
      this.m.bodySize,
    );
    this.placeList(
      BIENESTAR,
      6,
      this.bienestar,
      PALETTE.calma,
      (b) => {
        this.bienestar = b;
      },
    );
  }

  private renderPuerta(n: string): void {
    const s = getState();
    this.stage.setKind('puerta');
    this.setTitle(DECISION_PUERTA.titulo);
    this.dialog.setText(
      reemplazarNombres(DECISION_PUERTA.narracion, n, s.nombreMascota),
      this.m.bodySize,
    );

    const m = this.m;
    const accents = [PALETTE.verdeSuave, PALETTE.amarilloSuave, PALETTE.rosa];
    let y = 6;
    DECISION_PUERTA.opciones.forEach((op, i) => {
      const card = new OptionCard({
        label: reemplazarNombres(op.texto, n, s.nombreMascota),
        width: m.cardW,
        height: 70,
        accent: accents[i] ?? PALETTE.celeste,
        fontSize: 18,
        align: 'left',
        onToggle: () => void this.elegirDecision(op),
      });
      card.position.set(m.columnX, y);
      this.scroll.inner.addChild(card);
      y += card.boxH + 10;
    });
  }

  private async elegirDecision(op: OpcionDecision): Promise<void> {
    this.chosen = op;
    addPuntaje(op.puntos);
    const res = await enviarDecision({
      codigo_acceso: getState().codigo_acceso,
      escenario: 1,
      opcion: op.id,
      puntos: op.puntos,
    });
    this.feedbackExtra = res.feedback_extra ?? '';
    await this.showBloque('feedback');
  }

  private renderFeedback(): void {
    const s = getState();
    if (!this.chosen) return;
    const msg = reemplazarNombres(
      this.chosen.feedback,
      s.nombrePersonaje,
      s.nombreMascota,
    );
    const panelW = Math.min(520, this.m.cardW);
    const fb = new Feedback({
      message: msg,
      extra: this.feedbackExtra || undefined,
      width: panelW,
      onContinue: () => {
        void this.sm.goTo('colegio');
      },
    });
    fb.position.set(this.m.columnX, 12);
    this.scroll.inner.addChild(fb);
  }
}
