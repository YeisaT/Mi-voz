import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { HEX, PALETTE } from '../config/palette';
import { FONT_BODY } from './fonts';

/** Input HTML para código de acceso (letras, números y guion). */
export class CodeInput extends Container {
  private readonly bg: Graphics;
  private readonly hint: Text;
  private readonly input: HTMLInputElement;
  private readonly boxW: number;
  private readonly boxH = 52;
  private mounted = false;

  constructor(width: number, placeholder: string, onChange?: (value: string) => void) {
    super();
    this.boxW = width;

    this.bg = new Graphics();
    this.bg
      .roundRect(0, 0, this.boxW, this.boxH, 12)
      .fill({ color: 0xffffff })
      .stroke({ color: PALETTE.acento, width: 2 });
    this.addChild(this.bg);

    this.hint = new Text({
      text: placeholder,
      style: new TextStyle({
        fontFamily: FONT_BODY,
        fontSize: 16,
        fill: PALETTE.acento,
      }),
    });
    this.hint.position.set(14, 14);
    this.addChild(this.hint);

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.maxLength = 24;
    this.input.autocomplete = 'off';
    this.input.spellcheck = false;
    this.input.setAttribute('aria-label', 'Código de acceso');
    Object.assign(this.input.style, {
      position: 'fixed',
      zIndex: '30',
      border: `2px solid ${HEX.acento}`,
      borderRadius: '12px',
      padding: '10px 14px',
      fontSize: '18px',
      fontFamily: 'Capriola, Nunito, sans-serif',
      color: HEX.texto,
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
      display: 'none',
      textTransform: 'uppercase',
    } as CSSStyleDeclaration);

    this.input.addEventListener('input', () => {
      const cleaned = this.input.value.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase();
      if (cleaned !== this.input.value) this.input.value = cleaned;
      this.hint.visible = cleaned.length === 0;
      onChange?.(cleaned);
    });

    this.eventMode = 'static';
    this.cursor = 'text';
    this.on('pointertap', () => this.focus());
  }

  getValue(): string {
    return this.input.value.trim();
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
  }

  syncDomPosition(): void {
    if (!this.mounted || this.input.style.display === 'none') return;
    const global = this.getGlobalPosition();
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
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
    if (this.mounted) {
      this.input.remove();
      this.mounted = false;
    }
    super.destroy(options);
  }

  private readonly onWinResize = (): void => {
    this.syncDomPosition();
  };
}
