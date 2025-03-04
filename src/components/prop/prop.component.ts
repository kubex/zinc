import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './prop.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/prop
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
export default class ZnProp extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'caption', reflect: true}) caption: string;
  @property({attribute: 'sub', reflect: true}) subCaption: string;
  @property({attribute: 'icon', reflect: true}) icon: string;
  @property({attribute: 'library', reflect: true}) library = "material-outlined";
  @property({attribute: 'inline', type: Boolean, reflect: true}) inline: boolean;
  @property({attribute: 'colspan', type: Number, reflect: true}) colspan: number;

  protected render(): unknown {
    let icon = null;
    if (this.icon) {
      icon = html`
        <zn-icon library="${this.library}" src="${this.icon}" size="20"></zn-icon>`;
    }
    let subCaption = null;
    if (this.subCaption) {
      subCaption = html`
        <small>${this.subCaption}</small>`;
    }

    const colspan = this.colspan ? this.colspan : 3;

    return html`
      <style>:host {
        --colspan: ${colspan};
      }</style>
      <dt>${icon}${this.caption}${subCaption}</dt>
      <dd>
        <slot></slot>
      </dd>`;
  }
}
