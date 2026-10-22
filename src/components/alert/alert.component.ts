import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import {registerCosmicBorder} from "../../internal/cosmic-border";
import ZincElement from '../../internal/zinc-element';

import styles from './alert.scss';

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

  @property({type: String}) icon: string = '';
  /** The status icon's size in pixels. */
  @property({attribute: 'icon-size', type: Number}) iconSize = 24;
  @property({type: String}) caption: string = '';
  @property({type: Boolean}) collapse: boolean = false;
  @property({type: String, reflect: true}) appearance: 'transparent' | 'solid' = 'transparent';
  /** `ai` marks AI-generated content only. */
  @property({type: String}) level: 'primary' | 'error' | 'info' | 'success' | 'warning' | 'note' | 'cosmic' | 'ai' = 'info';
  @property({type: Boolean, reflect: true}) center: boolean = false;
  @property({type: String}) size: 'small' | 'medium' | 'large' = 'medium';

  connectedCallback() {
    super.connectedCallback();
    registerCosmicBorder();
  }

  render() {
    let icon;

    if (this.icon) {
      if (this.collapse) {
        icon = this.icon ? html`
          <button type="button" class="alert-dismiss" aria-label="Dismiss" @click="${this.hideAlert}">
            <zn-icon class="alert-icon" src="${this.icon}" size="${this.iconSize}" id="xy2"></zn-icon>
          </button>` : "";
      } else {
        icon = this.icon ? html`
          <zn-icon class="alert-icon" src="${this.icon}" size="${this.iconSize}" id="xy2"></zn-icon>` : '';
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
