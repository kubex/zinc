import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {deepQuerySelectorAll} from "../../utilities/query";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {md5} from "../../utilities/md5";
import {property} from 'lit/decorators.js';
import {Store} from "../../internal/storage";
import ZincElement from '../../internal/zinc-element';

import styles from './tabs.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/tabs
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
export default class ZnTabs extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  @property({attribute: 'master-id', reflect: true}) masterId: string;
  @property({attribute: 'default-uri', reflect: true}) defaultUri = '';
  @property({attribute: 'active', reflect: true}) _current = '';
  @property({attribute: 'split', type: Number, reflect: true}) _split: number;
  @property({attribute: 'split-min', type: Number, reflect: true}) _splitMin = 60;
  @property({attribute: 'split-max', type: Number, reflect: true}) _splitMax: number;
  @property({attribute: 'primary-caption', reflect: true}) primaryCaption = 'Navigation';
  @property({attribute: 'secondary-caption', reflect: true}) secondaryCaption = 'Content';
  @property({attribute: 'no-prefetch', type: Boolean, reflect: true}) noPrefetch = false;
  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;
  @property({attribute: 'store-key'}) storeKey: string;
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;
  @property({attribute: 'padded', type: Boolean, reflect: true}) padded = false;
  @property({attribute: 'fetch-style', type: String, reflect: true}) fetchStyle = "";
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth = false;
  @property({attribute: 'padded-right', type: Boolean, reflect: true}) paddedRight = false;
  @property() monitor: string;
  // Creating a header
  @property() caption: string;
  @property() description: string;
  protected preload = true;
  protected _store: Store;
  protected _activeClicks = 0;
  private _panel: Element | null | undefined;
  private _panels: Map<string, Element[]>;
  private _tabs: HTMLElement[] = [];
  private _actions: HTMLElement[] = [];
  private _knownUri: Map<string, string> = new Map<string, string>();
  private readonly hasSlotController = new HasSlotController(this, '[default]', 'bottom', 'right', 'left', 'top', 'actions');

  constructor() {
    super();
    this._panels = new Map<string, Element[]>();
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.masterId) {
      this.masterId = this.storeKey || Math.floor(Math.random() * 1000000).toString();
    }

    this.preload = !this.noPrefetch;

    await this.updateComplete;
    this._panel = this.shadowRoot?.querySelector('#content');
    this.observerDom();
    this._registerTabs();

    if (this.storeKey && this.storeTtl === 0) {
      // Default tab storage to 5 minutes
      this.storeTtl = 300;
    }

    const defaultID = this.defaultUri ? this._uriToId(this.defaultUri) : '';

    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "zntab:", this.storeTtl);
    Array.from(this.children).forEach((element) => {
      if (element.slot === '') {
        this._panels.set(element.getAttribute('id') || defaultID, [element]);
      }
    });

    this.observerDom();
    this.monitorDom();
  }

  monitorDom() {
    if (this.monitor) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement && node.id === this.monitor) {
                this.reRegisterTabs();

                const storedValue = this._store.get(this.storeKey);
                if (storedValue !== null) {
                  this._prepareTab(storedValue);
                  this.setActiveTab(storedValue, false, false);
                }
              }
            });
          }
        });
      });

      observer.observe(this, {childList: true, subtree: true});
    }
  }

  _addPanel(panel: HTMLElement) {
    if (this._panels.has(panel.getAttribute('id')!)) {
      return;
    }
    this._panels.set(panel.getAttribute('id')!, [panel]);
  }

  _addTab(tab: HTMLElement) {
    if (this._tabs.includes(tab)) {
      return;
    }
    this._tabs.push(tab);
    if (this.preload) {
      tab.addEventListener('mouseover', this.fetchUriTab.bind(this, tab));
    }
    tab.addEventListener('click', this._handleClick.bind(this));
  }

  reRegisterTabs = () => {
    this._registerTabs();
  }

  firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    setTimeout(() => {
      this._registerTabs();

      const storedValue = this._store.get(this.storeKey);
      if (storedValue !== null) {
        this._prepareTab(storedValue);
        this.setActiveTab(storedValue, false, false);
        return;
      }

      const defaultTab = this._current || '';
      if (!this._panels.has(defaultTab) && this._tabs.length > 0) {
        const tabUri = this._tabs[0].getAttribute('tab-uri');
        if (tabUri) {
          this.clickTab(this._tabs[0], false);
          return;
        }
      }

      this.setActiveTab(defaultTab, false, false);
    }, 10);

    this.addEventListener('zn-menu-select', () => {
      setTimeout(this.reRegisterTabs, 200);
    }, {passive: true});
  }

  nextTab() {
    console.log("Select next tab")
  }

  previousTab() {
    console.log("Select previous tab")
  }

  _prepareTab(tabId: string) {
    for (const tab of this._tabs) {
      if (tab.getAttribute('tab') === tabId) {
        return;
      }
    }

    for (const uriTab of deepQuerySelectorAll("[tab-uri]", this, '')) {
      const uri: string = uriTab.getAttribute("tab-uri")!;
      const eleTabId = this._uriToId(uri);
      if (eleTabId === tabId) {
        this._createUriPanel(uriTab, uri, eleTabId);
        // do not break, as multiple tabs can have the same uri
      }
    }
  }

  _uriToId(tabUri: string): string {
    return "tab-" + md5(tabUri).substr(0, 8) + "-" + this.masterId;
  }

  _createUriPanel(tabEle: Element, tabUri: string, tabId: string): HTMLDivElement {
    if (!tabEle.hasAttribute('tab')) {
      tabEle.setAttribute('tab', tabId);
      this._setTabEleActive(tabEle, this._current === tabId);
    }

    if (!this._knownUri.has(tabUri)) {
      this._knownUri.set(tabUri, tabId);
    }

    if (this._panels.has(tabId) && this._panels.get(tabId) !== undefined) {
      return this._panels.get(tabId)![0] as HTMLDivElement;
    }

    const tabNode = document.createElement('div');
    tabNode.setAttribute("id", tabId);
    if (this.fetchStyle !== "") {
      tabNode.setAttribute("data-fetch-style", this.fetchStyle);
    }
    tabNode.setAttribute('data-self-uri', tabUri);
    tabNode.textContent = "Loading ...";
    if (this._panel instanceof HTMLElement) {
      // Append the tab if the panel has not yet been constructed
      this._panel.appendChild(tabNode);
      this._panels.set(tabId, [tabNode]);
    }
    document.dispatchEvent(new CustomEvent('zn-new-element', {
      detail: {element: tabNode, source: tabEle}
    }));
    return tabNode;
  }

  _handleClick(event: PointerEvent) {
    // ts-ignore
    const target = (event.relatedTarget ?? event.target) as HTMLElement;
    if (target) {
      this.clickTab(target, event.altKey);
    }
  }

  fetchUriTab(target: HTMLElement) {
    if (!target.hasAttribute('tab') && target.hasAttribute('tab-uri')) {
      const tabUri: string | null = target.getAttribute("tab-uri") ?? "";
      this._createUriPanel(target, tabUri, this._uriToId(tabUri));
    }
  }

  clickTab(target: HTMLElement, refresh: boolean) {
    this.fetchUriTab(target);

    if (target.hasAttribute('tab')) {
      setTimeout(() => {
        this.setActiveTab(target.getAttribute('tab') || '', true, refresh, this.getRefTab(target));
      }, 10);
    }
  }

  getRefTab(target: HTMLElement) {
    let parent: Element = target;
    while (parent) {
      if (parent === this) {
        return null;
      }
      if (parent.hasAttribute('ref-tab')) {
        return parent.getAttribute('ref-tab');
      }
      // @ts-expect-error host might exist
      parent = (parent?.parentElement as Element) || parent?.getRootNode()?.host;
    }
    return null;
  }

  setActiveTab(tabName: string, store: boolean, refresh: boolean, refTab: string | null = null) {
    let hasActive = false;
    this._tabs.forEach(tab => {


      if (tab.hasAttribute('tab-uri') && this._knownUri.has(tab.getAttribute('tab-uri')!)) {
        tab.setAttribute('tab', this._knownUri.get(tab.getAttribute('tab-uri')!)!);
      }

      let setActive = tabName === tab.getAttribute('tab');
      if (!setActive && refTab && !this.getRefTab(tab)) {
        setActive = refTab === tab.getAttribute('tab');
      }
      hasActive = hasActive || setActive;
      this._setTabEleActive(tab, setActive);
    });
    if (!hasActive && this._tabs.length > 0) {
      this._setTabEleActive(this._tabs[0], true);
    }
    this._actions.forEach(action => this._setTabEleActive(action, action.getAttribute('ref-tab') === (refTab || tabName)));
    this.selectTab(tabName, refresh);

    //Set on the element as a failsafe before TabPanel is loaded
    //This must be done AFTER selectTab to avoid panel bugs

    if (store && this._store !== null) {
      this._store.set(this.storeKey, tabName);
    }
  }

  _setTabEleActive(ele: Element, active: boolean) {
    ele.classList.toggle('zn-tb-active', active);
    ele.classList.toggle('active', active);
  }

  selectTab(tabName: string, refresh: boolean): boolean {
    if (tabName && !this._panels.has(tabName)) {
      return false;
    }

    // Multi click on an active tab will refresh the tab
    if (this._current === tabName) {
      this._activeClicks++;
      if (this._activeClicks > 2) {
        refresh = true;
        this._activeClicks = 0;
      }
    } else {
      this._activeClicks = 0;
    }

    let inSlot = true;
    this._panels.forEach((elements, key) => {
      const isActive = key === tabName;
      elements.forEach((element) => {
        if (isActive && element.parentNode !== this) {
          inSlot = false;
        }
        element.toggleAttribute('selected', isActive);
        if (isActive && refresh) {
          document.dispatchEvent(new CustomEvent('zn-refresh-element', {
            detail: {element: element}
          }));
        }
      });
    });

    if (this._panel) {
      this._panel.classList.toggle('contents-slot', !inSlot);
    }

    this._current = tabName;

    return true;
  }

  getActiveTab(): Element[] {
    return this._panels.get(this._current) || [];
  }

  observerDom() {
    // observe the DOM for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          if (mutation.addedNodes.length > 0) {
            this._registerTabs();
          }
          if (mutation.removedNodes.length > 0) {
            for (let i = 0; i < mutation.removedNodes.length; i++) {
              const node = mutation.removedNodes[i] as HTMLElement;
              if (node.id) {
                this.removeTabAndPanel(node.id);
              }
            }
          }
        }
      });
    });

    observer.observe(this, {
      childList: true,
      subtree: true
    });
  }

  removeTabAndPanel(tabId: string) {
    if (this._panels.has(tabId)) {
      this._panels.delete(tabId);
    }

    for (const tab of this._tabs) {
      if (tab.getAttribute('tab') === tabId) {
        tab.remove();
        this._tabs.splice(this._tabs.indexOf(tab), 1);
      }
    }

    if (this._current === tabId) {
      this.setActiveTab('', true, false);
    }
  }

  _registerTabs = () => {
    deepQuerySelectorAll('[tab]', this, 'zn-tabs').forEach(ele => {
      this._addTab(ele as HTMLElement);
    });

    deepQuerySelectorAll('[tab-uri]', this, 'zn-tabs').forEach(ele => {
      if (ele.getAttribute('tab-uri') === "") {
        ele.setAttribute('tab', "");
        ele.removeAttribute('tab-uri');
      }
      this._addTab(ele as HTMLElement);
    });

    deepQuerySelectorAll('[ref-tab-uri]', this, 'zn-tabs').forEach(ele => {
      if (!ele.hasAttribute('ref-tab')) {
        ele.setAttribute('ref-tab', this._uriToId(ele.getAttribute('ref-tab-uri')!));
        ele.removeAttribute('ref-tab-uri');
        this._actions.push(ele as HTMLElement);
      }
    });
  }

  render() {
    const hasActionSlot = this.hasSlotController.test('actions');
    const hasCaption = this.caption && this.caption.length > 0;
    const hasDescription = this.description && this.description.length > 0;
    const hasHeader = hasCaption || hasActionSlot || hasDescription;

    if (this._split > 0) {
      let storeKey: string | null = this.storeKey;
      if (storeKey) {
        storeKey += "-split";
      }

      let contentSlot = 'secondary';
      if (this.querySelectorAll('[slot="right"]').length > 0) {
        contentSlot = 'primary';
      }

      return html`
        <slot name="top"></slot>
        <div id="mid">
          <zn-split-pane
            primary-caption="${this.primaryCaption}"
            secondary-caption="${this.secondaryCaption}"
            store-key="${storeKey}"
            padded="${ifDefined(this.padded ? true : undefined)}"
            padded-right="${ifDefined(this.paddedRight ? true : undefined)}"
            pixels bordered
            min-size="${this._splitMin}"
            max-size="${ifDefined(this._splitMax ? this._splitMax : undefined)}"
            initial-size="${this._split}">
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
      <div class="tabs">
        ${hasHeader ? html`
          <zn-header caption="${ifDefined(this.caption)}" description="${ifDefined(this.description)}" transparent>
            <slot name="actions" slot="actions"></slot>
          </zn-header>` : null}
        <slot name="top"></slot>
        <div id="mid" part="mid">
          <slot name="left"></slot>
          <div id="content">
            <slot></slot>
          </div>
          <slot name="right"></slot>
        </div>
        <slot name="bottom"></slot>
      </div>
    `;
  }
}
