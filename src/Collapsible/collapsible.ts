import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement} from "../zinc-element";
import {Store} from "../storage";

@customElement('zn-collapsible')
export class Collapsible extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'caption', type: String, reflect: true}) caption: string;
  @property({attribute: 'open', type: Boolean, reflect: true}) open: boolean;
  @property({attribute: 'default', type: String}) defaultState: string;

  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;
  protected _store: Store;

  connectedCallback()
  {
    super.connectedCallback();
    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "znclap:", this.storeTtl);
    this.open = this.defaultState == 'open';

    if(this.storeKey)
    {
      const hasPref = this._store.get(this.storeKey);
      if(hasPref != null)
      {
        this.open = hasPref == "true";
      }
    }
  }

  public toggle()
  {
    this.open = !this.open;
    if(this._store)
    {
      this._store.set(this.storeKey, this.open ? "true" : "false");
    }
  }

  protected render(): unknown
  {
    return html`
      <div @click="${this.toggle}" class="caption">${this.caption}
        <slot name="caption"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>`;
  }
}


