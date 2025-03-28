import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './accordion.scss';
import {Store} from "../../internal/storage";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/accordion
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
export default class ZnAccordion extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) caption = '';

  @property({reflect: true}) description = '';

  @property({reflect: true}) label = '';

  @property({type: Boolean, reflect: true}) expanded: boolean = false;

  @property({attribute: 'default'}) defaultState: 'open' | 'closed';

  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;

  @property({attribute: 'store-key', reflect: true}) storeKey: string = "";

  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;

  protected _store: Store;

  connectedCallback() {
    super.connectedCallback();
    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "znaccord:", this.storeTtl);
    this.expanded = this.defaultState === 'open';

    if (this.storeKey) {
      const hasPref = this._store.get(this.storeKey);
      if (hasPref) {
        this.expanded = hasPref === "true";
      }
    }
  }

  handleCollapse = (e: MouseEvent) => {
    if (this.expanded) {
      this.expanded = false;
      e.stopPropagation();
    }
  }

  render() {
    return html`
      <div @click="${() => (!this.expanded ? (this.expanded = true) : '')}">
        <slot name="header" class="header" @click="${this.handleCollapse}">
          <div>
            <p class="caption">${this.caption}</p>
            <p class="description">${this.description}</p>
          </div>
          <div class="header__right">
            <slot name="label"><p class="label">${this.label}</p></slot>
            <zn-icon library="material-outlined" src="expand_more" class="expand"></zn-icon>
          </div>
        </slot>
        <div class="content">
          <slot></slot>
        </div>
      </div>`;
  }
}
