import {classMap} from "lit/directives/class-map.js";
import {type colors} from "../data-select/providers/color-data-provider";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';

import styles from './note.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/note
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot caption - The note's caption.
 * @slot date - The note's date.
 * @slot body - The note's body.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnNote extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) color: typeof colors[number];
  @property({reflect: true}) caption: string = '';
  @property({reflect: true}) date: string = '';
  @property({type: HTMLElement, reflect: true}) body: string = '';

  // Number of lines at which the note body collapses; 0 disables collapsing
  @property({type: Number, attribute: 'collapse-at-lines', reflect: true}) collapseAtLines: number = 3;

  // Internal state: whether the body is currently expanded
  @state() private expanded = false;

  // Internal state: whether the content actually overflows the clamp
  @state() private _isOverflowing = false;

  private _toggleExpand = () => {
    this.expanded = !this.expanded;
    // re-evaluate overflow after toggle (in case of dynamic content)
    this.updateComplete.then(() => this._measureOverflow());
  }

  private _measureOverflow() {
    // Only relevant when collapseAtLines is set and not expanded
    const container = this.shadowRoot?.querySelector('.note__body-container') as HTMLElement | null;
    if (!container) {
      this._isOverflowing = false;
      return;
    }

    if (this.collapseAtLines <= 0) {
      this._isOverflowing = false;
      return;
    }

    // Temporarily ensure clamped styles are applied to measure
    container.style.setProperty('--note-collapse-lines', String(this.collapseAtLines));
    container.classList.toggle('note__body--clamped', !this.expanded);

    // element starts hidden, cannot measure
    if (container.clientHeight === 0) {
      this._isOverflowing = false;
      return;
    }

    // Measure overflow
    this._isOverflowing = container.scrollHeight > container.clientHeight + 1;  // +1 for rounding errors
  }

  protected firstUpdated() {
    // Initial measurement of overflow
    this._measureOverflow();
  }

  protected updated() {
    // Re-measure on any update to catch slot/content changes
    this._measureOverflow();
  }

  protected render(): unknown {
    return html`
      <div class="${classMap({
        'note': true,
        'note--red': this.color === 'red',
        'note--blue': this.color === 'blue',
        'note--orange': this.color === 'orange',
        'note--yellow': this.color === 'yellow',
        'note--indigo': this.color === 'indigo',
        'note--violet': this.color === 'violet',
        'note--green': this.color === 'green',
        'note--pink': this.color === 'pink',
        'note--gray': this.color === 'gray',
      })}">
        <div class="note__header">
          <slot name="caption" class="note__header__caption">${this.caption}</slot>
          <slot name="date" class="note__header__date">
            <small>${this.date}</small>
          </slot>
        </div>
        <div class="${classMap({
          'note__body-container': true,
          'note__body--clamped': this.collapseAtLines > 0 && !this.expanded
        })}" style="--note-collapse-lines: ${this.collapseAtLines}">
          <slot class="note__body"></slot>
        </div>
        ${(this.collapseAtLines > 0 && this._isOverflowing) || (!this._isOverflowing && this.expanded) ? html`
          <div class="note__toggle">
            <zn-button color="transparent"
                       size="content"
                       class="note__toggle__btn"
                       @click="${this._toggleExpand}"
                       aria-expanded="${String(this.expanded)}">
              ${this.expanded ? 'Show less' : 'Show more'}
            </zn-button>
          </div>
        ` : ''}
        <slot name="footer" class="note__footer"></slot>
      </div>
    `;
  }
}
