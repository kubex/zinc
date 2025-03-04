import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, PropertyValues, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './panel.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/panel
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
export default class ZnPanel extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'basis-px', type: Number, reflect: true }) basis: number;
  @property({ attribute: 'caption', type: String, reflect: true }) caption: string;
  @property({ attribute: 'rows', type: Number, reflect: true }) rows: number;
  @property({ attribute: 'tabbed', type: Boolean, reflect: true }) tabbed: boolean;


  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (!this.tabbed) {
      const tabs = this.querySelector('zn-tabs');
      if (tabs) {
        tabs.setAttribute('flush-x', '');
        const body = this.shadowRoot?.querySelector('.body');
        if (body) {
          body.classList.toggle('ntp', true);
        }
      }
    }
  }

  protected render(): unknown {
    if (this.basis > 0) {
      this.style.flexBasis = this.basis + 'px';
    }

    const footerItems = this.querySelectorAll('[slot="footer"]').length > 0;
    const actionItems = this.querySelectorAll('[slot="actions"]').length > 0;

    if (this.rows > 0) {
      this.style.setProperty('--row-count', this.rows.toString());
    }

    let header;
    if (actionItems || this.caption || this.firstChild?.nodeName == 'ZN-TABS') {
      // zn-tabs uses the header as top-padding
      header = html`
        <div class="header">
          <span>${this.caption}</span>
          <slot name="actions"></slot>
        </div>
      `;
    }

    let footer;
    if (footerItems) {
      footer = html`
        <div class="footer">
          <slot name="footer"></slot>
        </div>`;
    }

    return html`
      <div>${header}
        <div class="body">
          <slot></slot>
        </div>
        ${footer}
      </div>`;
  }
}
