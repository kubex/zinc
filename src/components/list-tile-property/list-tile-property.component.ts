import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';
import { classMap } from "lit/directives/class-map.js";

import styles from './list-tile-property.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/list-tile-property
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
export default class ZnListTileProperty extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'caption', reflect: true }) caption: string;
  @property({ attribute: 'description', reflect: true }) description: string;

  render() {
    return html`
      <div class="${classMap({ 'tile__property': true })}">
        <p part="caption" class="tile__caption">${this.caption}</p>
        <slot part="description" class="tile__description">${this.description}</slot>
      </div>`;
  }
}
