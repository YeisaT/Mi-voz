import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from './BaseScene';
import type { SceneManager } from '../core/SceneManager';
import {
  setApariencia,
  setNombrePersonaje,
  setMascota,
  clearMascota,
  type ColorAparienciaId,
  type PeinadoId,
  type TipoMascota,
} from '../core/state';
import { NOMBRES_MASCOTA, NOMBRES_PERSONAJE } from '../config/nombres';
import { PALETTE } from '../config/palette';
import { Button } from '../ui/Button';
import { NameInput } from '../ui/NameInput';
import { OptionCard } from '../ui/OptionCard';
import { ColorSwatch } from '../ui/ColorSwatch';
import { CharacterView, COLORES_APARIENCIA } from '../ui/CharacterView';
import { PetCard } from '../ui/PetCard';
import { ScrollArea } from '../ui/ScrollArea';
import { centerX } from '../ui/layout';

type Step = 'apariencia' | 'nombre' | 'mascota' | 'mascotaNombre';

const TIPOS_MASCOTA: { id: Exclude<TipoMascota, null>; label: string }[] = [
  { id: 'perro', label: 'Perro' },
  { id: 'gato', label: 'Gato' },
  { id: 'conejo', label: 'Conejo' },
  { id: 'pajaro', label: 'Pájaro' },
  { id: 'pez', label: 'Pez' },
];

/**
 * Creación del personaje con layout fijo: avatar + scroll + footer.
 */
export class CreacionScene extends BaseScene {
  private step: Step = 'apariencia';
  private peinado: PeinadoId = 0;
  private color: ColorAparienciaId = 0;
  private nombre = '';
  private nombreOk = false;
  private tipoMascota: TipoMascota = null;
  private nombreMascota = '';
  private nombreMascotaOk = false;
  private built = false;

  private readonly frame = new Graphics();
  private readonly avatar = new CharacterView();
  private readonly flow = new Container();
  private readonly scroll = new ScrollArea();
  private nameInput: NameInput | null = null;
  private petNameInput: NameInput | null = null;
  private hintText: Text | null = null;

  constructor(sm: SceneManager) {
    super(sm);
    this.scroll.inner.addChild(this.frame);
    this.scroll.inner.addChild(this.avatar);
    this.scroll.inner.addChild(this.flow);
    this.content.addChild(this.scroll);
    this.scroll.onMove = () => {
      this.nameInput?.syncDomPosition();
      this.petNameInput?.syncDomPosition();
    };
  }

  onEnter(): void {
    this.built = false;
    this.renderStep();
  }

  onLeave(): void {
    this.cleanupInputs();
    super.onLeave();
  }

  protected layout(): void {
    const m = this.m;
    const cardH = m.isPhone ? 168 : 186;
    this.frame.clear();
    this.frame
      .roundRect(m.columnX, 4, m.columnW, cardH, 24)
      .fill({ color: PALETTE.texto, alpha: 0.05 });
    this.frame
      .roundRect(m.columnX, 0, m.columnW, cardH, 24)
      .fill({ color: PALETTE.superficie })
      .stroke({ color: PALETTE.borde, width: 2 });

    const avatarScale = m.isPhone ? 0.62 : 0.7;
    this.avatar.position.set(m.columnX + m.columnW / 2, cardH * 0.58);
    this.avatar.draw({ peinado: this.peinado, color: this.color }, avatarScale);
    if (this.tipoMascota && (this.step === 'mascota' || this.step === 'mascotaNombre')) {
      this.avatar.drawPet(this.tipoMascota, 1.05);
    } else {
      this.avatar.drawPet(null);
    }

    this.flow.position.set(0, cardH + 16);
    const scrollH = Math.max(120, m.contentBottom - m.contentTop);
    this.scroll.position.set(0, m.contentTop);
    this.scroll.setViewport(m.w, scrollH);

    if (!this.built) {
      this.renderStep();
    } else {
      this.nameInput?.syncDomPosition();
      this.petNameInput?.syncDomPosition();
      this.applyFooter();
    }
  }

  private cleanupInputs(): void {
    this.nameInput?.showDom(false);
    this.petNameInput?.showDom(false);
  }

  private renderStep(): void {
    this.cleanupInputs();
    this.flow.removeChildren().forEach((child) => child.destroy({ children: true }));
    this.nameInput = null;
    this.petNameInput = null;
    this.hintText = null;

    if (this.step === 'apariencia') this.renderApariencia();
    else if (this.step === 'nombre') this.renderNombre();
    else if (this.step === 'mascota') this.renderMascota();
    else this.renderMascotaNombre();

    this.applyFooter();
    this.built = true;
  }

  private go(step: Step): void {
    this.built = false;
    this.step = step;
    this.renderStep();
    this.layout();
  }

