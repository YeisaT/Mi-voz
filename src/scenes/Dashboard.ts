import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneManager } from '../core/SceneManager';
import {
  getPuntaje,
  getState,
  interpretacionPuntaje,
  resetSesionJuego,
} from '../core/state';
import { BaseScene } from './BaseScene';
import { CodeInput } from '../ui/CodeInput';
import { ScrollArea } from '../ui/ScrollArea';
import { PALETTE } from '../config/palette';
import { FONT_BODY, FONT_DISPLAY } from '../ui/fonts';

/**
 * Panel solo para la profesional: resumen de respuestas de la sesión.
 */
export class DashboardScene extends BaseScene {
  private unlocked = false;
  private readonly scroll = new ScrollArea();
  private readonly gate = new Container();
  private codeInput: CodeInput | null = null;
  private built = false;
  private errorText: Text | null = null;

  constructor(sm: SceneManager) {
    super(sm);
    this.content.addChild(this.gate);
    this.content.addChild(this.scroll);
  }

  onEnter(): void {
    this.unlocked = false;
    this.built = false;
    this.setTitle('Panel profesional');
    this.renderGate();
    this.layout();
  }

  onLeave(): void {
    this.codeInput?.showDom(false);
    super.onLeave();
  }

  protected layout(): void {
    const m = this.m;
    if (!this.unlocked) {
      this.scroll.visible = false;
      this.gate.visible = true;
      this.gate.position.set(0, m.contentTop);
      this.codeInput?.syncDomPosition();
      this.footer.setActions(m, [
        {
          label: 'Volver',
          variant: 'suave',
          width: Math.min(160, m.cardW * 0.4),
          onTap: () => {
            this.codeInput?.showDom(false);
            void this.sm.goTo('final');
          },
        },
        {
          label: 'Entrar',
          variant: 'cta',
          width: Math.min(180, m.cardW * 0.45),
          onTap: () => this.tryUnlock(),
        },
      ]);
      return;
    }

    this.gate.visible = false;
    this.scroll.visible = true;
    this.scroll.position.set(0, m.contentTop);
    this.scroll.setViewport(m.w, m.contentH);
    if (!this.built) this.renderDashboard();

    this.footer.setActions(m, [
      {
        label: 'Volver al final',
        variant: 'suave',
        width: Math.min(160, m.cardW * 0.42),
        onTap: () => {
          void this.sm.goTo('final');
        },
      },
      {
        label: 'Nueva sesión',
        variant: 'cta',
        width: Math.min(180, m.cardW * 0.48),
        onTap: () => {
          resetSesionJuego();
          void this.sm.goTo('creacion');
        },
      },
    ]);
  }

