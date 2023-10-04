import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

@customElement('zn-collapsible')
export class Collapsible extends ZincElement
{
  static styles = unsafeCSS(styles);

  private storage: Storage;
  private storageKey: string;

  @property({attribute: 'store-key', type: String, reflect: true}) storeKey: string;
  @property({attribute: 'caption', type: String, reflect: true}) caption: string;
  @property({attribute: 'open', type: Boolean, reflect: true}) open: boolean;
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;

  connectedCallback()
  {
    super.connectedCallback();
    this.storage = this.localStorage ? window.localStorage : window.sessionStorage;

    if(this.storeKey)
    {
      this.storageKey = "zncpse:" + this.storeKey;
      let hasPref = this.storage.getItem(this.storageKey);
      if(hasPref != "")
      {
        this.open = hasPref == "true";
      }
    }
  }

  public toggle()
  {
    this.open = !this.open;
    if(this.storageKey)
    {
      this.storage.setItem(this.storageKey, this.open ? "true" : "false");
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


