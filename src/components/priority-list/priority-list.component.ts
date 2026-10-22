import {classMap} from "lit/directives/class-map.js";
import {clipCornerRadius, ReorderController} from '../../internal/reorder';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {
  FormControlController,
  validValidityState,
} from "../../internal/form";
import {HasSlotController} from '../../internal/slot';
import {property, query, state} from 'lit/decorators.js';
import {repeat} from "lit/directives/repeat.js";
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnIcon from '../icon';
import type {ZincFormControl} from '../../internal/zinc-element';

import formControlStyles from '../../form-control.scss';
import styles from './priority-list.scss';

export interface PriorityItem {
  key: string;
  priority: number;
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

/**
 * @summary A reorderable list where each item receives a numerical priority based on its position. Supports drag-and-drop
 *   and keyboard reordering. Priority values are submitted as form data via hidden inputs.
 *
 * @documentation https://zinc.style/components/priority-list
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 *
 * @slot - The default slot where list items are placed. Each slotted element must have a `value` attribute that
 *   uniquely identifies the item. The component automatically assigns slot names to project each item into the
 *   correct position. The item's position in the list determines its priority (top = `priority-start`, incrementing).
 *   Use `zn-tile` items for titled rows with their own actions. Set `locked` on an item to pin it where it is.
 * @slot action-{value} - Controls shown at the end of the item with that `value`.
 * @slot label - The component's label. Required for proper accessibility. Alternatively, use the `label` attribute.
 * @slot label-tooltip - Used to add text displayed in a tooltip next to the label.
 * @slot help-text - Text that describes how to use the component. Alternatively, use the `help-text` attribute.
 *
 * @event zn-change - Emitted when the order of items changes.
 * @event zn-reorder - Emitted when items are reordered. Call `getPriorityMap()` on the component to get
 *   the updated `{ key: string, priority: number }[]` array.
 *
 * @csspart form-control - The form control wrapper.
 * @csspart form-control-label - The label wrapper.
 * @csspart form-control-input - The input area wrapper.
 * @csspart form-control-help-text - The help text wrapper.
 * @csspart list - The list container.
 * @csspart item - An individual list item row.
 * @csspart drag-handle - The drag handle icon.
 * @csspart priority - The priority number badge.
 * @csspart content - The content area of an item.
 *
 * @cssproperty --zn-priority-list-item-gap - The gap between list items. Defaults to `var(--zn-spacing-2x-small)`.
 * @cssproperty --zn-priority-list-item-padding - The padding inside each item. Defaults to `var(--zn-spacing-small) var(--zn-spacing-medium)`.
 * @cssproperty --zn-priority-list-actions-gap - The gap between an item's slotted actions. Defaults to `var(--zn-spacing-x-small)`.
 * @cssproperty --zn-priority-list-handle-color - The color of the drag handle. Defaults to `var(--zn-color-neutral-500)`.
 * @cssproperty --zn-priority-list-priority-color - The color of the priority number. Defaults to `var(--zn-color-neutral-600)`.
 */
export default class ZnPriorityList extends ZincElement implements ZincFormControl {
  static dependencies = {
    'zn-button': ZnButton,
    'zn-icon': ZnIcon,
  };

  static styles: CSSResultGroup = [unsafeCSS(formControlStyles), unsafeCSS(styles)];

  protected readonly formControlController = new FormControlController(this, {
    value: (control: ZnPriorityList) => {
      return JSON.stringify(control.getPriorityMap());
    },
    defaultValue: (control: ZnPriorityList) => control.defaultValue,
    // A form reset passes defaultValue straight back in, so this has to accept the
    // key array as well as the serialised value other callers set.
    setValue: (control: ZnPriorityList, value: string | string[]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      const keys: unknown = Array.isArray(value) ? value : safeParse(value);
      if (Array.isArray(keys) && keys.every((item: unknown): item is string => typeof item === 'string')) {
        control.value = keys as string[];
      }
    },
  });

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');

