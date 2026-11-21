import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { SceneManager } from '../core/SceneManager';
import {
  getPuntaje,
  getState,
  interpretacionPuntaje,
  resetSesionJuego,
  type DecisionRegistro,
} from '../core/state';
import { BaseScene } from './BaseScene';
import { CodeInput } from '../ui/CodeInput';
import { ScrollArea } from '../ui/ScrollArea';
import { PALETTE } from '../config/palette';
import { FONT_BODY } from '../ui/fonts';

/**
 * Informe profesional de sesión (psicóloga).
 * Visual sobrio: KPIs, filas etiqueta/valor y decisiones con chip de opción.
 */
export class DashboardScene extends BaseScene {
  private unlocked = false;
  private readonly scroll = new ScrollArea();
  private readonly gate = new Container();
  private codeInput: CodeInput | null = null;
  private built = false;
  private lastCardW = 0;
  private errorText: Text | null = null;
  private readonly sessionStamp = new Date();

  constructor(sm: SceneManager) {
    super(sm);
    this.content.addChild(this.gate);
    this.content.addChild(this.scroll);
    this.helpBtn.visible = false;
    this.title.style.fontFamily = FONT_BODY;
    this.title.style.fontSize = 22;
  }

  onEnter(): void {
    this.unlocked = false;
    this.built = false;
    this.helpBtn.visible = false;
    this.title.style.fontFamily = FONT_BODY;
    this.setTitle('Acceso profesional');
    this.renderGate();
    this.layout();
  }

  onLeave(): void {
    this.codeInput?.showDom(false);
    this.helpBtn.visible = true;
    super.onLeave();
  }

