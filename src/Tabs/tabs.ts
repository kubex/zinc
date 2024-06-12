import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {md5} from '../md5';
import {Store} from '../storage';

import styles from './index.scss?inline';
import {deepQuerySelectorAll} from "../query";
import {PropertyValues} from "@lit/reactive-element";
import {ZincElement} from "@/zinc-element";

@customElement('zn-tabs')
export class Tabs extends ZincElement
{
  private _panel: HTMLElement;
  private _panels: Map<string, Element[]>;
  private _tabs: HTMLElement[] = [];
  private _actions: HTMLElement[] = [];
  private _knownUri: Map<string, string> = new Map<string, string>();

  @property({attribute: 'master-id', type: String, reflect: true}) masterId = '';

  @property({attribute: 'caption', type: String, reflect: true}) caption = '';
  @property({attribute: 'header', type: String, reflect: true}) header = '';

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
  protected _activeClicks = 0;

  constructor()
  {
    super();
    this._panels = new Map<string, Element[]>();
  }

  async connectedCallback()
  {
    super.connectedCallback();

    if(this.masterId == '')
    {
      this.masterId = this.storeKey || Math.floor(Math.random() * 1000000).toString();
    }

    await this.updateComplete;
    this._panel = this.shadowRoot.querySelector('#content');
    this.observerDom();
    this._registerTabs();

    if(this.storeKey && this.storeTtl == 0)
    {
      // Default tab storage to 5 minutes
      this.storeTtl = 300;
    }

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
    tab.addEventListener('mouseover', this.fetchUriTab.bind(this, tab));
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

      const defaultTab = this._current || '';
      if(!this._panels.has(defaultTab) && this._tabs.length > 0)
      {
        let tabUri = this._tabs[0].getAttribute('tab-uri');
        if(tabUri)
        {
          this.clickTab(this._tabs[0], false);
          return;
        }
      }

      this.setActiveTab(defaultTab, false, false);
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
        // do not break, as multiple tabs can have the same uri
      }
    }
  }

  _uriToId(tabUri: string): string
  {
    return "tab-" + md5(tabUri).substr(0, 8) + "-" + this.masterId;
  }

  _createUriPanel(tabEle: Element, tabUri: string, tabId: string): HTMLDivElement
  {
    if(!tabEle.hasAttribute('tab'))
    {
      tabEle.setAttribute('tab', tabId);
      tabEle.classList.toggle('zn-tb-active', this._current == tabId);
    }

    if(!this._knownUri.has(tabUri))
    {
      this._knownUri.set(tabUri, tabId);
    }

    if(this._panels.has(tabId))
    {
      return this._panels.get(tabId)[0] as HTMLDivElement;
    }

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
      this.clickTab(target, event.altKey);
    }
  }

  fetchUriTab(target: HTMLElement)
  {
    if(!target.hasAttribute('tab') && target.hasAttribute('tab-uri'))
    {
      const tabUri = target.getAttribute("tab-uri");
      this._createUriPanel(target, tabUri, this._uriToId(tabUri));
    }
  }

  clickTab(target: HTMLElement, refresh: boolean)
  {
    this.fetchUriTab(target);

    if(target.hasAttribute('tab'))
    {
      setTimeout(() =>
      {
        this.setActiveTab(target.getAttribute('tab') || '', true, refresh, this.getRefTab(target));
      }, 10);
    }
  }

  getRefTab(target: HTMLElement)
  {
    let parent: Element = target;
    while (parent)
    {
      if(parent == this)
      {
        return null;
      }
      if(parent.hasAttribute('ref-tab'))
      {
        return parent.getAttribute('ref-tab');
      }
      // @ts-ignore
      parent = parent?.parentElement || parent?.getRootNode()?.host;
    }
    return null;
  }

  setActiveTab(tabName: string, store: boolean, refresh: boolean, refTab: string = null)
  {
    this._tabs.forEach(tab =>
    {
      if(tab.hasAttribute('tab-uri') && this._knownUri.has(tab.getAttribute('tab-uri')))
      {
        tab.setAttribute('tab', this._knownUri.get(tab.getAttribute('tab-uri')));
      }

      let setActive = tabName == tab.getAttribute('tab');
      if(!setActive && refTab && !this.getRefTab(tab))
      {
        setActive = refTab == tab.getAttribute('tab');
      }
      tab.classList.toggle('zn-tb-active', setActive);
    });
    this._actions.forEach(action => action.classList.toggle('zn-tb-active', action.getAttribute('ref-tab') === (refTab || tabName)));
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

    // Multi click on an active tab will refresh the tab
    if(this._current == tabName)
    {
      this._activeClicks++;
      if(this._activeClicks > 2)
      {
        refresh = true;
        this._activeClicks = 0;
      }
    }
    else
    {
      this._activeClicks = 0;
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
        if(isActive && refresh)
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

    deepQuerySelectorAll('[ref-tab-uri]', this, 'zn-tabs').forEach(ele =>
    {
      if(!ele.hasAttribute('ref-tab'))
      {
        ele.setAttribute('ref-tab', this._uriToId(ele.getAttribute('ref-tab-uri')));
        ele.removeAttribute('ref-tab-uri');
        this._actions.push(ele as HTMLElement);
      }
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

      let contentSlot = 'secondary';
      if(this.querySelectorAll('[slot="right"]').length > 0)
      {
        contentSlot = 'primary';
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
          <div id="content" slot="${contentSlot}">
            <slot></slot>
          </div>
          <slot slot="secondary" name="right"></slot>
          </zn-split-pane>
        </div>
        <slot name="bottom"></slot>
      `;
    }

    return html`
      <div id="header">
        ${this.header ? html`<h1>${this.header}</h1>` : ''}
        ${this.caption ? html`<h2>${this.caption}</h2>` : ''}
        <div id="actions">
          <slot name="actions"></slot>
        </div>
      </div>
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


