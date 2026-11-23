import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
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

  /** Drops the card's padding, for content that brings its own, such as a list row. */
  @property({type: Boolean, reflect: true}) flush = false;

  /** Opens this URL when the card is clicked rather than dragged. */
  @property() href: string;

  @property({attribute: 'data-target'}) dataTarget: string;

  /** Set by the board while the item is being dragged. */
  @property({type: Boolean, reflect: true}) dragging = false;

  render() {
    // Not natively draggable, as a link's own drag would cancel the board's
    return this.href
      ? html`<a part="base" class="kanban-item" href=${this.href} data-target=${ifDefined(this.dataTarget)}
                draggable="false"><slot></slot></a>`
      : html`<div part="base" class="kanban-item"><slot></slot></div>`;
  }
}