  private applyFooter(): void {
    const m = this.m;
    if (this.step === 'apariencia') {
      this.footer.setActions(m, [
        {
          label: 'Siguiente',
          variant: 'cta',
          width: m.cardW,
          onTap: () => {
            setApariencia({ peinado: this.peinado, color: this.color });
            this.go('nombre');
          },
        },
      ]);
      return;
    }

    if (this.step === 'nombre') {
      this.footer.setActions(m, [
        {
          label: 'Atrás',
          variant: 'suave',
          width: 120,
          onTap: () => this.go('apariencia'),
        },
        {
          label: 'Siguiente',
          variant: 'cta',
          width: Math.min(180, m.cardW - 140),
          enabled: this.nombreOk,
          onTap: () => {
            if (!this.nombreOk) return;
            setNombrePersonaje(this.nombre);
            this.go('mascota');
          },
        },
      ]);
      return;
    }

    if (this.step === 'mascota') {
      this.footer.setActions(m, [
        {
          label: 'Atrás',
          variant: 'suave',
          width: 100,
          onTap: () => this.go('nombre'),
        },
        {
          label: 'Ahora no',
          variant: 'acento',
          width: 120,
          onTap: () => {
            clearMascota();
            this.tipoMascota = null;
            void this.sm.goTo('intro');
          },
        },
        {
          label: 'Seguir',
          variant: 'cta',
          width: 120,
          enabled: !!this.tipoMascota,
          onTap: () => {
            if (!this.tipoMascota) return;
            this.go('mascotaNombre');
          },
        },
      ]);
      return;
    }

    this.footer.setActions(m, [
      {
        label: 'Atrás',
        variant: 'suave',
        width: 120,
        onTap: () => this.go('mascota'),
      },
      {
        label: 'Listo',
        variant: 'cta',
        width: Math.min(180, m.cardW - 140),
        enabled: this.nombreMascotaOk,
        onTap: () => {
          if (!this.nombreMascotaOk || !this.tipoMascota) return;
          setMascota(this.tipoMascota, this.nombreMascota);
          void this.sm.goTo('intro');
        },
      },
    ]);
  }

  private renderApariencia(): void {
    this.setTitle('¿Cómo es tu personaje?');
    const inner = this.flow;
    const m = this.m;
    let y = 4;

    const tip = this.makeText('Peinado', 18, m.columnW);
    tip.anchor.set(0, 0);
    tip.style.fill = PALETTE.textoSuave;
    tip.position.set(m.columnX, y);
    inner.addChild(tip);
    y += tip.height + 8;

    const peinadoLabels = ['Corto', 'Melena', 'Coleta'];
    const cardW = (m.columnW - 16) / 3;
    const startX = m.columnX;
    const peinadoCards: OptionCard[] = [];

    peinadoLabels.forEach((label, i) => {
      const card = new OptionCard({
        label,
        width: cardW,
        height: 50,
        accent: PALETTE.lila,
        selected: this.peinado === i,
        fontSize: 18,
        onToggle: () => {
          this.peinado = i as PeinadoId;
          peinadoCards.forEach((c, idx) => c.setSelected(idx === i));
          this.avatar.draw(
            { peinado: this.peinado, color: this.color },
            m.isPhone ? 0.85 : 1.05,
          );
        },
      });
      card.position.set(startX + i * (cardW + 8), y);
      inner.addChild(card);
      peinadoCards.push(card);
    });
    y += 70;

    const ropa = this.makeText('Color de ropa', 18, m.columnW);
    ropa.anchor.set(0, 0);
    ropa.style.fill = PALETTE.textoSuave;
    ropa.position.set(m.columnX, y);
    inner.addChild(ropa);
    y += ropa.height + 10;

    const swatchSize = 56;
    const gap = 12;
    const total = COLORES_APARIENCIA.length * swatchSize + (COLORES_APARIENCIA.length - 1) * gap;
    let x = centerX(m.w, total);
    const swatches: ColorSwatch[] = [];

    COLORES_APARIENCIA.forEach((col, i) => {
      const sw = new ColorSwatch(col, swatchSize, () => {
        this.color = i as ColorAparienciaId;
        swatches.forEach((s, idx) => s.setSelected(idx === i));
        this.avatar.draw(
          { peinado: this.peinado, color: this.color },
          m.isPhone ? 0.85 : 1.05,
        );
      });
      sw.setSelected(this.color === i);
      sw.position.set(x, y);
      inner.addChild(sw);
      swatches.push(sw);
      x += swatchSize + gap;
    });
  }

