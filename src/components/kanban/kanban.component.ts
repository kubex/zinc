import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {OverlayScrollbarController} from '../../internal/overlay-scrollbar';
import {type Point, PointerDrag} from '../../internal/drag';
import {property, query, state} from 'lit/decorators.js';
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
 * @event {{status?: number, message?: string}} zn-error - Emitted when `move-uri` refuses a move; the card goes back.
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

  protected readonly boardScrollbar = new OverlayScrollbarController(this, () => this.renderRoot.querySelector<HTMLElement>('.kanban'));
  static dependencies = {'zn-kanban-column': ZnKanbanColumn, 'zn-kanban-item': ZnKanbanItem};

  /**
   * Saves each move by submitting a form here with `item`, `from`, `to` and `index`, from each element's `value`. A
   * refused move (an error status or error alert) puts the card back.
   */
  @property({attribute: 'move-uri'}) moveUri = '';

  @query('.kanban') private _scroller: HTMLElement;

  @state() private _moreStart = false;
  @state() private _moreEnd = false;

  private _dragItem: ZnKanbanItem | null = null;
  private _origin: Origin | null = null;
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
    if (item && !item.slot && columnOf(item)?.parentElement === this) this._drag.handlePointerDown(e, item);
  };

  private _startDrag(item: ZnKanbanItem) {
    this._dragItem = item;
    this._origin = {column: columnOf(item)!, container: item.parentElement!, next: item.nextElementSibling};
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
      if (item.nextElementSibling !== before) before.before(item);
    } else if (others.length === 0) {
      if (item.parentElement !== column.container) column.container.append(item);
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

    const to = columnOf(item)!;
    if (cancel || !contains(this, point)) {
      origin.container.insertBefore(item, origin.next);
      return;
    }
    if (item.parentElement === origin.container && item.nextElementSibling === origin.next) return;

    const index = to.items.indexOf(item);
    const event = this.emit('zn-move', {detail: {item, from: origin.column, to, index}});
    if (event.defaultPrevented) {
      origin.container.insertBefore(item, origin.next);
    } else if (this.moveUri) {
      this._saveMove(item, origin, to, index);
    }
  }

  // Submitted as a form so the console sends it as a pagelet request and shows the app's alerts
  private _saveMove(item: ZnKanbanItem, origin: Origin, to: ZnKanbanColumn, index: number) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.moveUri;
    form.hidden = true;
    // A part fetch, so the console doesn't reconfigure the page for the move's own path
    form.dataset.fetchStyle = 'part';
    const fields = {item: item.value, from: origin.column.value, to: to.value, index: String(index)};
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.append(input);
    }

    const settle = (event: Event) => {
      form.remove();
      const response = (event as CustomEvent<{response?: PageletResponse}>).detail?.response;
      const refused = event.type === 'error' || (response?.status ?? 0) >= 400
        || (response?.actions ?? []).some(action => action.action === 'alert' && action.style === 'error');
      if (!refused) return;
      // Its old neighbour may have moved meanwhile, leaving the end of its old place
      origin.container.insertBefore(item, origin.next?.parentElement === origin.container ? origin.next : null);
      this.emit('zn-error', {detail: {status: response?.status, message: 'The move was not saved'}});
    };
    form.addEventListener('complete', settle, {once: true});
    form.addEventListener('error', settle, {once: true});

    this.append(form);
    document.dispatchEvent(new CustomEvent('zn-register-element', {detail: {element: form}}));
    form.requestSubmit();
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

type Origin = {column: ZnKanbanColumn; container: Element; next: Element | null};

interface PageletResponse {
  status?: number;
  actions?: {action?: string; style?: string}[];
}

function columnOf(item: Element) {
  return item.closest<ZnKanbanColumn>('zn-kanban-column');
}

function contains(el: Element, {x, y}: Point) {
  const rect = el.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
