import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {LocalizeController} from '../../utilities/localize';
import ZincElement from '../../internal/zinc-element';

import styles from './description-item.scss';
import {classMap} from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/description-item
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
export default class ZnDescriptionItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);

  @property() label: string;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
  }

  render() {
    return html`
      <div class=${classMap({
        'description-item': true,
      })}>
        <div class="description-item__label">${this.label}</div>
        <slot></slot>
      </div>
    `;
  }
}
