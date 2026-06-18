import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './tile-group.scss';

/**
 * @summary Aligns a list of `zn-tile` rows into shared, content-driven columns so values
 * and actions line up across every row, with optional dividing borders.
 * @documentation https://zinc.style/components/tile-group
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-tile
 *
 * @slot - One or more `zn-tile` elements.
 *
 * @csspart base - The component's base wrapper (the grid container).
 *
 * @cssproperty --zn-tile-cols - The number of value/action columns (set automatically).
 */
export default class ZnTileGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** Draws a dividing border between rows. */
  @property({attribute: 'divide', type: Boolean, reflect: true}) divide = false;

  private _mutationObserver: MutationObserver | null = null;

  connectedCallback() {
    super.connectedCallback();
    // Re-sync when tiles (or their values/actions) are added or removed so the
    // shared column count tracks the current content.
    this._mutationObserver = new MutationObserver(() => this._sync());
    this._mutationObserver.observe(this, {childList: true, subtree: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._mutationObserver?.disconnect();
    this._mutationObserver = null;
  }

  private _handleSlotChange = () => this._sync();

  // Flag each child tile as grouped (so it switches to its subgrid row layout)
  // and publish the widest row's column count as --zn-tile-cols so the grid
  // template has enough shared tracks for every row.
  private _sync() {
    const tiles = Array.from(this.querySelectorAll<HTMLElement>(':scope > zn-tile'));
    let cols = 0;
    for (const tile of tiles) {
      tile.setAttribute('grouped', '');
      const count = tile.querySelectorAll(':scope > [slot="properties"], :scope > [slot="actions"]').length;
      cols = Math.max(cols, count);
    }
    this.style.setProperty('--zn-tile-cols', String(Math.max(1, cols)));
  }

  protected render(): unknown {
    return html`
      <div part="base" class="tile-group">
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>`;
  }
}