  private renderGate(): void {
    this.gate.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.codeInput?.showDom(false);
    this.codeInput = null;

    const m = this.m;
    const card = new Graphics();
    card
      .roundRect(m.columnX, 0, m.cardW, 220, 18)
      .fill({ color: PALETTE.superficie })
      .stroke({ color: PALETTE.borde, width: 2 });
    this.gate.addChild(card);

    const title = new Text({
      text: 'Solo para la psicóloga / profesional',
      style: new TextStyle({
        fontFamily: FONT_DISPLAY,
        fontSize: 22,
        fill: PALETTE.texto,
        wordWrap: true,
        wordWrapWidth: m.cardW - 32,
      }),
    });
    title.position.set(m.columnX + 16, 16);
    this.gate.addChild(title);

    const tip = new Text({
      text: 'Escribe el código de acceso de la sesión para ver el resumen de respuestas.',
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: 16,
        fill: PALETTE.textoSuave,
        wordWrap: true,
        wordWrapWidth: m.cardW - 32,
        lineHeight: 22,
      }),
    });
    tip.position.set(m.columnX + 16, 58);
    this.gate.addChild(tip);

    this.codeInput = new CodeInput(
      Math.min(280, m.cardW - 32),
      'Código (ej. SOFI-101)',
      () => {
        if (this.errorText) this.errorText.visible = false;
      },
    );
    this.codeInput.position.set(m.columnX + 16, 120);
    this.gate.addChild(this.codeInput);
    this.codeInput.mount();
    this.codeInput.showDom(true);

    this.errorText = new Text({
      text: 'Código incorrecto. Intenta de nuevo.',
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: 15,
        fill: PALETTE.rosa,
      }),
    });
    this.errorText.position.set(m.columnX + 16, 184);
    this.errorText.visible = false;
    this.gate.addChild(this.errorText);
  }

  private tryUnlock(): void {
    const typed = (this.codeInput?.getValue() || '').trim().toUpperCase();
    const expected = getState().codigo_acceso.trim().toUpperCase();
    if (!typed || typed !== expected) {
      if (this.errorText) this.errorText.visible = true;
      return;
    }
    this.codeInput?.showDom(false);
    this.unlocked = true;
    this.built = false;
    this.setTitle('Resultados de la sesión');
    this.renderDashboard();
    this.layout();
  }

  private renderDashboard(): void {
    this.scroll.clearInner();
    const m = this.m;
    const inner = this.scroll.inner;
    const s = getState();
    const casa = s.respuestasCasa;
    const total = getPuntaje();
    const interp = interpretacionPuntaje(total);
    let y = 4;

    const addSection = (titulo: string, lineas: string[], accent: number): void => {
      const block = new Container();
      const body = lineas.length ? lineas.join('\n') : 'Sin respuesta registrada.';
      const head = new Text({
        text: titulo,
        style: new TextStyle({
          fontFamily: FONT_DISPLAY,
          fontSize: 20,
          fill: PALETTE.texto,
          wordWrap: true,
          wordWrapWidth: m.cardW - 28,
        }),
      });
      const content = new Text({
        text: body,
        style: new TextStyle({
          fontFamily: FONT_BODY,
          fontSize: 16,
          fill: PALETTE.textoSuave,
          wordWrap: true,
          wordWrapWidth: m.cardW - 28,
          lineHeight: 22,
        }),
      });
      const h = head.height + content.height + 28;
      const bg = new Graphics();
      bg.roundRect(0, 0, m.cardW, h, 16)
        .fill({ color: PALETTE.superficie })
        .stroke({ color: accent, width: 2 });
      block.addChild(bg);
      head.position.set(14, 12);
      content.position.set(14, 12 + head.height + 6);
      block.addChild(head);
      block.addChild(content);
      block.position.set(m.columnX, y);
      inner.addChild(block);
      y += h + 12;
    };

    addSection(
      'Datos de sesión',
      [
        `Código: ${s.codigo_acceso}`,
        `Personaje (inventado): ${s.nombrePersonaje || '—'}`,
        s.tieneMascota
          ? `Mascota: ${s.tipoMascota} — ${s.nombreMascota}`
          : 'Mascota: no eligió',
        'Nota: los nombres son del personaje del cuento, no datos personales reales.',
      ],
      PALETTE.acento,
    );

    addSection(
      'Casa · Familia',
      [
        `Personas: ${casa.familiaPersonas.join(', ') || '—'}`,
        `Dinámica: ${casa.familiaDinamica || '—'}`,
      ],
      PALETTE.celeste,
    );

    addSection(
      'Casa · Confianza',
      [`¿A quién le cuenta sus cosas?: ${casa.confianza.join(', ') || '—'}`],
      PALETTE.lila,
    );

    addSection(
      'Casa · Miedo',
      [
        `Persona: ${casa.miedoPersona || '—'}`,
        `Motivo: ${casa.miedoMotivo || '—'}`,
      ],
      PALETTE.rosa,
    );

    addSection(
      'Casa · Bienestar (noche)',
      [`Respuesta: ${casa.bienestar || '—'}`],
      PALETTE.calma,
    );

    const decisionLines =
      s.decisiones.length === 0
        ? ['Sin decisiones registradas.']
        : s.decisiones.map(
            (d) =>
              `${d.escenario}. ${d.titulo}\n   Opción ${d.opcion} (${d.puntos}/2): ${d.textoOpcion}`,
          );

    addSection('Decisiones puntuadas (interno)', decisionLines, PALETTE.cta);

    const accent =
      interp.colorHint === 'calma'
        ? PALETTE.calma
        : interp.colorHint === 'amarillo'
          ? PALETTE.amarilloSuave
          : PALETTE.rosa;

    addSection(
      'Resumen clínico sugerido',
      [
        `Puntaje acumulado interno: ${total} / 6`,
        `Nivel: ${interp.etiqueta}`,
        interp.detalle,
        'Este resumen no diagnostica. Es una guía para la conversación profesional.',
      ],
      accent,
    );

    this.built = true;
  }

  destroy(): void {
    this.codeInput?.showDom(false);
    super.destroy();
  }
}
