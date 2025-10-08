import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from "lit/decorators.js";
import {Store} from "../../internal/storage";
import {type ZnChangeEvent} from "../../events/zn-change";
import ZincElement from '../../internal/zinc-element';
import type ZnCheckbox from "../checkbox";

import styles from './settings-container.scss';
import {deepQuerySelectorAll} from "../../utilities/query";

interface SettingsContainerFilter {
  attribute: string;
  checked: boolean;
  label: string;
  itemSelector?: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/settings-container
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
export default class ZnSettingsContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() filters: SettingsContainerFilter[] = [];

  @property() position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' = 'bottom-start';

  @property({attribute: 'store-key'}) storeKey: string;

  private _mutationObserver: MutationObserver | null = null;

  private _updateFiltersScheduled = false;

  private _store: Store;

  private _hiddenElements: Set<Element> = new Set();

  connectedCallback() {
    super.connectedCallback();

    this._store = new Store(window.sessionStorage, this.storeKey);

    this.recomputeFiltersFromSlot();
    this.updateFilters();

    // Load saved filter states
    if (this.storeKey) {
      const savedFilters = this._store.get('filters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters) as Record<string, boolean>;
        this.filters = this.filters.map(filter => ({
          ...filter,
          checked: Object.prototype.hasOwnProperty.call(parsedFilters, filter.attribute) ? parsedFilters[filter.attribute] : filter.checked
        }));
        this.updateFilters();
      }
    }

    this._mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
          continue;
        }
        this.scheduleUpdateFilters();
        break;
      }
    });
    this._mutationObserver.observe(this, {childList: true, subtree: true, attributes: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
      this._mutationObserver = null;
    }
  }

  // Debounced scheduling to avoid excessive updates on rapid DOM mutations
  private scheduleUpdateFilters() {
    if (this._updateFiltersScheduled) return;
    this._updateFiltersScheduled = true;
    Promise.resolve().then(() => {
      this._updateFiltersScheduled = false;
      this.updateFilters();
    });
  }

  private handleContentSlotChange = () => {
    this.updateFilters();
  };

  private handleFiltersSlotChange = () => {
    this.recomputeFiltersFromSlot();
    this.updateFilters();
  };

  private recomputeFiltersFromSlot() {
    const existingChecked = new Map(this.filters.map(f => [f.attribute, f.checked]));
    const slotFilters = this.querySelectorAll('[slot="filter"]');
    const nextFilters: SettingsContainerFilter[] = [];
    slotFilters.forEach(filter => {
      const attribute = filter.getAttribute('attribute');
      if (!attribute) return;
      const defaultChecked = filter.getAttribute('default') === 'true';
      const checked = existingChecked.has(attribute) ? !!existingChecked.get(attribute) : defaultChecked;
      const label = filter.textContent || 'Unnamed Filter';
      const itemSelector = filter.getAttribute('item-selector') || '*';
      nextFilters.push({attribute, checked, label, itemSelector});
    });
    this.filters = nextFilters;
  }

  updateFilters() {
    // reset all items
    this._hiddenElements.forEach(el => el.removeAttribute('hidden'));

    // apply filters
    this.filters.forEach(filter => {
      const items = deepQuerySelectorAll(filter.itemSelector + (filter.attribute === "*" ? `` : `[${filter.attribute}]`), this, "");
      items.forEach(item => {
        if (filter.checked) {
          item.removeAttribute('hidden');
        } else {
          item.setAttribute('hidden', 'true');
          this._hiddenElements.add(item);
        }
      });
    });
  }

  updateFilter(e: ZnChangeEvent) {
    const attribute = (e.target as ZnCheckbox).getAttribute('data-attribute');
    const checked = (e.target as ZnCheckbox).isChecked

    this.filters = this.filters.map(filter => {
      if (filter.attribute === attribute) {
        return {...filter, checked};
      }
      return filter;
    });

    // Save filter states
    if (this.storeKey) {
      const filterStates = this.filters.reduce((acc: Record<string, boolean>, filter) => {
        acc[filter.attribute] = filter.checked;
        return acc;
      }, {} satisfies Record<string, boolean>);
      this._store.set('filters', JSON.stringify(filterStates));
    }

    this.updateFilters();
  }

  render() {
    let placement = 'top-start';

    switch (this.position) {
      case 'top-end':
        placement = 'bottom-end';
        break;
      case 'top-start':
        placement = 'bottom-start';
        break;
      case 'bottom-end':
        placement = 'top-end';
        break;
      case 'bottom-start':
        placement = 'top-start';
        break;
    }

    return html`
      <div class="container">
        <div class="scroll-content">
          <slot @slotchange="${this.handleContentSlotChange}"></slot>
        </div>
        <zn-dropdown placement="${placement}" class="${classMap({
          'setting-container__dropdown': true,
          'setting-container__dropdown--top-end': this.position === 'top-end',
          'setting-container__dropdown--top-start': this.position === 'top-start',
          'setting-container__dropdown--bottom-end': this.position === 'bottom-end',
          'setting-container__dropdown--bottom-start': this.position === 'bottom-start',
        })}">
          <zn-icon class="setting-container__toggle-button" slot="trigger" size="24" src="settings" round></zn-icon>
          <div class="settings-container__dropdown-content">
            <slot name="filter" style="display: none;" @slotchange="${this.handleFiltersSlotChange}"></slot>
            ${this.filters.map(filter => html`
              <zn-checkbox class="settings-container__dropdown-item"
                           data-attribute="${filter.attribute}"
                           ?checked="${filter.checked}"
                           @zn-change="${this.updateFilter}">
                ${filter.label}
              </zn-checkbox>
            `)}
          </div>
        </zn-dropdown>
      </div>
    `;
  }
}
