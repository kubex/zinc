import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import {TabPanel} from "./tab-panel";
import {md5} from '../md5';

import styles from './tabs.scss';
import {deepQuerySelectorAll} from "../query";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-tabs')
export class Tabs extends LitElement
{
  private _panel: HTMLElement;
  private _panels: Map<string, Element[]>;
  private _tabs: HTMLElement[];
  @property({attribute: 'active', type: String, reflect: true}) _current = '';
  private storage: Storage;

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();
    this._tabs = [];
    this._panels = new Map<string, Element[]>();
  }

  connectedCallback()
  {
    super.connectedCallback();
    this._panel = this.querySelector('#content');
    this.observerDom();
    this._registerTabs();

    this.storage = this.localStorage ? window.localStorage : window.sessionStorage;
    if(this._panel === null)
    {
      console.error("No zn-tab-panel found in zn-tabs", this);
      return;
    }

    this.observerDom();
  }

  _addTab(tab: HTMLElement)
  {
    if(this._tabs.includes(tab))
    {
      return;
    }
    this._tabs.push(tab);
    tab.addEventListener('click', this._handleClick.bind(this));
  }

  firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    setTimeout(() =>
    {
      this._registerTabs();

      if(this.storeKey !== "" && this.storeKey !== null)
      {
        const storedValue = this.storage.getItem('zntab:' + this.storeKey);
        if(storedValue != null && storedValue != "")
        {
          this._prepareTab(storedValue);
          this.setActiveTab(storedValue, false, false);
        }
      }
    }, 100);
  }

  _prepareTab(tabId: string)
  {
    for(let i = 0; i < this._tabs.length; i++)
      for(let i = 0; i < this._tabs.length; i++)
      {
        if(this._tabs[i].getAttribute('tab') == tabId)
        {
          return;
        }
      }

    const uriTabs = deepQuerySelectorAll("[tab-uri]", this, '');
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
    if(this._panel instanceof HTMLElement)
    {
      // Append the tab if the panel has not yet been constructed
      this._panel.appendChild(tabNode);
    }
    tabEle.setAttribute('tab', tabId);
    document.dispatchEvent(new CustomEvent('zn-new-element', {
      detail: {element: tabNode}
    }));
    return tabNode;
  }

  _handleClick(event: PointerEvent)
  {
    // ts-ignore
    const target = (event.selectedTarget ?? event.target) as HTMLElement;
    if(target)
    {
      if(!target.hasAttribute('tab') && target.hasAttribute('tab-uri'))
      {
        const tabUri = target.getAttribute("tab-uri");
        this._createUriPanel(target, tabUri, this._uriToId(tabUri));
      }
      if(target.hasAttribute('tab'))
      {
        setTimeout(() =>
        {
          this.setActiveTab(target.getAttribute('tab') || '', true, event.altKey);
        }, 10);
      }
    }
  }

  setActiveTab(tabName: string, store: boolean, refresh: boolean)
  {
    this._tabs.forEach(tab => tab.classList.toggle('zn-tb-active', tab.getAttribute('tab') === tabName));
    this.selectTab(tabName, refresh);

    //Set on the element as a failsafe before TabPanel is loaded
    //This must be done AFTER selectTab to avoid panel bugs
    this._panel.setAttribute('active', tabName);

    if(store && this.storeKey != null && this.storeKey != "")
    {
      this.storage.setItem('zntab:' + this.storeKey, tabName);
    }
  }

  selectTab(tabName: string, refresh: boolean): boolean
  {
    if(tabName && !this._panels.has(tabName))
    {
      return false;
    }

    this._panels.forEach((elements, key) =>
    {
      const isActive = key === tabName;
      elements.forEach((element) =>
      {
        element.toggleAttribute('selected', isActive);
        if(refresh)
        {
          document.dispatchEvent(new CustomEvent('zn-refresh-element', {
            detail: {element: element}
          }));
        }
      });
    });

    this._current = tabName;

    return true;
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
          this._registerTabs();
        }
      });
    });

    observer.observe(this, {
      childList: true,
      subtree: true
    });
  }

  _registerTabs()
  {
    deepQuerySelectorAll('[tab]', this, 'zn-tabs').forEach(ele =>
    {
      this._addTab(ele as HTMLElement);
    });
    deepQuerySelectorAll('[tab-uri]', this, 'zn-tabs').forEach(ele =>
    {
      this._addTab(ele as HTMLElement);
    });
  }

  render()
  {
    return html`
      <slot name="top"></slot>
      <div id="mid">
        <slot name="left"></slot>
        <div id="content">
          <slot></slot>
        </div>
        <slot name="right"></slot>
      </div>
      <slot name="bottom"></slot>
    `;
  }
}


