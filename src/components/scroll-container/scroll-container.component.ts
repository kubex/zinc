import {type CSSResultGroup, html, unsafeCSS, PropertyValues} from 'lit';
import ZincElement from '../../internal/zinc-element';
import {property} from "lit/decorators.js";

import styles from './scroll-container.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/scroll-container
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
export default class ZnScrollContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'start-scrolled', type: Boolean, reflect: true}) startScrolled: boolean = false;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.startScrolled) {
      setTimeout(() => {
        this.scrollTop = this.scrollHeight;
      }, 1000);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.startScrolled) {
      const observer = new MutationObserver(() => {
        setTimeout(() => {
          this.scrollTop = this.scrollHeight;
        }, 100);
      });
      observer.observe(this, {childList: true, subtree: true});
    }
  }

  render() {
    return html`
      <slot></slot>
    `;
  }
}