  private renderNombre(): void {
    this.setTitle('¿Cómo se llama?');
    const inner = this.flow;
    const m = this.m;
    let y = 4;

    const tip = this.makeText('Escribe su nombre', 18, m.columnW);
    tip.anchor.set(0, 0);
    tip.style.fill = PALETTE.textoSuave;
    tip.position.set(m.columnX, y);
    inner.addChild(tip);
    y += tip.height + 14;

    const inputW = m.cardW;
    this.nameInput = new NameInput({
      width: inputW,
      placeholder: 'Por ejemplo: Luna',
      onChange: (value, meta) => {
        this.nombre = value.trim();
        this.nombreOk = meta.valid;
        this.footer.setEnabled(1, this.nombreOk);
        if (this.hintText) this.hintText.visible = meta.wordCount >= 2;
      },
    });
    this.nameInput.position.set(m.columnX, y);
    inner.addChild(this.nameInput);
    this.nameInput.mount();
    this.nameInput.showDom(true);
    if (this.nombre) this.nameInput.setValue(this.nombre);
    y += 78;

    this.hintText = this.makeText(
      '¡Puedes poner un nombre inventado para tu personaje!',
      20,
      m.maxTextW,
    );
    this.hintText.anchor.set(0.5, 0);
    this.hintText.position.set(m.w / 2, y);
    this.hintText.visible = this.nombre.trim().split(/\s+/).filter(Boolean).length >= 2;
    inner.addChild(this.hintText);
    y += 40;

    y = this.addSuggestions(inner, [...NOMBRES_PERSONAJE], y, (n) => {
      this.nameInput?.setValue(n);
      this.nameInput?.focus();
    });
  }

  private renderMascota(): void {
    this.setTitle('¿Tiene una mascota?');
    const inner = this.flow;
    const m = this.m;
    let y = 4;

    const tip = this.makeText('Es opcional. Puedes decir “Ahora no”.', m.bodySize, m.maxTextW);
    tip.anchor.set(0.5, 0);
    tip.position.set(m.w / 2, y);
    inner.addChild(tip);
    y += tip.height + 14;

    const cols = 2;
    const gap = 12;
    const cardW = (m.columnW - gap) / cols;
    const cardH = 112;
    const petCards: PetCard[] = [];
    const opciones: { id: TipoMascota; label: string }[] = [
      ...TIPOS_MASCOTA,
      { id: null, label: 'Ninguna' },
    ];

    opciones.forEach((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const card = new PetCard(t.id, t.label, cardW, cardH, () => {
        if (!t.id) {
          clearMascota();
          this.tipoMascota = null;
          void this.sm.goTo('intro');
          return;
        }
        this.tipoMascota = t.id;
        petCards.forEach((c, idx) => c.setSelected(idx === i));
        this.avatar.drawPet(t.id, 1.05);
        this.footer.setEnabled(2, true);
      });
      card.setSelected(this.tipoMascota === t.id && t.id !== null);
      card.position.set(m.columnX + col * (cardW + gap), y + row * (cardH + gap));
      inner.addChild(card);
      petCards.push(card);
    });
  }

  private renderMascotaNombre(): void {
    this.setTitle('¿Cómo se llama la mascota?');
    const inner = this.flow;
    const m = this.m;
    let y = 4;

    if (this.tipoMascota) this.avatar.drawPet(this.tipoMascota, 1.05);

    const tip = this.makeText('Máximo 12 letras. También puedes inventarlo.', m.bodySize, m.maxTextW);
    tip.anchor.set(0.5, 0);
    tip.position.set(m.w / 2, y);
    inner.addChild(tip);
    y += tip.height + 14;

    const inputW = m.cardW;
    this.petNameInput = new NameInput({
      width: inputW,
      placeholder: 'Nombre de la mascota',
      onChange: (value, meta) => {
        this.nombreMascota = value.trim();
        this.nombreMascotaOk = meta.valid;
        this.footer.setEnabled(1, this.nombreMascotaOk);
        if (this.hintText) this.hintText.visible = meta.wordCount >= 2;
      },
    });
    this.petNameInput.position.set(m.columnX, y);
    inner.addChild(this.petNameInput);
    this.petNameInput.mount();
    this.petNameInput.showDom(true);
    if (this.nombreMascota) this.petNameInput.setValue(this.nombreMascota);
    y += 78;

    this.hintText = this.makeText('¡Puedes poner un nombre inventado!', 20, m.maxTextW);
    this.hintText.anchor.set(0.5, 0);
    this.hintText.position.set(m.w / 2, y);
    this.hintText.visible = false;
    inner.addChild(this.hintText);
    y += 40;

    this.addSuggestions(inner, [...NOMBRES_MASCOTA], y, (n) => {
      this.petNameInput?.setValue(n);
      this.petNameInput?.focus();
    });
  }

  private addSuggestions(
    parent: Container,
    names: string[],
    y: number,
    onPick: (name: string) => void,
  ): number {
    const m = this.m;
    const max = m.isPhone ? 4 : 6;
    const shown = names.slice(0, max);
    const btnW = Math.min(100, (m.w - m.pad * 2) / shown.length - 6);
    const total = shown.length * btnW + (shown.length - 1) * 6;
    let x = centerX(m.w, total);
    for (const n of shown) {
      const b = new Button({
        label: n,
        width: btnW,
        height: 42,
        fontSize: 16,
        variant: 'suave',
        onTap: () => onPick(n),
      });
      b.position.set(x, y);
      parent.addChild(b);
      x += btnW + 6;
    }
    return y + 50;
  }

  destroy(): void {
    this.cleanupInputs();
    super.destroy();
  }
}