  private readonly reorderController: ReorderController = new ReorderController(this, {
    formControl: this.formControlController,
    fallbackFields: () => this.name ? this.getPriorityMap().map(({key, priority}) => [`${this.name}[${key}]`, String(priority)]) : [],
    modifier: 'alt',
    focus: key => this.reorderRow(key)?.focus(),
  });

  @query('.priority-list__hidden-inputs') hiddenInputsContainer: HTMLDivElement;

  /**
   * The name prefix for form submission. Each item generates a hidden input named `{name}[{itemValue}]`
   * with the priority number as its value.
   */
  @property() name = '';

  /**
   * The current ordered list of item keys, reflecting the visual order. This is the source of truth for ordering.
   * Each entry should match a `value` attribute on a slotted child element.
   */
  @property({type: Array})
  get value(): string[] {
    return this._value;
  }

  set value(val: string[]) {
    const oldVal = this._value;
    this._value = [...val];
    this._assignSlotNames();
    this.requestUpdate('value', oldVal);
  }

  private _value: string[] = [];

  @state() defaultValue: string[] = [];

  /** The item holding the list's single tab stop. */
  @state() private _focusKey = '';

  /** The component's label. Required for proper accessibility. */
  @property() label = '';

  /** Text that appears in a tooltip next to the label. */
  @property({attribute: 'label-tooltip'}) labelTooltip = '';

  /** Help text that describes how to use the component. */
  @property({attribute: 'help-text'}) helpText = '';

  /**
   * Associates the control with a form by id. The form must be in the same document or shadow root.
   */
  @property({reflect: true}) form = '';

  /** The size of the list items. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /** Whether the priority list is disabled. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Ensures the form control has a value before allowing submission. */
  @property({type: Boolean, reflect: true}) required = false;

  /** The starting priority number. Defaults to 1. */
  @property({type: Number, attribute: 'priority-start'}) priorityStart = 1;

  /** Draws the items as rows divided edge to edge, for a list filling a flush panel; the label is kept for
   * screen readers only. */
  @property({type: Boolean, reflect: true}) flush = false;

  /** Lets a click or Enter select an item as well as drag it, for a list that doubles as navigation. The click is
   * passed on to the item, so a `tab` or link on it acts as if clicked. */
  @property({type: Boolean, reflect: true}) selectable = false;

  /** The selected item's value. An item marked active by zn-tabs takes precedence, so the list follows its tabs. */
  @property({reflect: true}) selected = '';

  /** Hides each item's priority number, for lists where the order shows the priority. */
  @property({type: Boolean, attribute: 'hide-priority', reflect: true}) hidePriority = false;

  /** Shows move up and move down buttons on each item. */
  @property({type: Boolean, attribute: 'move-buttons', reflect: true}) moveButtons = false;

  /**
   * When set, the associated form will be submitted with the given action URL whenever items are reordered.
   * If set to an empty string, the form will be submitted using its existing action.
   */
  @property({attribute: 'formaction'}) formAction: string;

  /**
   * A comma-separated list of item keys defining the initial display order.
   * Keys must match the `value` attributes on slotted children.
   * Any slotted items not listed are appended at the end in DOM order.
   */
  @property() order = '';

  /** Gets the validity state object. */
  get validity(): ValidityState {
    return validValidityState;
  }

  /** Gets the validation message. */
  get validationMessage(): string {
    return '';
  }

  private _itemObserver = new MutationObserver(() => this.requestUpdate());

