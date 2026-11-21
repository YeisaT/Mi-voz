import { Container, Text } from 'pixi.js';
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
import { ScrollArea } from '../ui/ScrollArea';
import { centerX, colsForWidth } from '../ui/layout';

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

  private readonly avatar = new CharacterView();
  private readonly scroll = new ScrollArea();
  private nameInput: NameInput | null = null;
  private petNameInput: NameInput | null = null;
  private hintText: Text | null = null;

  constructor(sm: SceneManager) {
    super(sm);
    this.content.addChild(this.avatar);
    this.content.addChild(this.scroll);
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
    const avatarScale = m.isPhone ? 0.85 : 1.05;
    const avatarY = m.contentTop + (m.isPhone ? 58 : 70);
    this.avatar.position.set(m.w * 0.5, avatarY);
    this.avatar.draw({ peinado: this.peinado, color: this.color }, avatarScale);
    if (this.tipoMascota && (this.step === 'mascota' || this.step === 'mascotaNombre')) {
      this.avatar.drawPet(this.tipoMascota, 0.7);
    } else {
      this.avatar.drawPet(null);
    }

    const scrollTop = avatarY + (m.isPhone ? 70 : 90);
    const scrollH = Math.max(100, m.contentBottom - scrollTop);
    this.scroll.position.set(0, scrollTop);
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
    this.scroll.clearInner();
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
          width: Math.min(220, m.cardW),
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
    this.setTitle('¿Cómo se ve tu personaje?');
    const inner = this.scroll.inner;
    const m = this.m;
    let y = 4;

    const tip = this.makeText('Elige peinado y color', m.bodySize, m.maxTextW);
    tip.anchor.set(0.5, 0);
    tip.position.set(m.w / 2, y);
    inner.addChild(tip);
    y += tip.height + 12;

    const peinadoLabels = ['Liso', 'Coletas', 'Sueltos'];
    const cardW = Math.min(140, (m.w - m.pad * 2) / 3 - 8);
    const startX = centerX(m.w, cardW * 3 + 16);
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
    y += 62;

    const swatchSize = m.isPhone ? 52 : 60;
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
    this.setTitle('¿Cómo se llama tu personaje?');
    const inner = this.scroll.inner;
    const m = this.m;
    let y = 4;

    const tip = this.makeText('Máximo 12 letras. Puedes inventarlo.', m.bodySize, m.maxTextW);
    tip.anchor.set(0.5, 0);
    tip.position.set(m.w / 2, y);
    inner.addChild(tip);
    y += tip.height + 14;

    const inputW = Math.min(340, m.cardW);
    this.nameInput = new NameInput({
      width: inputW,
      placeholder: 'Nombre del personaje',
      onChange: (value, meta) => {
        this.nombre = value.trim();
        this.nombreOk = meta.valid;
        this.footer.setEnabled(1, this.nombreOk);
        if (this.hintText) this.hintText.visible = meta.wordCount >= 2;
      },
    });
    this.nameInput.position.set(centerX(m.w, inputW), y);
    inner.addChild(this.nameInput);
    this.nameInput.mount();
    this.nameInput.showDom(true);
    if (this.nombre) this.nameInput.setValue(this.nombre);
    y += 64;

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
    const inner = this.scroll.inner;
    const m = this.m;
    let y = 4;

    const tip = this.makeText('Es opcional. Puedes decir “Ahora no”.', m.bodySize, m.maxTextW);
    tip.anchor.set(0.5, 0);
    tip.position.set(m.w / 2, y);
    inner.addChild(tip);
    y += tip.height + 14;

    const cols = colsForWidth(m.w, 3);
    const cardW = Math.min(150, (m.w - m.pad * 2) / cols - 10);
    const totalW = cols * cardW + (cols - 1) * 10;
    const startX = centerX(m.w, totalW);
    const petCards: OptionCard[] = [];

    TIPOS_MASCOTA.forEach((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const card = new OptionCard({
        label: t.label,
        width: cardW,
        height: 52,
        accent: PALETTE.verdeSuave,
        selected: this.tipoMascota === t.id,
        onToggle: () => {
          this.tipoMascota = t.id;
          petCards.forEach((c, idx) => c.setSelected(idx === i));
          this.avatar.drawPet(t.id, 0.7);
          this.footer.setEnabled(2, true);
        },
      });
      card.position.set(startX + col * (cardW + 10), y + row * 62);
      inner.addChild(card);
      petCards.push(card);
    });
  }

  private renderMascotaNombre(): void {
    this.setTitle('¿Cómo se llama la mascota?');
    const inner = this.scroll.inner;
    const m = this.m;
    let y = 4;

    if (this.tipoMascota) this.avatar.drawPet(this.tipoMascota, 0.7);

    const tip = this.makeText('Máximo 12 letras. También puedes inventarlo.', m.bodySize, m.maxTextW);
    tip.anchor.set(0.5, 0);
    tip.position.set(m.w / 2, y);
    inner.addChild(tip);
    y += tip.height + 14;

    const inputW = Math.min(340, m.cardW);
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
    this.petNameInput.position.set(centerX(m.w, inputW), y);
    inner.addChild(this.petNameInput);
    this.petNameInput.mount();
    this.petNameInput.showDom(true);
    if (this.nombreMascota) this.petNameInput.setValue(this.nombreMascota);
    y += 64;

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
