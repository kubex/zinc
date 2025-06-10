import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {LocalizeController} from '../../utilities/localize';
import ZincElement from '../../internal/zinc-element';

import styles from './action-bar.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/action-bar
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
export default class ZnActionBar extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);

  render() {
    return html`
      <div class="action-bar">
        <div class="action-bar__left">
          <slot name="menu"></slot>
        </div>
        <div class="action-bar__right">
          <slot name="actions"></slot>
        </div>
      </div>`;
  }
}
