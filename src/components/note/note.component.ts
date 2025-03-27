import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
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
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnNote extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) color: 'red' | 'blue' | 'orange' | 'yellow' | 'indigo' | 'violet' | 'green' | 'pink' | 'gray' | '' = '';

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
          <slot class="note__header__caption" name="caption"></slot>
          <slot class="note__header__date" name="date"></slot>
        </div>
        <div class="note__body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
