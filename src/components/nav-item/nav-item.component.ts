import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon';

import styles from './nav-item.scss';

/**
 * @summary A selectable row in a `zn-nav-list`, with an optional description and count.
 * @documentation https://zinc.style/components/nav-list
 * @status experimental
 * @since 1.0
 *
 * @slot - The item's label.
 *
 * @csspart base - The component's base wrapper.
 * @csspart label - The label, truncated with an ellipsis.
 * @csspart description - The description shown below the label.
 * @csspart count - The count shown at the end of the row.
 * @csspart handle - The drag handle, shown when the list is sortable.
 */
export default class ZnNavItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon,
  };

  /** A count shown at the end of the row, such as the number of entries in the group. */
  @property() count: string;

  /** A line of detail shown below the label. */
  @property() description: string;

  private readonly _classObserver = new MutationObserver(() => this._syncSelected());

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tab');
    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = -1;
    }
    this.addEventListener('keydown', this._handleKeyDown);
    // zn-tabs marks the active trigger with a class rather than an attribute
    this._classObserver.observe(this, {attributes: true, attributeFilter: ['class']});
    this._syncSelected();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
    this._classObserver.disconnect();
  }

  get selected() {
    return this.classList.contains('zn-tb-active');
  }

  private _syncSelected() {
    this.setAttribute('aria-selected', String(this.selected));
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  };

  render() {
    return html`
      <div part="base" class="nav-item">
        <zn-icon part="handle" class="nav-item__handle" src="drag_indicator" size="16" aria-hidden="true"></zn-icon>
        <span class="nav-item__text">
          <span part="label" class="nav-item__label"><slot></slot></span>
          ${this.description ? html`<span part="description" class="nav-item__description">${this.description}</span>` : ''}
        </span>
        ${this.count !== undefined && this.count !== null && this.count !== ''
          ? html`<span part="count" class="nav-item__count">${this.count}</span>`
          : ''}
      </div>
    `;
  }
}
