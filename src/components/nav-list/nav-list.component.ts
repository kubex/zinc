import {clipCornerRadius, ReorderController} from '../../internal/reorder';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from '../../internal/form';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnInput from '../input';
import type {ZincFormControl} from '../../internal/zinc-element';
import type ZnNavItem from '../nav-item';

import styles from './nav-list.scss';

/**
 * @summary The list side of a master–detail layout: a card of selectable groups shown beside the selected group's
 * contents. Place it in the `left` slot of `<zn-tabs gap>`, which switches the detail panels.
 * @documentation https://zinc.style/components/nav-list
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-input
 *
 * @slot - `zn-nav-item` elements.
 * @slot actions - Actions in the card's header, beside the caption.
 *
 * @csspart base - The component's base wrapper.
 * @csspart header - The header holding the caption and actions.
 * @csspart search - The wrapper around the search input.
 * @csspart list - The scrolling list of items.
 * @csspart empty - The message shown when the search matches nothing.
 *
 * @cssproperty --zn-nav-list-width - The width of the card beside the detail.
 * @cssproperty --zn-nav-list-max-height - Caps the card's height; the list scrolls beyond it.
 *
 * @event zn-change - Emitted when a sortable list's items have been moved.
 * @event zn-reorder - Emitted when a sortable list's items have been moved.
 */
