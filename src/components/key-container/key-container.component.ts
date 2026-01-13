import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {deepQuerySelectorAll} from "../../utilities/query";
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type ZnKey from "../key/key.component";

import styles from './key-container.scss';

/**
 * @summary A container that manages key items and filters content based on active keys.
 * @documentation https://zinc.style/components/key-container
 * @status experimental
 * @since 1.0
 *
 * @slot - The content to be filtered.
 * @slot keys - The key items (zn-key) that define the filters.
 *
 * @event zn-change - Emitted when the set of active keys changes.
 */
export default class ZnKeyContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @query('slot[name="keys"]') keysSlot: HTMLSlotElement;
  @query('slot:not([name])') defaultSlot: HTMLSlotElement;

  @property() position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' = 'bottom-start';
  @property() target: string = ''; // ID of the target element containing items
  @property({attribute: 'item-selector'}) itemSelector: string = '[data-type]';
  @property({attribute: 'filter-attribute'}) filterAttribute: string = '';
  @property({attribute: 'no-scroll', type: Boolean}) noScroll: boolean = false;

  private _hiddenElements: Set<Element> = new Set();
  private _targetElement: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.updateFilters();
  }

  firstUpdated() {
    if (this.target) {
      const rootNode = this.getRootNode() as Document | ShadowRoot;
      this._targetElement = rootNode.getElementById ? rootNode.getElementById(this.target) : document.getElementById(this.target);
    }
    this.updateFilters();
  }

  private _handleKeyChange() {
    this.updateFilters();
    this.emit('zn-change');
  }

  private getKeys(): ZnKey[] {
    const keys = [];
    if (this.keysSlot) {
      keys.push(...this.keysSlot.assignedElements({flatten: true}));
    }
    if (this.defaultSlot) {
      keys.push(...this.defaultSlot.assignedElements({flatten: true}));
    }
    return keys.filter(el => el.tagName.toLowerCase() === 'zn-key') as ZnKey[];
  }

  private updateFilters() {
    const keys = this.getKeys();
    if (!keys || keys.length === 0) return;

    // Reset hidden elements
    this._hiddenElements.forEach(el => el.removeAttribute('hidden'));
    this._hiddenElements.clear();

    if (this.target && !this._targetElement) {
      const rootNode = this.getRootNode() as Document | ShadowRoot;
      this._targetElement = rootNode.getElementById?.(this.target) ?? document.getElementById(this.target);
    }
    let root: Element | Document | DocumentFragment | null = this._targetElement ?? null;

    if (!root) {
      const slotElements = this.defaultSlot?.assignedElements({flatten: true}) ?? [];
      root = slotElements.some(el => el.tagName !== 'ZN-KEY')
        ? this
        : this.parentElement ?? (this.parentNode as DocumentFragment);
    }
    if (!root) return;

    const selector = this.filterAttribute ? `[${this.filterAttribute}]` : this.itemSelector;
    const items = deepQuerySelectorAll(selector, root as HTMLElement, "");
    items.forEach(item => {
      if (item === this) return;

      const matchesInactive = keys.some(key => !key.active && this.itemMatchesKey(item, key));
      if (matchesInactive) {
        item.setAttribute('hidden', '');
        this._hiddenElements.add(item);
      }
    });
  }

  private itemMatchesKey(item: Element, key: ZnKey): boolean {
    // 1. If the container specifies filterAttribute, use key.attribute as the value to look for
    if (this.filterAttribute) {
      const itemValue = item.getAttribute(this.filterAttribute);
      if (!itemValue) return false;

      const targetValue = key.attribute;
      if (!targetValue) return false;

      return itemValue.split(/\s+/).includes(targetValue);
    }

    // 2. If key specifies attribute and value
    if (key.attribute && key.value) {
      const itemValue = item.getAttribute(key.attribute);
      if (!itemValue) return false;

      return itemValue.split(/\s+/).includes(key.value);
    }

    // 3. If the key only specifies attribute (and no value), check for existence
    if (key.attribute) {
      return item.hasAttribute(key.attribute);
    }

    return false;
  }

  render() {
    return html`
      <div class="${classMap({
        'key-container': true,
        'key-container--scroll': !this.noScroll,
      })}" @zn-change="${this._handleKeyChange}">
        ${this.target ? '' : html`
          <div class="key-container__content">
            <slot @slotchange="${this.updateFilters.bind(this)}" class="key-container__keys"></slot>
          </div>
        `}
      </div>
    `;
  }
}
