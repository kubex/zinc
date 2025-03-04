import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './note.scss?inline';

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

  protected render(): unknown {
    return html`
      <div>
        <div class="header">
          <slot class="caption" name="caption"></slot>
          <slot class="date" name="date"></slot>
        </div>
        <div class="body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
