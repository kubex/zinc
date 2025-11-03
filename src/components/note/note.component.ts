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

  private _toggleExpand = () => {
    this.expanded = !this.expanded;
    this.updateComplete.then(() => this._measureOverflow());
  }

  private _measureOverflow() {
    const container = this.shadowRoot?.querySelector('.note__body-container') as HTMLElement | null;
    if (!container || this.collapseAtLines <= 0) {
      return;
    }

    container.style.setProperty('--note-collapse-lines', String(this.collapseAtLines));
    container.classList.toggle('note__body--clamped', !this.expanded);
  }

  protected firstUpdated() {
    this._measureOverflow();
  }

  protected updated() {
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
          <slot name="action"></slot>
        </div>
        <div class="${classMap({
          'note__body-container': true,
          'note__body--clamped': this.collapseAtLines > 0 && !this.expanded
        })}" style="--note-collapse-lines: ${this.collapseAtLines}">
          <slot class="note__body"></slot>
        </div>
        ${this.collapseAtLines > 0 ? html`
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
