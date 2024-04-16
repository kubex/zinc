import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { TabPanel } from "./tab-panel";
import { md5 } from '../md5';

import styles from './tabs.scss';

@customElement('zn-tabs')
export class Tabs extends LitElement
{
  private _panel: TabPanel | HTMLElement;
  private _tabs: HTMLElement[];
  private storage: Storage;

  // session storage if not local
  @property({ attribute: 'local-storage', type: Boolean, reflect: true }) localStorage;
  @property({ attribute: 'store-key', type: String, reflect: true }) storeKey = null;

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();
    this._tabs = [];
    this.querySelectorAll('[tab]').forEach(ele =>
    {
      this._addTab(ele as HTMLElement);
    });
    this.querySelectorAll('[tab-uri]').forEach(ele =>
    {
      this._addTab(ele as HTMLElement);
    });
    this.querySelectorAll('zn-tab-panel').forEach((element) =>
    {
      this._panel = element as TabPanel;
    });

    if(this._panel == null)
    {
      console.error("No zn-tab-panel found in zn-tabs", this);
      return;
    }
  }

  _addTab(tab: HTMLElement)
  {
    this._tabs.push(tab);
    tab.addEventListener('click', this._handleClick.bind(this));
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
        this._prepareTab(storedValue);
        this.setActiveTab(storedValue, false, false);
      }
    }

    this.observerDom();
  }

  _prepareTab(tabId: string)
  {
    for(let i = 0; i < this._tabs.length; i++)
    {
      if(this._tabs[i].getAttribute('tab') == tabId)
      {
        return;
      }
    }

    const uriTabs = this.querySelectorAll("[tab-uri]");
    for(let i = 0; i < uriTabs.length; i++)
    {
      const uri = uriTabs[i].getAttribute("tab-uri");
      const eleTabId = this._uriToId(uri);
      if(eleTabId == tabId)
      {
        this._createUriPanel(uriTabs[i], uri, eleTabId);
        break;
      }
    }
  }

  _uriToId(tabUri: string): string
  {
    return "tab-" + md5(tabUri).substr(0, 8);
  }

  _createUriPanel(tabEle: Element, tabUri: string, tabId: string): HTMLDivElement
  {
    const tabNode = document.createElement('div');
    tabNode.setAttribute("id", tabId);
    tabNode.setAttribute('data-self-uri', tabUri);
    tabNode.textContent = "Loading ...";
    if(this._panel instanceof TabPanel)
    {
      this._panel.addPanel(tabId, tabNode);
    }
    else if(this._panel instanceof HTMLElement)
    {
      // Append the tab if the panel has not yet been constructed
      this._panel.appendChild(tabNode);
    }
    tabEle.setAttribute('tab', tabId);
    document.dispatchEvent(new CustomEvent('zn-new-element', {
      detail: { element: tabNode }
    }));
    return tabNode;
  }

  _handleClick(event: MouseEvent)
  {
    if(event.target instanceof HTMLElement)
    {
      const target = event.target as HTMLElement;
      if(!target.hasAttribute('tab') && target.hasAttribute('tab-uri'))
      {
        const tabUri = target.getAttribute("tab-uri");
        this._createUriPanel(target, tabUri, this._uriToId(tabUri));
      }
      if(target.hasAttribute('tab'))
      {
        this.setActiveTab(target.getAttribute('tab') || '', true, event.altKey);
      }
    }
  }

  setActiveTab(tabName: string, store: boolean, refresh: boolean)
  {
    this._tabs.forEach(tab => tab.classList.toggle('zn-tb-active', tab.getAttribute('tab') === tabName));
    if(this._panel instanceof TabPanel)
    {
      this._panel.selectTab(tabName, refresh);
    }

    //Set on the element as a failsafe before TabPanel is loaded
    //This must be done AFTER selectTab to avoid panel bugs
    this._panel.setAttribute('active', tabName);

    if(store && this.storeKey != null && this.storeKey != "")
    {
      this.storage.setItem('zntab:' + this.storeKey, tabName);
    }
  }

  observerDom()
  {
    // observe the DOM for changes
    const observer = new MutationObserver((mutations) =>
    {
      mutations.forEach((mutation) =>
      {
        if(mutation.type === 'childList')
        {
          this.querySelectorAll('[tab]').forEach(ele =>
          {
            this._addTab(ele as HTMLElement);
          });
          this.querySelectorAll('[tab-uri]').forEach(ele =>
          {
            this._addTab(ele as HTMLElement);
          });
          this.querySelectorAll('zn-tab-panel').forEach((element) =>
          {
            this._panel = element as TabPanel;
          });
        }
      });
    });

    observer.observe(this, {
      childList: true,
      subtree: true
    });
  }


  render()
  {
    return html`
      <slot></slot>`;
  }
}


