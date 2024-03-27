import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { TabPanel } from "./tab-panel";

import styles from './tabs.scss';

@customElement('zn-tabs')
export class Tabs extends LitElement
{
  private _panel: TabPanel;
  private _tabs: HTMLElement[];
  private storage: Storage;

  // session storage if not local
  @property({ attribute: 'local-storage', type: Boolean, reflect: true }) localStorage;
  @property({ attribute: 'store-key', type: String, reflect: true }) storeKey = null;

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();
    this._tabs = Array.from(this.querySelectorAll('[tab]'));
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
    if(this._panel === null)
    {
      console.error("No zn-tab-panel found in zn-tabs", this);
      return;
    }

    if(this.storeKey !== "" && this.storeKey !== null)
    {
      const storedValue = this.storage.getItem('zntab:' + this.storeKey);
      if(storedValue != null && storedValue != "")
      {
        const tab = this._tabs.find(tab => tab.getAttribute('tab') == storedValue);
        this._panel.setAttribute('active', storedValue);
        this._tabs.forEach(tab => tab.style.backgroundColor = 'transparent');
        tab.style.backgroundColor = 'rgb(var(--zn-panel))';

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

        this._tabs.forEach(tab => tab.style.backgroundColor = 'transparent');
        target.style.backgroundColor = 'rgb(var(--zn-panel))';

        if(this.storeKey != null && this.storeKey != "")
        {
          this.storage.setItem('zntab:' + this.storeKey, tabName);
        }
      }
    }
  }

  render()
  {
    return html`
      <slot></slot>
    `;
  }
}


