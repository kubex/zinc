import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnInput from '../../../input';

import styles from './flow-steps.scss';

/**
 * @summary A search + scroll wrapper for building a standalone steps panel. Place a standard
 *   `<zn-tabs>` (with a `<zn-navbar slot="top">` and panels of `<zn-flow-step-group>` /
 *   `<zn-flow-step>`) inside it; the search box filters the slotted items.
 * @documentation https://zinc.style/components/flow-steps
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-input
 *
 * @slot - The steps panel content, typically a `<zn-tabs>`.
 *
 * @csspart search - The search input.
 */
export default class ZnFlowSteps extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {'zn-input': ZnInput};

  @property({type: Boolean}) searchable = true;
  @property({attribute: 'search-placeholder'}) searchPlaceholder = 'Search by step name';

  @state() private _search = '';

  /** Re-applies the filter when zn-tabs moves `selected` to another panel. */
  private _tabObserver = new MutationObserver(() => this._applyFilter());

  connectedCallback() {
    super.connectedCallback();
    this._tabObserver.observe(this, {subtree: true, attributeFilter: ['selected']});
  }

  disconnectedCallback() {
    this._tabObserver.disconnect();
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this._applyFilter();
  }

  /** True when the element isn't tabbed, or sits in the active (selected) tab panel. */
  private _inActiveTab(el: HTMLElement): boolean {
    return !el.closest('zn-tabs') || !!el.closest('[selected]');
  }

  /** Filter the slotted items (and hide emptied groups) by the search term — active tab only. */
  private _applyFilter() {
    const term = this._search.trim().toLowerCase();

    this.querySelectorAll<HTMLElement>('zn-flow-step').forEach(it => {
      it.hidden = term !== '' && this._inActiveTab(it) && !(it.textContent ?? '').toLowerCase().includes(term);
    });
    this.querySelectorAll<HTMLElement>('zn-flow-step-group').forEach(g => {
      const items = Array.from(g.querySelectorAll<HTMLElement>('zn-flow-step'));
      g.hidden = term !== '' && this._inActiveTab(g) && items.length > 0 && items.every(it => it.hidden);
    });
  }

  render() {
    return html`
      ${this.searchable
        ? html`
          <zn-input
            part="search"
            class="search"
            placeholder="${this.searchPlaceholder}"
            clearable
            .value="${this._search}"
            @zn-input="${(e: Event) => (this._search = String((e.target as ZnInput).value ?? ''))}"
            @input="${(e: Event) => (this._search = String((e.target as ZnInput).value ?? ''))}"
          ></zn-input>`
        : ''}

      <div class="body">
        <slot></slot>
      </div>
    `;
  }
}
