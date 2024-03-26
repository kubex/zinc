import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {TabPanel} from "./tab-panel";

import styles from './tabs.scss';

@customElement('zn-tabs')
export class Tabs extends LitElement
{
  private _panel: TabPanel;
  private storage: Storage;

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();
    this.querySelectorAll('zn-tab-panel').forEach((element) =>
    {
      this._panel = element as TabPanel;
    });

    if(this._panel == null)
    {
      console.error("No zn-tab-panel found in zn-tabs", this);
      return;
    }

    this.addEventListener('click', this._handleClick);
  }

  connectedCallback()
  {
    super.connectedCallback();

    this.storage = this.localStorage ? window.localStorage : window.sessionStorage;
    console.log(this._panel);
    if(this._panel == null)
    {
      console.error("No zn-tab-panel found in zn-tabs", this);
      return;
    }

    if(this.storeKey != "" && this.storeKey != null)
    {
      let storedValue = this.storage.getItem('zntab:' + this.storeKey);
      if(storedValue != null && storedValue != "")
      {
        this._panel.setAttribute('active', storedValue);
        if(this._panel instanceof TabPanel)
        {
          this._panel.selectTab(storedValue);
        }
      }
    }
  }


  _handleClick(event: MouseEvent)
  {
    if(event.target instanceof HTMLElement)
    {
      const target = event.target as HTMLElement;
      if(target.hasAttribute('tab'))
      {
        const tabName = target.getAttribute('tab') || '';
        this._panel.selectTab(tabName);

        if(this.storeKey != null && this.storeKey != "")
        {
          this.storage.setItem('zntab:' + this.storeKey, tabName);
        }
      }
    }
  };


  render()
  {
    return html`
      <slot></slot>
    `;
  }
}


