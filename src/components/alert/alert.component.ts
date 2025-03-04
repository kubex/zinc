import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './alert.scss?inline';
import { classMap } from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/alert
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
export default class ZnAlert extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: String }) icon: string = '';
  @property({ type: String }) caption: string = '';
  @property({ type: Boolean }) collapse: boolean = false;
  @property({ type: String }) level: 'primary' | 'error' | 'info' | 'success' | 'warning' = 'info';
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';

  render() {
    let icon;

    if (this.icon) {
      if (this.collapse) {
        icon = this.icon ? html`
          <zn-icon src="${this.icon}" id="xy2" @click="${this.hideAlert}"
                   style="cursor: pointer"></zn-icon>` : "";
      } else {
        icon = this.icon ? html`
          <zn-icon src="${this.icon}" id="xy2"></zn-icon>` : '';
      }
    }

    const caption = this.caption ? html`<h6>${this.caption}</h6>` : '';

    return html`
      <div class=${classMap({
        wrapper: true,
        "alert--small": this.size === 'small',
        "alert--medium": this.size === 'medium',
        "alert--large": this.size === 'large',
      })}>
        ${icon}
        <div class="content">
          ${caption}
          <slot></slot>
        </div>
        <div class="actions">
          <slot name="actions"></slot>
        </div>
      </div>`;
  }

  public hideAlert() {
    this.style.display = "none";
  }
}