export default class ZnNavList extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-input': ZnInput,
  };

  protected readonly formControlController = new FormControlController(this, {
    // The same `[{key, priority}]` JSON a zn-priority-list submits, so a handler can take either
    value: (control: ZnNavList) => control.sortable ? JSON.stringify(control.getPriorityMap()) : undefined,
    defaultValue: () => undefined,
    setValue: () => undefined,
  });

  private readonly hasSlotController = new HasSlotController(this, 'actions');

  private readonly reorderController: ReorderController = new ReorderController(this, {
    formControl: this.formControlController,
    fallbackFields: () => this.name ? [[this.name, JSON.stringify(this.getPriorityMap())]] : [],
    // Plain arrows move between items; Alt moves the item itself
    modifier: 'alt',
    focus: key => this._item(key)?.focus(),
  });

  /** Shows a search input that filters the items by their label. */
  @property({type: Boolean, reflect: true}) searchable = false;

  @property({attribute: 'search-placeholder'}) searchPlaceholder = 'Search';

  /** Shown when the search matches no items. */
  @property({attribute: 'empty-label'}) emptyLabel = 'No matches';

  /** A heading for the card, shown with the `actions` slot above the items. */
  @property() caption = '';

  /** Draws the items as full-width rows split by dividers, marking the selected one with a bar on its edge. */
  @property({type: Boolean, reflect: true}) divide = false;

  /** Lets the items be dragged, or moved with Alt+Arrow keys, into a new order. */
  @property({type: Boolean, reflect: true}) sortable = false;

  /** Submits the order as `[{key, priority}]` JSON, keyed by each item's `value` (or `tab`), counting from 1. */
  @property() name = '';

  /** Associates the list with a form by id. */
  @property({reflect: true}) form = '';

  @property({type: Boolean, reflect: true}) disabled = false;

  /**
   * When set, the form is submitted after each reorder, to this URL or, when empty, the form's own action.
   */
  @property({attribute: 'formaction'}) formAction: string;

  @state() private _query = '';

  private readonly _selectionObserver = new MutationObserver(() => this._syncTabStops());

  get validity(): ValidityState {
    return validValidityState;
  }

  get validationMessage(): string {
    return '';
  }

  connectedCallback() {
    super.connectedCallback();
    // zn-tabs marks the active item with a class, after the click that selects it
    this._selectionObserver.observe(this, {subtree: true, attributes: true, attributeFilter: ['class']});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._selectionObserver.disconnect();
  }

  private get _items(): ZnNavItem[] {
    return [...this.querySelectorAll<ZnNavItem>(':scope > zn-nav-item')];
  }

  private get _visibleItems() {
    return this._items.filter(item => !item.hidden);
  }

  private _key(item: ZnNavItem) {
    return item.getAttribute('value') ?? item.getAttribute('tab') ?? '';
  }

  private _item(key: string) {
    return this._items.find(item => this._key(item) === key) ?? null;
  }

  /** The order as `[{key, priority}]` JSON. */
  get value() {
    return JSON.stringify(this.getPriorityMap());
  }

  /** The order as `{key, priority}` pairs, counting from 1. */
  getPriorityMap() {
    return this._items.map((item, index) => ({key: this._key(item), priority: index + 1}));
  }

  /** @internal ReorderHost: the items' keys in order. */
  reorderKeys() {
    return this._items.map(item => this._key(item));
  }

  /** @internal ReorderHost: puts the items in a new order. */
  applyReorder(keys: string[]) {
    for (const key of keys) {
      const item = this._item(key);
      if (item) this.append(item);
    }
    // Measured now, in the final place, before the reorder slide moves the rows
    this._syncDragCorners();
  }

  /** @internal ReorderHost: the row drawn for an item. */
  reorderRow(key: string) {
    return this._item(key);
  }

  /** @internal ReorderHost: whether an item is pinned where it is. */
  reorderLocked(key: string) {
    return this._item(key)?.hasAttribute('locked') ?? false;
  }

  /** The key of the item an event happened on, when it is one of this list's. */
  private _eventKey(e: Event) {
    const item = (e.target as Element).closest?.('zn-nav-item') as ZnNavItem | null;
    return item && item.parentElement === this ? this._key(item) : null;
  }

  private _handleSlotChange() {
    this._syncTabStops();
    this._syncItems();
  }

  private _syncItems() {
    const dragged = this.reorderController.draggedKey;
    for (const item of this._items) {
      item.toggleAttribute('divide', this.divide);
      item.toggleAttribute('sortable', this.sortable);
      item.draggable = this.sortable && !this.disabled && !this.reorderLocked(this._key(item));
      item.toggleAttribute('dragging', this._key(item) === dragged);
    }
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this._syncItems();
    this._syncDragCorners();
  }

  /** Rounds a divided list's placeholder into the card corners it moves into while dragging. */
  private _syncDragCorners() {
    const dragged = this.reorderController.draggedKey;
    const item = dragged === null ? null : this._item(dragged);
    if (!item) return;
    const radius = this.divide ? clipCornerRadius(item, item) : null;
    if (radius) {
      item.style.setProperty('--zn-nav-item-drag-radius', radius);
    } else {
      item.style.removeProperty('--zn-nav-item-drag-radius');
    }
  }

  /** Keeps a single tab stop in the list: the selected item when it is visible, otherwise the first. */
  private _syncTabStops() {
    const visible = this._visibleItems;
    const stop = visible.find(item => item.selected) ?? visible[0];
    for (const item of this._items) {
      item.tabIndex = item === stop ? 0 : -1;
    }
  }

  private _handleSearch(e: Event) {
    this._query = String((e.target as ZnInput).value ?? '').trim().toLowerCase();
    for (const item of this._items) {
      item.hidden = this._query !== '' && !(item.textContent ?? '').toLowerCase().includes(this._query);
    }
    this._syncTabStops();
  }

  private _handleKeyDown(e: KeyboardEvent) {
    const visible = this._visibleItems;
    const current = visible.indexOf(e.target as ZnNavItem);
    if (current === -1) return;

    if (this.sortable && this.reorderController.handleKeyDown(e, this._key(visible[current]))) {
      return;
    }

    let next: number;
    switch (e.key) {
      case 'ArrowDown':
        next = Math.min(current + 1, visible.length - 1);
        break;
      case 'ArrowUp':
        next = Math.max(current - 1, 0);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = visible.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    for (const item of this._items) {
      item.tabIndex = item === visible[next] ? 0 : -1;
    }
    visible[next].focus();
  }

  private _handleDragStart(e: DragEvent) {
    const key = this._eventKey(e);
    if (this.sortable && key !== null) this.reorderController.handleDragStart(e, key);
  }

  private _handleDragOver(e: DragEvent) {
    this.reorderController.handleDragOver(e, this._eventKey(e));
  }

  // --- Form control ---

  checkValidity() {
    return true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity() {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCustomValidity(_message = '') {
    // Nothing to validate
  }

  render() {
    const noMatches = this._query !== '' && this._visibleItems.length === 0;

    return html`
      <div part="base" class="nav-list">
        ${this.caption || this.hasSlotController.test('actions') ? html`
          <div part="header" class="nav-list__header">
            <span class="nav-list__caption">${this.caption}</span>
            <slot name="actions" class="nav-list__actions"></slot>
          </div>` : ''}
        ${this.searchable ? html`
          <div part="search" class="nav-list__search">
            <zn-input
              type="search"
              size="small"
              clearable
              placeholder="${this.searchPlaceholder}"
              @zn-input="${this._handleSearch}"
              @zn-clear="${this._handleSearch}">
            </zn-input>
          </div>` : ''}
        <div
          part="list"
          class="nav-list__list"
          role="tablist"
          aria-orientation="vertical"
          @keydown="${this._handleKeyDown}"
          @dragstart="${this._handleDragStart}"
          @dragover="${this._handleDragOver}"
          @drop="${(e: DragEvent) => this.reorderController.handleDrop(e)}"
          @dragend="${(e: DragEvent) => this.reorderController.handleDragEnd(e)}">
          <slot @slotchange="${this._handleSlotChange}"></slot>
          ${noMatches ? html`<p part="empty" class="nav-list__empty">${this.emptyLabel}</p>` : ''}
        </div>
      </div>
    `;
  }
}
