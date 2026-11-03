import {
  type ColorFormat,
  hslToRgb,
  type Hsv,
  hsvToRgb,
  oklchParts,
  oklchToRgb,
  parseColor,
  type Rgb,
  rgbToHsl,
  rgbToHsv,
  toHex
} from '../../utilities/color';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property, query} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';

import styles from './color-picker.scss';

type FieldKey = 'hex' | 'r' | 'g' | 'b' | 'h' | 's' | 'l' | 'ol' | 'oc' | 'oh';

const FORMAT_OF: Record<FieldKey, ColorFormat> = {
  hex: 'hex', r: 'rgb', g: 'rgb', b: 'rgb', h: 'hsl', s: 'hsl', l: 'hsl', ol: 'oklch', oc: 'oklch', oh: 'oklch'
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * @summary A colour panel: a saturation/brightness area, a hue slider and the colour's HEX, RGB, HSL and OKLCH values.
 * @documentation https://zinc.style/components/color-picker
 * @status experimental
 * @since 1.0
 *
 * @event zn-input - Emitted when the colour or the format being worked in changes.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnColorPicker extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @query('.color-picker__area') area: HTMLElement;

  /** The colour, in any CSS colour syntax. Reads back as `#RRGGBB`. */
  @property() value = '#000000';

  /** The format being worked in. Focusing or editing a row switches to that row's format. */
  @property({reflect: true}) format: ColorFormat = 'hex';

  @property() label = 'Colour';

  private hsv: Hsv = [0, 0, 0];
  private editing: FieldKey | null = null;

  private get rgb(): Rgb {
    return hsvToRgb(...this.hsv);
  }

  connectedCallback() {
    super.connectedCallback();
    this.adopt(this.value);
  }

  /** Moves focus to the colour area. */
  focus(options?: FocusOptions) {
    this.area?.focus(options);
  }

  @watch('value', {waitUntilFirstUpdate: true})
  handleValueChange() {
    if (this.value !== toHex(this.rgb)) {
      this.adopt(this.value);
      this.requestUpdate();
    }
  }

  // Grey and black have no hue of their own, so keep the current one rather than snapping the slider to red.
  private adopt(color: string | Rgb) {
    const rgb = typeof color === 'string' ? parseColor(color) : color;
    if (!rgb) return;
    const hsv = rgbToHsv(...rgb);
    this.hsv = hsv[1] > 0 && hsv[2] > 0 ? hsv : [this.hsv[0], hsv[1], hsv[2]];
    this.value = toHex(rgb);
  }

  private commit(except?: FieldKey) {
    this.editing = except ?? null;
    this.value = toHex(this.rgb);
    this.requestUpdate();
    this.emit('zn-input');
  }

  private useFormat(key: FieldKey) {
    if (FORMAT_OF[key] !== this.format) {
      this.format = FORMAT_OF[key];
      this.emit('zn-input');
    }
  }

  private pick(event: PointerEvent) {
    const rect = this.area.getBoundingClientRect();
    this.hsv = [this.hsv[0], clamp((event.clientX - rect.left) / rect.width, 0, 1), 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1)];
    this.commit();
  }

  private handleAreaPointerDown = (event: PointerEvent) => {
    this.area.setPointerCapture(event.pointerId);
    this.area.focus();
    this.pick(event);
    this.area.addEventListener('pointermove', this.handleAreaPointerMove);
  };

  private handleAreaPointerMove = (event: PointerEvent) => this.pick(event);

  private handleAreaPointerUp = () => {
    this.area.removeEventListener('pointermove', this.handleAreaPointerMove);
  };

  private handleAreaKeyDown(event: KeyboardEvent) {
    if (!event.key.startsWith('Arrow')) return;
    event.preventDefault();
    const step = event.shiftKey ? 0.1 : 0.01;
    const [h, s, v] = this.hsv;
    switch (event.key) {
      case 'ArrowLeft':
        this.hsv = [h, clamp(s - step, 0, 1), v];
        break;
      case 'ArrowRight':
        this.hsv = [h, clamp(s + step, 0, 1), v];
        break;
      case 'ArrowUp':
        this.hsv = [h, s, clamp(v + step, 0, 1)];
        break;
      case 'ArrowDown':
        this.hsv = [h, s, clamp(v - step, 0, 1)];
        break;
    }
    this.commit();
  }

  private handleHueInput(event: Event) {
    this.hsv = [+(event.target as HTMLInputElement).value, this.hsv[1], this.hsv[2]];
    this.commit();
  }

  private field(key: FieldKey) {
    return this.renderRoot.querySelector<HTMLInputElement>(`[data-k="${key}"]`)!;
  }

  private num(key: FieldKey) {
    return parseFloat(this.field(key).value) || 0;
  }

  private handleFieldFocus(event: FocusEvent) {
    const key = (event.target as HTMLElement).dataset?.k as FieldKey | undefined;
    if (key) this.useFormat(key);
  }

  private handleFieldInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const key = target.dataset.k as FieldKey | undefined;
    if (!key) return;
    event.stopPropagation();
    this.editing = key;
    this.useFormat(key);

    const rgb = this.readField(key, target.value.trim());
    if (rgb) {
      target.removeAttribute('aria-invalid');
      this.adopt(rgb);
      this.commit(key);
    } else {
      target.setAttribute('aria-invalid', 'true');
    }
  }

  private handleFieldBlur() {
    this.editing = null;
    this.requestUpdate();
  }

  /** The colour a row describes once `value` is written into its `key` field, or null when that value is out of range. */
  private readField(key: FieldKey, value: string): Rgb | null {
    if (key === 'hex') {
      return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? parseColor(value) : null;
    }

    if (key === 'ol' || key === 'oc' || key === 'oh') {
      if (!/^\d*\.?\d+$/.test(value)) return null;
      const n = parseFloat(value);
      if (n > (key === 'ol' ? 100 : key === 'oc' ? 0.5 : 360)) return null;
      return oklchToRgb(
        (key === 'ol' ? n : this.num('ol')) / 100,
        key === 'oc' ? n : this.num('oc'),
        key === 'oh' ? n : this.num('oh')
      );
    }

    if (!/^\d+$/.test(value)) return null;
    const n = +value;
    if (key === 'r' || key === 'g' || key === 'b') {
      if (n > 255) return null;
      return [key === 'r' ? n : this.num('r'), key === 'g' ? n : this.num('g'), key === 'b' ? n : this.num('b')];
    }
    if (n > (key === 'h' ? 360 : 100)) return null;
    return hslToRgb(key === 'h' ? n % 360 : this.num('h'), key === 's' ? n : this.num('s'), key === 'l' ? n : this.num('l'));
  }

  // The fields are written imperatively so the one being typed in keeps exactly what was typed.
  protected updated(changed: PropertyValues) {
    super.updated(changed);
    const rgb = this.rgb;
    const [h, s, l] = rgbToHsl(...rgb);
    const [ol, oc, oh] = oklchParts(rgb);
    const values: Record<FieldKey, string | number> = {
      hex: toHex(rgb), r: rgb[0], g: rgb[1], b: rgb[2], h, s, l, ol, oc, oh
    };
    (Object.keys(values) as FieldKey[]).forEach(key => {
      if (key === this.editing) return;
      const input = this.field(key);
      input.value = String(values[key]);
      input.removeAttribute('aria-invalid');
    });
  }

  private renderTrio(name: string, fields: [FieldKey, string, string][]) {
    return html`
      <div class="color-picker__row">
        <span class="color-picker__row-label">${name}</span>
        <div class="color-picker__trio">
          ${fields.map(([key, label, mode]) => html`
            <input class="color-picker__field" data-k=${key} inputmode=${mode} aria-label=${label}
                   spellcheck="false" autocomplete="off">`)}
        </div>
      </div>`;
  }

  render() {
    const [h, s, v] = this.hsv;
    const hex = toHex(this.rgb);

    return html`
      <div part="base" class="color-picker" role="group" aria-label="${this.label} colour picker">
        <div class="color-picker__area"
             tabindex="0"
             role="application"
             aria-label="Colour area: left to right is saturation, bottom to top is brightness. Use the arrow keys."
             style=${styleMap({backgroundColor: `hsl(${Math.round(h)} 100% 50%)`})}
             @pointerdown=${this.handleAreaPointerDown}
             @pointerup=${this.handleAreaPointerUp}
             @lostpointercapture=${this.handleAreaPointerUp}
             @keydown=${this.handleAreaKeyDown}>
          <span class="color-picker__dot"
                style=${styleMap({left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: hex})}></span>
        </div>

        <input class="color-picker__hue" type="range" min="0" max="360" step="1" aria-label="Hue"
               .value=${String(Math.round(h))}
               @input=${this.handleHueInput}>

        <div class="color-picker__values"
             @focusin=${this.handleFieldFocus}
             @input=${this.handleFieldInput}
             @focusout=${this.handleFieldBlur}>
          <label class="color-picker__row color-picker__row--hex">
            <span class="color-picker__row-label">HEX</span>
            <input class="color-picker__field" data-k="hex" aria-label="Hex" spellcheck="false" autocomplete="off">
          </label>
          ${this.renderTrio('RGB', [['r', 'Red', 'numeric'], ['g', 'Green', 'numeric'], ['b', 'Blue', 'numeric']])}
          ${this.renderTrio('HSL', [['h', 'Hue degrees', 'numeric'], ['s', 'Saturation percent', 'numeric'], ['l', 'Lightness percent', 'numeric']])}
          ${this.renderTrio('OKLCH', [['ol', 'OKLCH lightness percent', 'decimal'], ['oc', 'OKLCH chroma', 'decimal'], ['oh', 'OKLCH hue degrees', 'decimal']])}
        </div>
      </div>
    `;
  }
}
