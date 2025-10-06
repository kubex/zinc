import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import {Store} from "../../internal/storage";
import ZincElement from '../../internal/zinc-element';

import styles from './collapsible.scss';
import {HasSlotController} from "../../internal/slot";

/**
 * @summary Toggles between showing and hiding content when clicked
 * @documentation https://zinc.style/components/collapsible
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon - The icon element
 *
 * @slot header - Clicking will toggle the show state of the data
 *
 */
export default class ZnCollapsible extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) caption = '';

  @property({reflect: true}) description = '';

  @property({reflect: true}) label = '';

  @property({type: Boolean, attribute: 'show-number', reflect: true}) showNumber: boolean = false;

  // what element name to count
  @property({type: String, attribute: 'count-element'}) countElement: string = '*';

  @property({type: Boolean, reflect: true}) expanded: boolean = false;

  @property({attribute: 'default'}) defaultState: 'open' | 'closed';

  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;

  @property({attribute: 'store-key', reflect: true}) storeKey: string = "";

  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;

  @property({attribute: 'flush', type: Boolean, reflect: true}) flush: boolean = false;

  @state() numberOfItems: number = 0;

  protected _store: Store;

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'header', 'caption', 'label');

  private observer: MutationObserver;

  connectedCallback() {
    super.connectedCallback();
    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "zncla:", this.storeTtl);
    this.expanded = this.defaultState === 'open';

    if (this.storeKey) {
      const hasPref = this._store.get(this.storeKey);
      if (hasPref) {
        this.expanded = hasPref === "true";
      }
    }

    if (this.showNumber) {
      // add a mutation observer to the default slot to recalculate the number of items when it changes
      const slot = this as HTMLElement;
      this.observer = new MutationObserver(() => {
        this.recalculateNumberOfItems();
      });
      this.observer.observe(slot, {childList: true, subtree: true});
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  handleCollapse = (e: MouseEvent) => {
    if (this.expanded) {
      this.expanded = false;
      e.stopPropagation();
    }
  }

  public recalculateNumberOfItems = () => {
    const assignedElements = this.hasSlotController.getDefaultSlot()
      .filter(node => node.nodeType === Node.ELEMENT_NODE) as HTMLElement[];

    // query all direct children that match the countElement tag name
    if (this.countElement === '*') {
      this.numberOfItems = assignedElements.length;
      return;
    }

    const children = assignedElements.flatMap(el => Array.from(el.querySelectorAll(this.countElement)));
    this.numberOfItems = children.length;
  }

  render() {
    this.recalculateNumberOfItems();

    return html`
      <div @click="${() => (!this.expanded ? (this.expanded = true) : '')}">
        <slot name="header" class="header" @click="${this.handleCollapse}">
          <div class="header__left">
            <p class="caption">
              <slot name="caption">${this.caption}</slot>
            </p>
            <p class="description">${this.description}</p>
          </div>
          <div class="header__right">
            <slot name="label"><p class="label">${this.label}</p></slot>
            ${this.showNumber ? html`
              <p class="number">
                <zn-chip size="small" type="primary">${this.numberOfItems}</zn-chip>
              </p>` : ''}
            <zn-icon library="material-outlined" src="expand_more" class="expand"></zn-icon>
          </div>
        </slot>
        <div class="${classMap({
          'content': true,
          'content--flush': this.flush,
        })}">
          <slot @slotchange="${this.requestUpdate}"></slot>
        </div>
      </div>`;
  }
}
