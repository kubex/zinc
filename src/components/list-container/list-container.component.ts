import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {LocalizeController} from '../../utilities/localize';
import ZincElement from '../../internal/zinc-element';
import {classMap} from "lit/directives/class-map.js";
import {property} from "lit/decorators.js";

import styles from './list-container.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/list-container
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
export default class ZnListContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);

  @property({type: Boolean}) divide: boolean;
  @property({type: Boolean, attribute: "pad-sm"}) padSmall: boolean;

  render() {
    return html`
      <div class=${classMap({
        'list-container': true,
        'list-container--divide': this.divide,
        'list-container--pad-sm': this.padSmall
      })}>
        <slot></slot>
      </div>`;
  }
}