  connectedCallback() {
    super.connectedCallback();
    this.defaultValue = [...this._value];
    this._itemObserver.observe(this, {
      childList: true,
      subtree: true,
      attributeFilter: ['locked', 'class'],
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._itemObserver.disconnect();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.formControlController.updateValidity();
    this._initializeOrderFromSlot();
  }

  /**
   * Initialize item order from slotted children if no explicit value was provided.
   * If an `order` attribute is set, use it to define the initial order,
   * appending any slotted items not listed in the order at the end.
   */
  private _initializeOrderFromSlot() {
    if (this._value.length === 0) {
      const items = this._getSlottedItems();
      const domKeys = items.map(el => el.getAttribute('value') || '').filter(v => v !== '');

      if (this.order) {
        const orderedKeys = this.order.split(',').map(k => k.trim()).filter(k => k !== '');
        const domKeySet = new Set(domKeys);
        // Only include keys that exist in the DOM
        const validOrdered = orderedKeys.filter(k => domKeySet.has(k));
        // Append any DOM items not listed in the order attribute
        const orderedSet = new Set(validOrdered);
        const remaining = domKeys.filter(k => !orderedSet.has(k));
        this._value = [...validOrdered, ...remaining];
      } else {
        this._value = domKeys;
      }
    }
    this.defaultValue = [...this._value];
    this._assignSlotNames();
    this._syncHiddenInputs();
    this.requestUpdate();
  }

  /**
   * Gets all direct children with a `value` attribute (excluding those in reserved slots).
   */
  private _getSlottedItems(): HTMLElement[] {
    const reservedSlots = ['label', 'label-tooltip', 'help-text'];
    return [...this.querySelectorAll<HTMLElement>(':scope > [value]')].filter(el => {
      const slot = el.getAttribute('slot');
      // Exclude elements in reserved semantic slots; allow unslotted or internally assigned items
      return !slot || slot.startsWith('_item-') || !reservedSlots.includes(slot);
    });
  }

  /**
   * Assigns `slot` attributes to light DOM children based on their `value` attribute,
   * so they project into the correct named slot in the shadow DOM.
   */
  private _assignSlotNames() {
    const items = [...this.querySelectorAll<HTMLElement>(':scope > [value]')];
    items.forEach(el => {
      const itemValue = el.getAttribute('value');
      if (itemValue && !['label', 'label-tooltip', 'help-text'].includes(itemValue)) {
        el.setAttribute('slot', `_item-${itemValue}`);
      }
    });
  }

  /**
   * Returns the priority map: an array of { key, priority } objects.
   */
  getPriorityMap(): PriorityItem[] {
    return this._value.map((key, index) => ({
      key,
      priority: this.priorityStart + index,
    }));
  }

  /**
   * Syncs hidden inputs so form data includes priority values.
   */
  private _syncHiddenInputs() {
    if (!this.hiddenInputsContainer) return;

    this.hiddenInputsContainer.innerHTML = '';

    if (!this.name) return;

    this._value.forEach((key, index) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = `${this.name}[${key}]`;
      input.value = String(this.priorityStart + index);
      this.hiddenInputsContainer.appendChild(input);
    });
  }

  private _item(key: string) {
    return this.querySelector<HTMLElement>(`:scope > [value="${CSS.escape(key)}"]`);
  }

  /** @internal ReorderHost: the items' keys in order. */
  reorderKeys() {
    return [...this._value];
  }

  /** @internal ReorderHost: renders the items in a new order. */
  applyReorder(keys: string[]) {
    this._value = keys;
    this._assignSlotNames();
    this._syncHiddenInputs();
    this.requestUpdate();
  }

  /** @internal ReorderHost: the row drawn for an item. */
  reorderRow(key: string) {
    const index = this._value.indexOf(key);
    return this.shadowRoot?.querySelectorAll<HTMLElement>('.priority-list__item')[index] ?? null;
  }

  /** @internal ReorderHost: whether an item is pinned where it is. */
  reorderLocked(key: string) {
    return this._item(key)?.hasAttribute('locked') ?? false;
  }

  private async _handleStep(event: Event, key: string, step: number) {
    event.stopPropagation();
    const button = event.currentTarget as ZnButton;
    const hadFocus = button.matches(':focus-within');
    if (!this.reorderController.step(key, step) || !hadFocus) return;

    // Moving the row can detach it, which drops focus even when the button stays enabled
    await this.updateComplete;
    const target = [button, ...button.parentElement!.querySelectorAll<ZnButton>('zn-button')].find(b => !b.disabled);
    if (target) {
      target.button.focus();
    } else {
      this.reorderRow(key)?.focus();
    }
  }

  // --- Keyboard Handlers ---

  private _selectedKey(): string {
    if (!this.selectable) return '';
    const active = this._getSlottedItems().find(el => el.classList.contains('zn-tb-active'));
    return active?.getAttribute('value') || this.selected;
  }

  private _select(key: string) {
    if (!this.selectable) return;
    this.selected = key;
    const item = this._item(key);
    if (!item) return;
    item.click();
    this.emit('zn-select', {detail: {item}});
  }

  private _matchClipCorners(row: HTMLElement) {
    const radius = clipCornerRadius(this, row);
    if (radius) {
      row.style.setProperty('--zn-priority-list-drag-radius', radius);
    } else {
      row.style.removeProperty('--zn-priority-list-drag-radius');
    }
  }

  private _handleItemClick(event: MouseEvent, key: string) {
    const path = event.composedPath();
    // An action is its own control, and the click _select passes on to the item bubbles back through the row.
    if (path.some(el => el instanceof HTMLElement && el.classList.contains('priority-list__actions'))
      || path.includes(this._item(key)!)) {
      return;
    }
    this._select(key);
  }

  private _handleKeyDown(event: KeyboardEvent, key: string) {
    if (this.disabled) return;

    if (this.selectable && (event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
      event.preventDefault();
      this._select(key);
      return;
    }

    if (this.reorderController.handleKeyDown(event, key) || event.target !== event.currentTarget) return;

    const index = this._value.indexOf(key);
    const next = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: 0,
      End: this._value.length - 1,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault();
    this.reorderRow(this._value[Math.max(0, Math.min(next, this._value.length - 1))])?.focus();
  }

  // --- Slot Change Handler ---

  private _handleSlotChange() {
    // Query all items with a value attribute (including those already assigned to _item- slots)
    const allItems = [...this.querySelectorAll<HTMLElement>(':scope > [value]')];
    const reservedSlots = ['label', 'label-tooltip', 'help-text'];
    const slottedKeys = allItems
      .filter(el => {
        const slot = el.getAttribute('slot');
        return !slot || slot.startsWith('_item-') || !reservedSlots.includes(slot);
      })
      .map(el => el.getAttribute('value') || '')
      .filter(v => v !== '');

    // If no items found but we already have an order, skip — this is likely a
    // slotchange firing because items moved from the default slot to named slots
    if (slottedKeys.length === 0 && this._value.length > 0) return;

    const currentKeys = new Set(this._value);
    const slottedKeysSet = new Set(slottedKeys);

    // Add new keys that are not in the current order
    const newKeys = slottedKeys.filter(k => !currentKeys.has(k));
    // Remove keys that are no longer in the DOM
    const remainingKeys = this._value.filter(k => slottedKeysSet.has(k));

    if (newKeys.length > 0 || remainingKeys.length !== this._value.length) {
      this._value = [...remainingKeys, ...newKeys];
      this._assignSlotNames();
      this._syncHiddenInputs();
      this.requestUpdate();
    }
  }

  // --- Form Control Methods ---

  /** Checks for validity but does not show a validation message. */
  checkValidity(): boolean {
    return true;
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity(): boolean {
    return true;
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCustomValidity(_message = '') {
    // No custom validation needed for this component
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('value') || changedProperties.has('name') || changedProperties.has('priorityStart')) {
      this._syncHiddenInputs();
    }

    // Re-measured on every render, as the placeholder moves into and out of the panel's corners during a drag.
    // Runs before the reorder slide starts, so the row is measured in its final place.
    const placeholder = this.shadowRoot?.querySelector<HTMLElement>('.priority-list__item--dragging');
    if (placeholder) {
      this._matchClipCorners(placeholder);
    }
  }

  render() {
    const selectedKey = this._selectedKey();
    const tabStop = [this._focusKey, selectedKey].find(key => key && this._value.includes(key)) ?? this._value[0];
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltipSlot = this.hasSlotController.test('label-tooltip');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasLabelTooltip = this.labelTooltip ? true : hasLabelTooltipSlot;
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;

    return html`
      <fieldset
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control--small': this.size === 'small',
          'form-control--medium': this.size === 'medium',
          'form-control--large': this.size === 'large',
          'form-control--has-label': hasLabel,
          'form-control--has-label-tooltip': hasLabelTooltip,
          'form-control--has-help-text': hasHelpText,
        })}
        aria-labelledby="label"
        aria-describedby="help-text"
        ?disabled=${this.disabled}>
        <label
          part="form-control-label"
          id="label"
          class="form-control__label"
          aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>
          ${hasLabelTooltip
            ? html`
              <zn-tooltip class="form-control--label-tooltip">
                <div slot="content">
                  <slot name="label-tooltip">${this.labelTooltip}</slot>
                </div>
                <zn-icon src="info"></zn-icon>
              </zn-tooltip>`
            : ''}
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="list"
            class=${classMap({
              'priority-list': true,
              'priority-list--disabled': this.disabled,
              'priority-list--drag-active': this.reorderController.isDragging,
            })}
            role="listbox"
            aria-label=${this.label || 'Reorderable list'}
            aria-orientation="vertical"
            @dragover=${(e: DragEvent) => { if (e.target === e.currentTarget) this.reorderController.handleDragOver(e); }}>
            ${repeat(this._value, (key) => key, (key, index) => {
              const item = this._item(key);
              const locked = item?.hasAttribute('locked') ?? false;
              const caption = item?.getAttribute('caption') || key;
              return html`
              <div
                part="item"
                class=${classMap({
                  'priority-list__item': true,
                  'priority-list__item--dragging': this.reorderController.draggedKey === key,
                  'priority-list__item--disabled': this.disabled,
                  'priority-list__item--locked': locked,
                  'priority-list__item--selectable': this.selectable,
                  'priority-list__item--selected': key === selectedKey,
                })}
                role="option"
                tabindex=${!this.disabled && key === tabStop ? '0' : '-1'}
                aria-selected=${key === selectedKey ? 'true' : 'false'}
                aria-label="${caption} - priority ${this.priorityStart + index}"
                draggable=${this.disabled || locked ? 'false' : 'true'}
                @dragstart=${(e: DragEvent) => this.reorderController.handleDragStart(e, key)}
                @dragend=${(e: DragEvent) => this.reorderController.handleDragEnd(e)}
                @dragover=${(e: DragEvent) => this.reorderController.handleDragOver(e, key)}
                @drop=${(e: DragEvent) => this.reorderController.handleDrop(e)}
                @focus=${() => { this._focusKey = key; }}
                @click=${(e: MouseEvent) => this._handleItemClick(e, key)}
                @keydown=${(e: KeyboardEvent) => this._handleKeyDown(e, key)}>
                <span class="priority-list__handle" part="drag-handle">
                  <zn-icon src="${locked ? 'lock@lu' : 'drag_indicator'}" size="16"></zn-icon>
                </span>
                <span class="priority-list__priority" part="priority">${this.priorityStart + index}</span>
                <span class="priority-list__content" part="content">
                  <slot name="_item-${key}"></slot>
                </span>
                <span class="priority-list__actions" part="actions">
                  ${this.moveButtons && !locked ? html`
                    <span class="priority-list__move">
                      <zn-button icon="chevron-up@lu" icon-size="18" icon-button="small" plain label="Move up"
                                 tooltip="Move up"
                                 ?disabled=${this.disabled || !this.reorderController.canStep(key, -1)}
                                 @click=${(e: Event) => this._handleStep(e, key, -1)}></zn-button>
                      <zn-button icon="chevron-down@lu" icon-size="18" icon-button="small" plain label="Move down"
                                 tooltip="Move down"
                                 ?disabled=${this.disabled || !this.reorderController.canStep(key, 1)}
                                 @click=${(e: Event) => this._handleStep(e, key, 1)}></zn-button>
                    </span>` : null}
                  <slot name="action-${key}"></slot>
                </span>
              </div>
            `;
            })}
          </div>

          <!-- Hidden default slot to capture light DOM children for initial detection -->
          <div class="priority-list__collector">
            <slot @slotchange=${this._handleSlotChange}></slot>
          </div>

          <div class="priority-list__hidden-inputs"></div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </fieldset>
    `;
  }
}
