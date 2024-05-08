import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {md5} from '../md5';
import {Store} from '../storage';

import styles from './index.scss?inline';
import {deepQuerySelectorAll} from "../query";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-tabs')
export class Tabs extends LitElement
{
  private _panel: HTMLElement;
  private _panels: Map<string, Element[]>;
  private _tabs: HTMLElement[];
  @property({attribute: 'active', type: String, reflect: true}) _current = '';
  @property({attribute: 'split', type: Number, reflect: true}) _split;
  @property({attribute: 'split-min', type: Number, reflect: true}) _splitMin = 60;
  private storage: Storage;

  @property({attribute: 'primary-caption', type: String, reflect: true}) primaryCaption = 'Navigation';
  @property({attribute: 'secondary-caption', type: String, reflect: true}) secondaryCaption = 'Content';

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;

  static styles = unsafeCSS(styles);
  protected _store: Store;

  constructor()
  {
    super();
    this._tabs = [];
    this._panels = new Map<string, Element[]>();
  }

  async connectedCallback()
  {
    super.connectedCallback();
    await this.updateComplete;
    this._panel = this.shadowRoot.querySelector('#content');
    this.observerDom();
    this._registerTabs();

    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "zntab:", this.storeTtl);
    Array.from(this.children).forEach((element) =>
    {
      if(element.slot == '')
      {
        this._panels.set(element.getAttribute('id') || '', [element]);
      }
    });

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


      const storedValue = this._store.get(this.storeKey);
      if(storedValue != null)
      {
        this._prepareTab(storedValue);
        this.setActiveTab(storedValue, false, false);
        return;
      }
      this.setActiveTab(this._current || '', false, false);
    }, 10);
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
      this._panels.set(tabId, [tabNode]);
    }
    tabEle.setAttribute('tab', tabId);
    document.dispatchEvent(new CustomEvent('zn-new-element', {
      detail: {element: tabNode, source: tabEle}
    }));
    return tabNode;
  }

  _handleClick(event: PointerEvent)
  {
    // ts-ignore
    const target = (event.relatedTarget ?? event.target) as HTMLElement;
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

    if(store && this._store != null)
    {
      this._store.set(this.storeKey, tabName);
    }
  }

  selectTab(tabName: string, refresh: boolean): boolean
  {
    if(tabName && !this._panels.has(tabName))
    {
      return false;
    }

    let inSlot = true;
    this._panels.forEach((elements, key) =>
    {
      const isActive = key === tabName;
      elements.forEach((element) =>
      {
        if(isActive && element.parentNode != this)
        {
          inSlot = false;
        }
        element.toggleAttribute('selected', isActive);
        if(refresh)
        {
          document.dispatchEvent(new CustomEvent('zn-refresh-element', {
            detail: {element: element}
          }));
        }
      });
    });

    this._panel.classList.toggle('contents-slot', !inSlot);

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
    if(this._split > 0)
    {
      let storeKey = this.storeKey;
      if(storeKey)
      {
        storeKey = storeKey + "-split";
      }
      return html`
        <slot name="top"></slot>
        <div id="mid">
          <zn-split-pane
            primary-caption="${this.primaryCaption}"
            secondary-caption="${this.secondaryCaption}"
            store-key="${storeKey}"
            pixels bordered
            min-size="${this._splitMin}"
          " initial-size="${this._split}">
          <slot slot="primary" name="left"></slot>
          <div id="content" slot="secondary">
            <slot></slot>
          </div>
          <slot name="right"></slot>
          </zn-split-pane>
        </div>
        <slot name="bottom"></slot>
      `;
    }
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


