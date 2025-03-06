import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './form-group.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/form-group
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
export default class ZnFormGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) caption: string;
  @property({reflect: true}) description: string;

  render() {
    // const caption = this.caption ? html`<h2 class="caption">${this.caption}</h2>` : null;
    // const description = this.description ? html`<p class="description">${this.description}</p>` : null;


    return html`<slot></slot>`;
  }
}
