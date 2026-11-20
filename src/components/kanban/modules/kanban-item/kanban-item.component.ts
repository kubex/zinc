import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';

import styles from './kanban-item.scss';

/**
 * @summary A card on a kanban board that can be dragged between columns.
 * @documentation https://zinc.style/components/kanban
 * @status experimental
 * @since 2.0
 *
 * @slot - The card's content.
 *
 * @csspart base - The card.
 */
export default class ZnKanbanItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** Identifies the item in `zn-move` events. */
  @property({reflect: true}) value = '';

  /** Set by the board while the item is being dragged. */
  @property({type: Boolean, reflect: true}) dragging = false;

  render() {
    return html`<div part="base" class="kanban-item"><slot></slot></div>`;
  }
}
