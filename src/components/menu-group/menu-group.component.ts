import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {isNavigationCollapsed, onNavigationCollapse} from '../../utilities/navigation';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './menu-group.scss';

/**
 * @summary A navigation row with rows nested under it, joined by a line down from its icon, such as a department and
 * its queues in an app sidebar.
 * @documentation https://zinc.style/components/menu-group
 * @status experimental
 * @since 2.0
 *
 * @slot parent - The row the group hangs from.
 * @slot - The nested rows.
 *
 * @csspart children - The nested rows' container, which draws the line.
 *
 * @cssproperty --zn-menu-group-line-color - The line joining the nested rows to the parent.
 */
export default class ZnMenuGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** Hides the nested rows, except when one of them is the open page. */
  @property({type: Boolean, reflect: true}) folded = false;

  /** Lays the group out for a collapsed sidebar, with no line or indent, following the shell's sidebar. */
  @property({type: Boolean, reflect: true}) collapsed = false;

  // Whether a nested row is the open page, which a folded group keeps showing
  @property({type: Boolean, reflect: true, attribute: 'has-active'}) hasActive = false;

  private readonly _rowObserver = new MutationObserver(() => this._syncRows());
  private stopFollowingNavigation?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._rowObserver.observe(this, {attributes: true, attributeFilter: ['active'], childList: true, subtree: true});
    this.stopFollowingNavigation = onNavigationCollapse(collapsed => (this.collapsed = collapsed));
    this.collapsed = isNavigationCollapsed() ?? this.collapsed;
    this._syncRows();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._rowObserver.disconnect();
    this.stopFollowingNavigation?.();
  }

  // Its rows are sidebar rows, so they take the navigation look without each saying so
  private _syncRows() {
    const rows = Array.from(this.children).filter(child => child.localName === 'zn-menu-item') as (HTMLElement & {variant: string})[];
    rows.forEach(row => (row.variant = 'navigation'));
    this.hasActive = rows.some(row => !row.slot && row.hasAttribute('active'));
  }

  render() {
    return html`
      <slot name="parent"></slot>
      <div part="children" class="menu-group__children" role="group">
        <slot></slot>
      </div>
    `;
  }
}