  protected layout(): void {
    const m = this.m;
    this.helpBtn.visible = false;
    this.title.style.fontFamily = FONT_BODY;
    this.title.style.fontSize = m.isPhone ? 20 : 22;
    this.title.style.wordWrapWidth = m.columnW;

    if (!this.unlocked) {
      this.scroll.visible = false;
      this.gate.visible = true;
      this.gate.position.set(0, m.contentTop);
      this.codeInput?.syncDomPosition();
      this.footer.setActions(m, [
        {
          label: 'Volver',
          variant: 'suave',
          width: Math.min(150, m.cardW * 0.38),
          onTap: () => {
            this.codeInput?.showDom(false);
            void this.sm.goTo('final');
          },
        },
        {
          label: 'Desbloquear',
          variant: 'calma',
          width: Math.min(190, m.cardW * 0.5),
          onTap: () => this.tryUnlock(),
        },
      ]);
      return;
    }

    this.gate.visible = false;
    this.scroll.visible = true;
    this.scroll.position.set(0, m.contentTop);
    this.scroll.setViewport(m.w, m.contentH);
    if (!this.built || this.lastCardW !== m.cardW) {
      this.renderDashboard();
      this.lastCardW = m.cardW;
    }

    this.footer.setActions(m, [
      {
        label: 'Cerrar informe',
        variant: 'suave',
        width: Math.min(160, m.cardW * 0.42),
        onTap: () => {
          void this.sm.goTo('final');
        },
      },
      {
        label: 'Nueva sesión',
        variant: 'calma',
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
    const cardH = 248;
    const card = new Graphics();
    card
      .roundRect(m.columnX, 0, m.cardW, cardH, 12)
      .fill({ color: PALETTE.blanco })
      .stroke({ color: PALETTE.borde, width: 1 });
    card.rect(m.columnX, 0, 5, cardH).fill({ color: PALETTE.calma });
    this.gate.addChild(card);

    const kicker = this.labelText('CONFIDENCIAL · USO PROFESIONAL', PALETTE.calma);
    kicker.position.set(m.columnX + 20, 18);
    this.gate.addChild(kicker);

    const title = this.bodyText(
      'Informe de sesión',
      24,
      PALETTE.texto,
      m.cardW - 40,
      true,
    );
    title.position.set(m.columnX + 20, 42);
    this.gate.addChild(title);

    const tip = this.bodyText(
      'Ingrese el código de acceso de la sesión para visualizar el resumen clínico. Esta vista no está pensada para la niña.',
      15,
      PALETTE.textoSuave,
      m.cardW - 40,
    );
    tip.position.set(m.columnX + 20, 78);
    this.gate.addChild(tip);

    const fieldLabel = this.labelText('CÓDIGO DE ACCESO', PALETTE.textoSuave);
    fieldLabel.position.set(m.columnX + 20, 130);
    this.gate.addChild(fieldLabel);

    this.codeInput = new CodeInput(
      Math.min(300, m.cardW - 40),
      'Ej. SOFI-101',
      () => {
        if (this.errorText) this.errorText.visible = false;
      },
    );
    this.codeInput.position.set(m.columnX + 20, 152);
    this.gate.addChild(this.codeInput);
    this.codeInput.mount();
    this.codeInput.showDom(true);

    this.errorText = this.bodyText('Código incorrecto.', 14, PALETTE.rosa, m.cardW - 40);
    this.errorText.position.set(m.columnX + 20, 214);
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
    this.setTitle('Informe de sesión');
    this.renderDashboard();
    this.layout();
  }

  private renderDashboard(): void {
    this.scroll.clearInner();
    const inner = this.scroll.inner;
    const s = getState();
    const casa = s.respuestasCasa;
    const total = getPuntaje();
    const interp = interpretacionPuntaje(total);
    const accent =
      interp.colorHint === 'calma'
        ? PALETTE.calma
        : interp.colorHint === 'amarillo'
          ? PALETTE.cta
          : PALETTE.rosa;

    let y = 4;

    // Header meta
    y = this.addMetaHeader(inner, y, [
      `Código ${s.codigo_acceso}`,
      this.formatStamp(this.sessionStamp),
      'Solo memoria de sesión · sin datos personales reales',
    ]);

    // KPI strip
    y = this.addKpiStrip(inner, y, total, interp.etiqueta, accent, interp.detalle);

    // Session identity
    y = this.addSection(inner, y, 'Identidad del personaje (cuento)', [
      ['Personaje', s.nombrePersonaje || '—'],
      [
        'Mascota',
        s.tieneMascota ? `${s.tipoMascota} · ${s.nombreMascota}` : 'No eligió',
      ],
    ], PALETTE.acento);

    y = this.addSection(inner, y, '1. Casa · Familia', [
      ['Personas en casa', casa.familiaPersonas.join(', ') || '—'],
      ['Dinámica familiar', casa.familiaDinamica || '—'],
    ], PALETTE.celeste);

    y = this.addSection(inner, y, '2. Casa · Confianza', [
      ['Figuras de confianza', casa.confianza.join(', ') || '—'],
    ], PALETTE.lila);

    y = this.addSection(inner, y, '3. Casa · Miedo', [
      ['Persona temida', casa.miedoPersona || '—'],
      ['Motivo referido', casa.miedoMotivo || '—'],
    ], PALETTE.rosa);

    y = this.addSection(inner, y, '4. Casa · Bienestar nocturno', [
      ['Qué le pasa de noche', casa.bienestar || '—'],
    ], PALETTE.calma);

    y = this.addDecisions(inner, y, s.decisiones);

    y = this.addNote(
      inner,
      y,
      'Orientación profesional: este informe no constituye diagnóstico. Use las respuestas como guía para conversar con calma, validar emociones y reforzar redes de apoyo.',
    );

    void y;
    this.built = true;
  }

  private addMetaHeader(parent: Container, y: number, lines: string[]): number {
    const m = this.m;
    const block = new Container();
    let iy = 0;
    for (const line of lines) {
      const t = this.bodyText(line, 13, PALETTE.textoSuave, m.cardW);
      t.position.set(0, iy);
      block.addChild(t);
      iy += t.height + 4;
    }
    block.position.set(m.columnX, y);
    parent.addChild(block);
    return y + iy + 10;
  }

  private addKpiStrip(
    parent: Container,
    y: number,
    total: number,
    nivel: string,
    accent: number,
    detalle: string,
  ): number {
    const m = this.m;
    const block = new Container();
    const pad = 16;
    const max = 6;

    const title = this.labelText('INDICADOR INTERNO DE ATENCIÓN', PALETTE.textoSuave);
    title.position.set(pad, pad);

    const score = this.bodyText(`${total} / ${max}`, 28, PALETTE.texto, m.cardW - pad * 2, true);
    score.position.set(pad, pad + 22);

    const badge = this.makeBadge(nivel, accent);
    badge.position.set(pad + score.width + 12, pad + 28);

    const barW = m.cardW - pad * 2;
    const barY = pad + 64;
    const track = new Graphics();
    track.roundRect(pad, barY, barW, 10, 5).fill({ color: PALETTE.borde });
    const fillW = Math.max(8, (total / max) * barW);
    const fill = new Graphics();
    fill.roundRect(pad, barY, fillW, 10, 5).fill({ color: accent });

    const detail = this.bodyText(detalle, 14, PALETTE.textoSuave, m.cardW - pad * 2);
    detail.position.set(pad, barY + 20);

    const h = detail.y + detail.height + pad;
    const bg = new Graphics();
    bg.roundRect(0, 0, m.cardW, h, 12)
      .fill({ color: PALETTE.blanco })
      .stroke({ color: PALETTE.borde, width: 1 });
    bg.rect(0, 0, 5, h).fill({ color: accent });

    block.addChild(bg);
    block.addChild(title);
    block.addChild(score);
    block.addChild(badge);
    block.addChild(track);
    block.addChild(fill);
    block.addChild(detail);
    block.position.set(m.columnX, y);
    parent.addChild(block);
    return y + h + 14;
  }

  private addSection(
    parent: Container,
    y: number,
    title: string,
    rows: [string, string][],
    accent: number,
  ): number {
    const m = this.m;
    const block = new Container();
    const pad = 16;
    let iy = pad;

    const head = this.bodyText(title, 16, PALETTE.texto, m.cardW - pad * 2, true);
    head.position.set(pad, iy);
    iy += head.height + 12;

    const rowNodes: Container[] = [];
    for (const [label, value] of rows) {
      const row = this.makeRow(label, value, m.cardW - pad * 2);
      row.position.set(pad, iy);
      rowNodes.push(row);
      iy += row.height + 10;
    }
    iy += pad - 4;

    const bg = new Graphics();
    bg.roundRect(0, 0, m.cardW, iy, 12)
      .fill({ color: PALETTE.blanco })
      .stroke({ color: PALETTE.borde, width: 1 });
    bg.rect(0, 0, 5, iy).fill({ color: accent });

    block.addChild(bg);
    block.addChild(head);
    rowNodes.forEach((r) => block.addChild(r));
    block.position.set(m.columnX, y);
    parent.addChild(block);
    return y + iy + 12;
  }

  private addDecisions(parent: Container, y: number, decisiones: readonly DecisionRegistro[]): number {
    const m = this.m;
    const block = new Container();
    const pad = 16;
    let iy = pad;

    const head = this.bodyText('5. Decisiones puntuadas', 16, PALETTE.texto, m.cardW - pad * 2, true);
    head.position.set(pad, iy);
    iy += head.height + 12;

    const children: Container[] = [];
    if (decisiones.length === 0) {
      const empty = this.bodyText('Sin decisiones registradas.', 14, PALETTE.textoSuave, m.cardW - pad * 2);
      empty.position.set(pad, iy);
      children.push(empty);
      iy += empty.height + pad;
    } else {
      for (const d of decisiones) {
        const card = this.makeDecisionCard(d, m.cardW - pad * 2);
        card.position.set(pad, iy);
        children.push(card);
        iy += card.height + 10;
      }
      iy += pad - 4;
    }

    const bg = new Graphics();
    bg.roundRect(0, 0, m.cardW, iy, 12)
      .fill({ color: PALETTE.blanco })
      .stroke({ color: PALETTE.borde, width: 1 });
    bg.rect(0, 0, 5, iy).fill({ color: PALETTE.cta });

    block.addChild(bg);
    block.addChild(head);
    children.forEach((c) => block.addChild(c));
    block.position.set(m.columnX, y);
    parent.addChild(block);
    return y + iy + 12;
  }

  private makeDecisionCard(d: DecisionRegistro, width: number): Container {
    const c = new Container();
    const pad = 12;
    const chipColor =
      d.puntos === 0 ? PALETTE.calma : d.puntos === 1 ? PALETTE.cta : PALETTE.rosa;

    const title = this.bodyText(
      `${d.escenario}. ${d.titulo}`,
      14,
      PALETTE.texto,
      width - 100,
      true,
    );
    title.position.set(pad, pad);

    const chip = this.makeBadge(`Opción ${d.opcion} · ${d.puntos}/2`, chipColor);
    chip.position.set(width - chip.width - pad, pad);

    const body = this.bodyText(d.textoOpcion, 14, PALETTE.textoSuave, width - pad * 2);
    body.position.set(pad, pad + Math.max(title.height, 24) + 8);

    const h = body.y + body.height + pad;
    const bg = new Graphics();
    bg.roundRect(0, 0, width, h, 10)
      .fill({ color: PALETTE.superficie })
      .stroke({ color: PALETTE.borde, width: 1 });

    c.addChild(bg);
    c.addChild(title);
    c.addChild(chip);
    c.addChild(body);
    return c;
  }

  private makeRow(label: string, value: string, width: number): Container {
    const row = new Container();
    const lab = this.labelText(label.toUpperCase(), PALETTE.textoSuave);
    lab.position.set(0, 0);
    const val = this.bodyText(value, 15, PALETTE.texto, width);
    val.position.set(0, lab.height + 2);
    const line = new Graphics();
    line.rect(0, val.y + val.height + 8, width, 1).fill({ color: PALETTE.borde, alpha: 0.9 });
    row.addChild(lab);
    row.addChild(val);
    row.addChild(line);
    return row;
  }

  private makeBadge(text: string, color: number): Container {
    const c = new Container();
    const label = this.bodyText(text, 12, PALETTE.texto, 220, true);
    const w = Math.ceil(label.width + 16);
    const h = Math.ceil(label.height + 10);
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 8).fill({ color, alpha: 0.85 });
    label.position.set(8, 5);
    c.addChild(bg);
    c.addChild(label);
    return c;
  }

  private addNote(parent: Container, y: number, text: string): number {
    const m = this.m;
    const block = new Container();
    const pad = 14;
    const body = this.bodyText(text, 13, PALETTE.textoSuave, m.cardW - pad * 2);
    body.position.set(pad, pad);
    const h = body.height + pad * 2;
    const bg = new Graphics();
    bg.roundRect(0, 0, m.cardW, h, 10)
      .fill({ color: PALETTE.superficieAlta })
      .stroke({ color: PALETTE.borde, width: 1 });
    block.addChild(bg);
    block.addChild(body);
    block.position.set(m.columnX, y);
    parent.addChild(block);
    return y + h + 20;
  }

  private labelText(value: string, color: number): Text {
    return new Text({
      text: value,
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: 11,
        fill: color,
        letterSpacing: 0.6,
      }),
    });
  }

  private bodyText(
    value: string,
    size: number,
    color: number,
    wrap: number,
    bold = false,
  ): Text {
    return new Text({
      text: value,
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: size,
        fill: color,
        fontWeight: bold ? '700' : '400',
        wordWrap: true,
        wordWrapWidth: wrap,
        lineHeight: size + 6,
      }),
    });
  }

  private formatStamp(d: Date): string {
    try {
      return new Intl.DateTimeFormat('es-VE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  }

  destroy(): void {
    this.codeInput?.showDom(false);
    super.destroy();
  }
}
