import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {deepQuerySelectorAll} from "../../utilities/query";
import {md5} from "../../utilities/md5";
import {property} from 'lit/decorators.js';
import {styleMap} from "lit/directives/style-map.js";
import ZincElement from '../../internal/zinc-element';

import styles from './expanding-action.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/expanding-action
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
export default class ZnExpandingAction extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() icon: string;

  @property() method: 'drop' | 'fill' = 'drop';

  @property({reflect: true}) count: string;

  @property({type: Boolean}) prefetch = false;

  @property() basis: string = '300';

  @property({attribute: 'max-height'}) maxHeight: string;

  @property({reflect: true, type: Boolean}) open = false;

  @property({attribute: 'master-id', reflect: true}) masterId: string;
  @property({attribute: 'fetch-style', type: String, reflect: true}) fetchStyle = "";

  @property({attribute: 'no-prefetch', type: Boolean, reflect: true}) noPrefetch = false;

  private _panel: Element | null | undefined;
  private _panels: Map<string, Element[]>;
  private _knownUri: Map<string, string> = new Map<string, string>();
  private _actions: HTMLElement[] = [];
  private _preload = true;
  private _observer?: MutationObserver;

  constructor() {
    super();
    this._panels = new Map<string, Element[]>();
  }

  async connectedCallback() {
    super.connectedCallback();

    this._preload = !this.noPrefetch;

    await this.updateComplete;
    this._panel = this.shadowRoot?.querySelector('#content');
    this._registerActions();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    setTimeout(() => {
      this._registerActions();
    }, 10);
  }

  _observeMetaCount() {
    const appContent = deepQuerySelectorAll('app-content', this, '')[0];

    this._observer = new MutationObserver(() => {
      const metaCount = appContent?.shadowRoot?.querySelector('meta[name="count"]');
      if (!metaCount) {
        return;
      }
      const count = metaCount.getAttribute('content');
      const notification = this.shadowRoot?.querySelector('.expanding-action__dropdown zn-button');
      if (count && notification) {
        notification.setAttribute('notification', count);
      }
    });

    if (appContent.shadowRoot) {
      this._observer.observe(appContent.shadowRoot, {
        subtree: true,
        attributeFilter: ['content'],
      });
    }
  }

  _registerActions() {
    deepQuerySelectorAll('[action-uri]', this, 'zn-expanding-action').forEach(ele => {
      if (ele.getAttribute('action-uri') === '') {
        ele.setAttribute('action', '');
        ele.removeAttribute('action-uri');
      }
      this._addAction(ele as HTMLElement);
    });
  }

  _addAction(action: HTMLElement) {
    if (this._actions.includes(action)) {
      return;
    }
    this._actions.push(action);

    if (this._preload) {
      action.addEventListener('mouseover', this.fetchUri.bind(this, action));
    }

    action.addEventListener('click', this._handleClick.bind(this));
  }

  _uriToId(actionUri: string): string {
    return "action-" + md5(actionUri).substr(0, 8) + "-" + this.masterId;
  }

  _handleClick(event: PointerEvent) {
    // ts-ignore
    const target = (event.relatedTarget ?? event.target) as HTMLElement;
    if (target) {
      this.clickAction(target);
    }
  }

  _createUriPanel(actionEle: Element, actionUri: string, actionId: string): HTMLDivElement {
    if (!actionEle.hasAttribute('action')) {
      actionEle.setAttribute('action', actionId);
    }

    if (!this._knownUri.has(actionUri)) {
      this._knownUri.set(actionUri, actionId);
    }

    if (this._panels.has(actionId) && this._panels.get(actionId) !== undefined) {
      return this._panels.get(actionId)![0] as HTMLDivElement;
    }

    const actionNode = document.createElement('div');
    actionNode.setAttribute("id", actionId);
    if (this.fetchStyle !== "") {
      actionNode.setAttribute("data-fetch-style", this.fetchStyle);
    }
    actionNode.setAttribute('data-self-uri', actionUri);
    actionNode.setAttribute('data-fetch-style', "expanding-action");
    actionNode.textContent = "Loading ...";
    if (this._panel instanceof HTMLElement) {
      // Append the action if the panel has not yet been constructed
      this._panel.appendChild(actionNode);
      this._panels.set(actionId, [actionNode]);
    }
    document.dispatchEvent(new CustomEvent('zn-new-element', {
      detail: {element: actionNode, source: actionEle}
    }));
    return actionNode;
  }

  fetchUri(target: HTMLElement) {
    if (!target.hasAttribute('action') && target.hasAttribute('action-uri')) {
      const actionUri: string | null = target.getAttribute("action-uri") ?? "";
      this._createUriPanel(target, actionUri, this._uriToId(actionUri));

      // Observer must wait until the panel is created
      this._observeMetaCount();
    }
  }

  clickAction(target: HTMLElement) {
    this.fetchUri(target);
  }

  handleIconClicked = () => {
    this.open = !this.open;
  }

  handleIconCloseClicked = () => {
    this.open = false;
  }

  render() {
    return html`
      ${this.method === 'fill' ? html`
        <zn-button color="transparent"
                   size="x-small"
                   @click="${this.handleIconClicked}"
                   icon="${this.icon}"
                   icon-size="24">
        </zn-button>` : nothing}
      <div
        class="${classMap({
          "expanding-action": true,
          'expanding-action--open': this.open,
          'expanding-action--closed': !this.open,
          'expanding-action--drop': this.method === 'drop',
          'expanding-action--fill': this.method === 'fill',
        })}"
        style=${styleMap({
          '--expanding-action-basis': this.method === "drop" && this.basis ? this.basis.replace('px', '') + 'px' : 'none',
          '--expanding-action-max-height': this.method === "drop" && this.maxHeight ? this.maxHeight.replace('px', '') + 'px' : 'none',
        })}>
        ${this.method === 'drop' ? this.renderDropdown() : this.renderFill()}
      </div>`;
  }

  protected renderDropdown() {
    return html`
      <zn-dropdown class="expanding-action__dropdown"
                   placement="bottom-end">
        <zn-button slot="trigger"
                   color="transparent"
                   size="x-small"
                   icon="${this.icon}"
                   icon-size="24"
                   notification="${this.count || nothing}"
                   @click="${this.handleIconClicked}">
        </zn-button>
        <div id="content" class="expanding-action__content">
          <slot></slot>
        </div>
      </zn-dropdown>`
  }

  protected renderFill() {
    return html`
      <zn-icon src="${this.icon}" size="24"></zn-icon>
      <div id="content" class="expanding-action__content">
        <slot></slot>
      </div>
      <zn-button slot="trigger"
                 class="expanding-action__close-icon"
                 color="transparent"
                 size="x-small"
                 @click="${this.handleIconCloseClicked}"
                 icon="close"
                 icon-size="24">
      </zn-button>`
  }
}
