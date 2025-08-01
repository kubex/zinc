import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type ZnDropdown from "../dropdown";

import styles from './split-button.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/split-button
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
export default class ZnSplitButton extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() caption: string;
  @property() href: string;

  @query('zn-dropdown') dropdown: ZnDropdown;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick)
    this.addEventListener('zn-menu-select', this.handleMenuItemClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('zn-menu-select', this.handleMenuItemClick);
  }

  public handleMenuItemClick() {
    if (this.dropdown) {
      this.dropdown.hide();
    }
  }

  public handleClick(e: MouseEvent) {
    e.stopPropagation();
  }

  render() {
    return html`
      <zn-dropdown placement="bottom-start">
        <div slot="trigger">
          <zn-button-group>
            <zn-button href=${this.href} @click="${(e: MouseEvent) => e.stopPropagation()}">${this.caption}</zn-button>
            <zn-button icon="keyboard_arrow_down"></zn-button>
          </zn-button-group>
        </div>
        <div>
          <slot name="menu"></slot>
        </div>
      </zn-dropdown>
    `;
  }
}
