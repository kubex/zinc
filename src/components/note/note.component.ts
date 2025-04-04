import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';
import {type colors} from "../data-select/providers/color-data-provider";

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
        <slot class="note__body">${this.body}</slot>
        <slot name="footer" class="note__footer"></slot>
      </div>
    `;
  }
}
