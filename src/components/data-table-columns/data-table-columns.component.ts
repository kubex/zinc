import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnCheckbox from '../checkbox';
import ZnIcon from '../icon';
import ZnSlideout from '../slideout';

import styles from './data-table-columns.scss';

export interface ColumnOption {
  key: string;
  label: string;
}

/**
 * @summary Column visibility and ordering control for data tables.
 * @documentation https://zinc.style/components/data-table-columns
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-checkbox
 * @dependency zn-icon
 * @dependency zn-slideout
 *
 * @event zn-columns-change - Emitted with the ordered list of visible column keys when the user changes columns.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnDataTableColumns extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-checkbox': ZnCheckbox,
    'zn-icon': ZnIcon,
    'zn-slideout': ZnSlideout,
  };

  @query('zn-slideout') private slideout: ZnSlideout;

  @property({type: Object}) columns: ColumnOption[] = [];

  // Ordered list of visible keys (order + visibility combined).
  @property({type: Array}) value: string[] = [];

  @property() label: string = 'Columns';

  // Full display order of ALL columns (drag order). Visibility is derived from `value`.
  @state() private _order: string[] = [];

  // Drag state
  @state() private _draggedKey: string | null = null;

  private open() {
    this.slideout?.show();
  }

  protected willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    // Rebuild the order only when the set of columns changes (or on first run).
    // Toggling visibility or reordering must NOT rebuild it, or the list would
    // reshuffle mid-interaction and fight the checkboxes.
    if (changedProperties.has('columns') || (changedProperties.has('value') && this._order.length === 0)) {
      this._reconcileOrder();
    }
  }

  private _reconcileOrder() {
    const columnKeys = this.columns.map(c => c.key);
    const columnSet = new Set(columnKeys);

    if (this._order.length === 0) {
      // Initial: visible columns (in `value` order) first, then the rest in declared order.
      const visibleOrdered = this.value.filter(k => columnSet.has(k));
      const visibleSet = new Set(visibleOrdered);
      const rest = columnKeys.filter(k => !visibleSet.has(k));
      this._order = [...visibleOrdered, ...rest];
      return;
    }

    // Preserve the current drag order; drop removed columns, append newly-added ones.
    const surviving = this._order.filter(k => columnSet.has(k));
    const survivingSet = new Set(surviving);
    const added = columnKeys.filter(k => !survivingSet.has(k));
    this._order = [...surviving, ...added];
  }

  toggleColumn(key: string, checked: boolean) {
    const visibleSet = new Set(this.value);
    if (checked) {
      if (visibleSet.has(key)) return;
      visibleSet.add(key);
    } else {
      if (visibleSet.size <= 1) return; // keep at least one visible
      visibleSet.delete(key);
    }
    this.value = this._order.filter(k => visibleSet.has(k));
    this._emitChange();
  }

  private handleCheckbox = (e: Event, key: string) => {
    const cb = e.target as ZnCheckbox;
    this.toggleColumn(key, cb.checked);
  };

  // --- Drag and Drop (modeled on zn-priority-list) ---

  private _handleDragStart(event: DragEvent, key: string) {
    this._draggedKey = key;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
    }
  }

  private _handleDragOver(event: DragEvent, key: string) {
    event.preventDefault();
    if (!this._draggedKey || this._draggedKey === key) return;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    // Move the dragged key in real-time so other rows shift around.
    const fromIndex = this._order.indexOf(this._draggedKey);
    const toIndex = this._order.indexOf(key);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const newOrder = [...this._order];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    this._order = newOrder;
  }

  private _handleDrop(event: DragEvent) {
    event.preventDefault();
    // Already in position from real-time dragover moves; dragend emits the change.
  }

  private _handleDragEnd() {
    if (this._draggedKey) {
      const visibleSet = new Set(this.value);
      this.value = this._order.filter(k => visibleSet.has(k));
      this._emitChange();
    }
    this._draggedKey = null;
  }

  private _emitChange() {
    this.emit('zn-columns-change', {detail: {columns: [...this.value]}});
  }

  render() {
    const visibleSet = new Set(this.value);
    const labelByKey = new Map(this.columns.map(c => [c.key, c.label]));

    return html`
      <zn-button
        part="base"
        icon-button
        icon="columns_3@lu"
        aria-label="${this.label}"
        @click="${this.open}">
      </zn-button>

      <zn-slideout label="${this.label}" style="--width: 420px;">
        <div class="columns" role="list">
          ${repeat(this._order, (key) => key, (key) => html`
            <div
              class="${classMap({
                'columns__row': true,
                'columns__row--dragging': this._draggedKey === key,
              })}"
              role="listitem"
              @dragover="${(e: DragEvent) => this._handleDragOver(e, key)}"
              @drop="${this._handleDrop}">
              <span
                class="columns__handle"
                draggable="true"
                aria-label="Reorder ${labelByKey.get(key) ?? key}"
                @dragstart="${(e: DragEvent) => this._handleDragStart(e, key)}"
                @dragend="${this._handleDragEnd}">
                <zn-icon src="drag_indicator" size="16"></zn-icon>
              </span>
              <zn-checkbox
                ?checked=${visibleSet.has(key)}
                @zn-change=${(e: Event) => this.handleCheckbox(e, key)}>
              </zn-checkbox>
              <span class="columns__label">${labelByKey.get(key) ?? key}</span>
            </div>
          `)}
        </div>
      </zn-slideout>
    `;
  }
}
