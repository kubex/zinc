import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './typewriter.scss';

/**
 * @summary Types its text out one character at a time, then shows anything slotted after it.
 * @documentation https://zinc.style/components/typewriter
 * @status experimental
 * @since 2.0
 *
 * @event zn-finish - Emitted once the whole text is shown.
 *
 * @slot - The text to type. Read as plain text.
 * @slot after - Content held back until typing finishes.
 *
 * @csspart base - The typed text wrapper.
 * @csspart caret - The blinking caret shown while typing.
 *
 * @usage
 * ```html
 * <zn-typewriter>Here are the articles that cover deep strike.</zn-typewriter>
 * ```
 */
export default class ZnTypewriter extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** Milliseconds per character. */
  @property({type: Number}) speed = 18;

  /** Longer text types faster so it never takes more than this many milliseconds. */
  @property({type: Number, attribute: 'max-duration'}) maxDuration = 1500;

  /** Pads the typed text like a zn-sp, so after-slot content can sit flush beneath it. */
  @property({type: Boolean, reflect: true}) padded = false;

  @state() private _text = '';
  @state() private _shown = 0;

  private _timer?: ReturnType<typeof setTimeout>;

  get done(): boolean {
    return this._shown >= this._text.length;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  private _handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    const text = slot.assignedNodes({flatten: true}).map(node => node.textContent ?? '').join('').trim();
    if (text !== this._text) {
      this._start(text);
    }
  };

  private _start(text: string) {
    clearTimeout(this._timer);
    this._text = text;
    this._shown = 0;
    if (text === '' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this._finish();
      return;
    }
    const delay = Math.max(this.speed, 1);
    const step = Math.max(1, Math.ceil(text.length * delay / Math.max(this.maxDuration, delay)));
    const tick = () => {
      this._shown = Math.min(this._text.length, this._shown + step);
      if (this.done) {
        this._finish();
      } else {
        this._timer = setTimeout(tick, delay);
      }
    };
    this._timer = setTimeout(tick, delay);
  }

  private _finish() {
    this._shown = this._text.length;
    this.emit('zn-finish');
  }

  render() {
    return html`
      <span part="base" class="typewriter">
        <span class="typewriter__label">${this._text}</span>
        <span aria-hidden="true">${this._text.slice(0, this._shown)}${this.done ? '' : html`<span part="caret" class="typewriter__caret"></span>`}</span>
      </span>
      <slot class="typewriter__source" @slotchange=${this._handleSlotChange}></slot>
      <div class="typewriter__after" ?hidden=${!this.done}><slot name="after"></slot></div>
    `;
  }
}
