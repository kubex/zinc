import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnBadge from '../../../badge';

import styles from './kanban-column.scss';

/**
 * @summary A column on a kanban board, holding `zn-kanban-item` cards.
 * @documentation https://zinc.style/components/kanban
 * @status experimental
 * @since 2.0
 *
 * @dependency zn-badge
 *
 * @slot - The column's `zn-kanban-item` cards.
 * @slot actions - Controls shown at the end of the column header.
 *
 * @csspart base - The column.
 * @csspart header - The caption, count, meta and actions row.
 * @csspart count - The number of items in the column.
 * @csspart items - The shaded area the cards sit in and are dropped into.
 */
export default class ZnKanbanColumn extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-badge': ZnBadge};

  /** Identifies the column in `zn-move` events. */
  @property({reflect: true}) value = '';

  @property() caption = '';

  /** Secondary text at the end of the header, such as a column total. */
  @property() meta = '';

  /** A line under the header, such as the rule for entering the column. */
  @property() description = '';

  @property({attribute: 'empty-text'}) emptyText = 'Nothing here';

  /** Set by the board on every other column while an item is dragged, to show where it can go. */
  @property({type: Boolean, reflect: true, attribute: 'drop-zone'}) dropZone = false;

  /** Set by the board while an item is dragged over the column. */
  @property({type: Boolean, reflect: true, attribute: 'drop-target'}) dropTarget = false;

  @state() private _count = 0;

  get items() {
    return [...this.querySelectorAll<HTMLElement>(':scope > zn-kanban-item')];
  }

  private _handleSlotChange = () => {
    this._count = this.items.length;
  };

  render() {
    return html`
      <section part="base" class="kanban-column" aria-label=${this.caption}>
        <div part="header" class="kanban-column__header">
          <span class="kanban-column__caption">${this.caption}</span>
          <zn-badge part="count">${this._count}</zn-badge>
          <span class="kanban-column__meta">${this.meta}</span>
          <slot name="actions"></slot>
        </div>
        ${this.description ? html`<div class="kanban-column__description">${this.description}</div>` : ''}
        <div part="items" class="kanban-column__items">
          <slot @slotchange=${this._handleSlotChange}></slot>
          <div class="kanban-column__empty" ?hidden=${this._count > 0}>${this.emptyText}</div>
        </div>
      </section>
    `;
  }
}
