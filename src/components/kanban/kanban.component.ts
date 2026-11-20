import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {type Point, PointerDrag} from '../../internal/drag';
import {query, state} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import ZincElement from '../../internal/zinc-element';
import ZnKanbanColumn from './modules/kanban-column';
import ZnKanbanItem from './modules/kanban-item';

import styles from './kanban.scss';

/**
 * @summary A board of columns whose cards can be dragged from one column to another.
 * @documentation https://zinc.style/components/kanban
 * @status experimental
 * @since 2.0
 *
 * @dependency zn-kanban-column
 * @dependency zn-kanban-item
 *
 * @event {{item: ZnKanbanItem, from: ZnKanbanColumn, to: ZnKanbanColumn, index: number}} zn-move - Emitted when a
 * card is dropped in a new place. Cancel it to put the card back.
 *
 * @slot - The board's `zn-kanban-column` elements.
 *
 * @csspart base - The scrolling row of columns.
 *
 * @cssproperty --zn-kanban-column-min-width - The narrowest a column gets; the row scrolls sideways once they don't fit.
 * @cssproperty --zn-kanban-column-max-width - The widest a column grows to fill the board.
 * @cssproperty --zn-kanban-column-min-height - The minimum height of each column, so empty ones stay easy to drop on.
 */
export default class ZnKanban extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-kanban-column': ZnKanbanColumn, 'zn-kanban-item': ZnKanbanItem};

  @query('.kanban') private _scroller: HTMLElement;

  @state() private _moreStart = false;
  @state() private _moreEnd = false;

  private _dragItem: ZnKanbanItem | null = null;
  private _origin: {column: ZnKanbanColumn; next: Element | null} | null = null;
  private _target: ZnKanbanColumn | null = null;

  private readonly _drag = new PointerDrag<ZnKanbanItem>({
    row: item => item,
    scrollArea: () => this._scroller,
    start: item => this._startDrag(item),
    move: point => this._dragOver(point),
    end: (point, cancel) => this._endDrag(point, cancel),
  }, 'horizontal');

  private readonly _resize = new ResizeController(this, {target: null, callback: () => this._syncScrollEdges()});

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('pointerdown', this._handlePointerDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pointerdown', this._handlePointerDown);
    this._drag.stop();
  }

  firstUpdated() {
    this._resize.observe(this._scroller);
  }

  get columns() {
    return [...this.querySelectorAll<ZnKanbanColumn>(':scope > zn-kanban-column')];
  }

  private _syncScrollEdges = () => {
    const scroller = this._scroller;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    this._moreStart = scroller.scrollLeft > 1;
    this._moreEnd = scroller.scrollLeft < maxScroll - 1;
  };

  private _handlePointerDown = (e: PointerEvent) => {
    const item = (e.target as Element).closest?.('zn-kanban-item');
    if (item?.parentElement?.parentElement === this) this._drag.handlePointerDown(e, item);
  };

  private _startDrag(item: ZnKanbanItem) {
    this._dragItem = item;
    this._origin = {column: item.parentElement as ZnKanbanColumn, next: item.nextElementSibling};
    item.dragging = true;
    for (const column of this.columns) column.dropZone = column !== this._origin.column;
  }

  private _dragOver(point: Point) {
    const item = this._dragItem;
    const column = this.columns.find(col => contains(col, point));
    if (!item || !column) return;
    this._setTarget(column);

    const others = column.items.filter(other => other !== item);
    const before = others.find(other => {
      const rect = other.getBoundingClientRect();
      return point.y < rect.top + rect.height / 2;
    });
    if (before) {
      if (item.nextElementSibling !== before) column.insertBefore(item, before);
    } else if (others.length === 0) {
      if (item.parentElement !== column) column.append(item);
    } else if (others[others.length - 1].nextElementSibling !== item) {
      others[others.length - 1].after(item);
    }
  }

  private _endDrag(point: Point, cancel: boolean) {
    const item = this._dragItem;
    const origin = this._origin;
    this._dragItem = null;
    this._origin = null;
    this._setTarget(null);
    for (const column of this.columns) column.dropZone = false;
    if (!item || !origin) return;
    item.dragging = false;

    const to = item.parentElement as ZnKanbanColumn;
    if (cancel || !contains(this, point)) {
      origin.column.insertBefore(item, origin.next);
      return;
    }
    if (to === origin.column && item.nextElementSibling === origin.next) return;

    const event = this.emit('zn-move', {
      detail: {item, from: origin.column, to, index: to.items.indexOf(item)}
    });
    if (event.defaultPrevented) origin.column.insertBefore(item, origin.next);
  }

  private _setTarget(column: ZnKanbanColumn | null) {
    if (this._target === column) return;
    if (this._target) this._target.dropTarget = false;
    this._target = column;
    if (column) column.dropTarget = true;
  }

  render() {
    return html`
      <div part="base" @scroll=${this._syncScrollEdges} class=${classMap({
        'kanban': true,
        'kanban--more-start': this._moreStart,
        'kanban--more-end': this._moreEnd,
      })}>
        <slot @slotchange=${this._syncScrollEdges}></slot>
      </div>
    `;
  }
}

function contains(el: Element, {x, y}: Point) {
  const rect = el.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
