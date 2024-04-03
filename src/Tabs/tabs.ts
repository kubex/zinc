import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {TabPanel} from "./tab-panel";
import {md5} from '../md5';

import styles from './tabs.scss';

@customElement('zn-tabs')
export class Tabs extends LitElement
{
  private _panel: TabPanel;
  private _tabs: HTMLElement[];
  private storage: Storage;

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;

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
        this.setActiveTab(storedValue, false);
      }
    }
  }


  _handleClick(event: MouseEvent)
  {
    if(event.target instanceof HTMLElement)
    {
      const target = event.target as HTMLElement;
      if(!target.hasAttribute('tab') && target.hasAttribute('tab-uri'))
      {
        const tabUri = target.getAttribute("tab-uri");
        const tabId = "tab-" + md5(tabUri).substr(0, 8);
        let tabNode = document.createElement('div');
        tabNode.setAttribute("id", tabId);
        tabNode.setAttribute('data-self-uri', tabUri);
        tabNode.textContent = "Loading ...";
        this._tabs.push(tabNode);
        if(this._panel instanceof TabPanel)
        {
          this._panel.addPanel(tabId, tabNode);
        }
        target.setAttribute('tab', tabId);
        document.dispatchEvent(new CustomEvent('zn-new-element', {
          detail: {element: tabNode}
        }));
      }


      if(target.hasAttribute('tab'))
      {
        this.setActiveTab(target.getAttribute('tab') || '', true);
      }
    }
  }

  setActiveTab(tabName: string, store: boolean)
  {
    this._tabs.forEach(tab => tab.classList.toggle('zn-tab-active', tab.getAttribute('tab') === tabName));
    if(this._panel instanceof TabPanel)
    {
      this._panel.selectTab(tabName);
    }

    //Set on the element as a failsafe before TabPanel is loaded
    //This must be done AFTER selectTab to avoid panel bugs
    this._panel.setAttribute('active', tabName);

    if(store && this.storeKey != null && this.storeKey != "")
    {
      this.storage.setItem('zntab:' + this.storeKey, tabName);
    }
  }

  render()
  {
    return html`
      <slot></slot>
    `;
  }
}


