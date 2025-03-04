import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './collapsible.scss';
import { Store } from "../../internal/storage";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/collapsible
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
export default class ZnCollapsible extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'caption', type: String, reflect: true }) caption: string;
  @property({ attribute: 'open', type: Boolean, reflect: true }) open: boolean;
  @property({ attribute: 'default', type: String }) defaultState: string;

  @property({ attribute: 'local-storage', type: Boolean, reflect: true }) localStorage: Boolean;
  @property({ attribute: 'store-key', type: String, reflect: true }) storeKey: string = "";
  @property({ attribute: 'store-ttl', type: Number, reflect: true }) storeTtl = 0;
  protected _store: Store;

  connectedCallback() {
    super.connectedCallback();
    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "znclap:", this.storeTtl);
    this.open = this.defaultState == 'open';

    if (this.storeKey) {
      const hasPref = this._store.get(this.storeKey);
      if (hasPref != null) {
        this.open = hasPref == "true";
      }
    }
  }

  public toggle() {
    this.open = !this.open;
    if (this._store) {
      this._store.set(this.storeKey, this.open ? "true" : "false");
    }
  }

  protected render(): unknown {
    return html`
      <div @click="${this.toggle}" class="caption">${this.caption}
        <slot name="caption"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>`;
  }
}
