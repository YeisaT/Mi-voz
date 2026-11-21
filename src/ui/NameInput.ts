import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { HEX, PALETTE } from '../config/palette';

export type NameInputOptions = {
  maxLength?: number;
  placeholder?: string;
  width?: number;
  onChange: (value: string, meta: { wordCount: number; valid: boolean }) => void;
};

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]*$/;

export class NameInput extends Container {
  private readonly bg: Graphics;
  private readonly hint: Text;
  private readonly input: HTMLInputElement;
  private readonly maxLength: number;
  private readonly boxW: number;
  private readonly boxH = 50;
  private mounted = false;
  private readonly onChange: NameInputOptions['onChange'];

  constructor(opts: NameInputOptions) {
    super();
    this.maxLength = opts.maxLength ?? 12;
    this.boxW = opts.width ?? 320;
    this.onChange = opts.onChange;

    this.bg = new Graphics();
    this.bg
      .roundRect(0, 0, this.boxW, this.boxH, 12)
      .fill({ color: 0xffffff })
      .stroke({ color: PALETTE.acento, width: 2 });
    this.addChild(this.bg);

    this.hint = new Text({
      text: opts.placeholder ?? 'Escribe un nombre',
      style: new TextStyle({
        fontFamily: 'Nunito, Trebuchet MS, sans-serif',
        fontSize: 18,
        fill: PALETTE.acento,
      }),
    });
    this.hint.position.set(14, 14);
    this.addChild(this.hint);

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.maxLength = this.maxLength;
    this.input.autocomplete = 'off';
    this.input.spellcheck = false;
    this.input.setAttribute('aria-label', 'Nombre');
    Object.assign(this.input.style, {
      position: 'fixed',
      zIndex: '30',
      border: `2px solid ${HEX.acento}`,
      borderRadius: '12px',
      padding: '10px 14px',
      fontSize: '18px',
      fontFamily: 'Nunito, Trebuchet MS, sans-serif',
      color: HEX.texto,
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
      display: 'none',
      WebkitAppearance: 'none',
    } as CSSStyleDeclaration);

    this.input.addEventListener('input', () => this.emitChange());

    this.eventMode = 'static';
    this.cursor = 'text';
    this.on('pointertap', () => this.focus());
  }

  getValue(): string {
    return this.input.value.trim();
  }

  setValue(value: string): void {
    this.input.value = this.sanitize(value).slice(0, this.maxLength);
    this.hint.visible = this.input.value.length === 0;
    this.emitChange();
  }

  focus(): void {
    this.mount();
    this.syncDomPosition();
    this.input.style.display = 'block';
    this.input.focus();
  }

  mount(): void {
    if (this.mounted) return;
    document.body.appendChild(this.input);
    this.mounted = true;
    window.addEventListener('resize', this.onWinResize);
    window.visualViewport?.addEventListener('resize', this.onWinResize);
    window.visualViewport?.addEventListener('scroll', this.onWinResize);
  }

  syncDomPosition(): void {
    if (!this.mounted || this.input.style.display === 'none') return;
    const global = this.getGlobalPosition();
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Con autoDensity, las coords de escena coinciden con CSS del canvas.
    this.input.style.left = `${rect.left + global.x}px`;
    this.input.style.top = `${rect.top + global.y}px`;
    this.input.style.width = `${this.boxW}px`;
    this.input.style.height = `${this.boxH}px`;
  }

  showDom(visible: boolean): void {
    if (!this.mounted && visible) this.mount();
    this.input.style.display = visible ? 'block' : 'none';
    if (visible) this.syncDomPosition();
  }

  destroy(options?: boolean | { children?: boolean; texture?: boolean; baseTexture?: boolean }): void {
    window.removeEventListener('resize', this.onWinResize);
    window.visualViewport?.removeEventListener('resize', this.onWinResize);
    window.visualViewport?.removeEventListener('scroll', this.onWinResize);
    if (this.mounted) {
      this.input.remove();
      this.mounted = false;
    }
    super.destroy(options);
  }

  private readonly onWinResize = (): void => {
    this.syncDomPosition();
  };

  private emitChange(): void {
    const cleaned = this.sanitize(this.input.value);
    if (cleaned !== this.input.value) this.input.value = cleaned;
    this.hint.visible = cleaned.length === 0;
    const words = cleaned.trim().split(/\s+/).filter(Boolean);
    this.onChange(cleaned, {
      wordCount: words.length,
      valid: this.isValid(cleaned),
    });
  }

  private sanitize(raw: string): string {
    return [...raw].filter((ch) => NAME_RE.test(ch)).join('').slice(0, this.maxLength);
  }

  private isValid(value: string): boolean {
    const t = value.trim();
    return t.length >= 1 && t.length <= this.maxLength && NAME_RE.test(t);
  }
}
