import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {
  FormControlController,
  validValidityState,
} from "../../internal/form";
import {HasSlotController} from '../../internal/slot';
import {property, query, state} from 'lit/decorators.js';
import {repeat} from "lit/directives/repeat.js";
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './priority-list.scss';

export interface PriorityItem {
  key: string;
  priority: number;
}

/**
 * @summary A reorderable list where each item receives a numerical priority based on its position. Supports drag-and-drop
 *   and keyboard reordering. Priority values are submitted as form data via hidden inputs.
 *
 * @documentation https://zinc.style/components/priority-list
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The default slot where list items are placed. Each slotted element must have a `value` attribute that
 *   uniquely identifies the item. The component automatically assigns slot names to project each item into the
 *   correct position. The item's position in the list determines its priority (top = `priority-start`, incrementing).
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
 * @cssproperty --zn-priority-list-handle-color - The color of the drag handle. Defaults to `var(--zn-color-neutral-500)`.
 * @cssproperty --zn-priority-list-priority-color - The color of the priority number. Defaults to `var(--zn-color-neutral-600)`.
 */
export default class ZnPriorityList extends ZincElement implements ZincFormControl {
  static dependencies = {
    'zn-icon': ZnIcon,
  };

  static styles: CSSResultGroup = unsafeCSS(styles);

  protected readonly formControlController = new FormControlController(this, {
    value: (control: ZnPriorityList) => {
      return JSON.stringify(control.getPriorityMap());
    },
    defaultValue: (control: ZnPriorityList) => control.defaultValue,
    setValue: (control: ZnPriorityList, value: string) => {
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            control.value = parsed;
          }
        } catch {
          // ignore parse errors
        }
      }
    },
  });

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');

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

  // Drag state
  @state() private draggedKey: string | null = null;
  @state() private isDragging = false;
  private dragOverKey: string | null = null;

  /** Gets the validity state object. */
  get validity(): ValidityState {
    return validValidityState;
  }

  /** Gets the validation message. */
  get validationMessage(): string {
    return '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.defaultValue = [...this._value];
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

      this.defaultValue = [...this._value];
    }
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

  /**
   * Moves an item from one index to another.
   */
  private _moveItem(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= this._value.length || toIndex >= this._value.length) return;

    const newOrder = [...this._value];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);

    this._value = newOrder;
    this._assignSlotNames();
    this._syncHiddenInputs();
    this.requestUpdate();

    this.emit('zn-change');
    this.emit('zn-reorder');
    this._submitForm();
  }

  /**
   * Submits the associated form if a `formaction` attribute is set.
   */
  private _submitForm() {
    if (this.formAction === undefined || this.formAction === null) return;

    const form = this.getForm();
    if (!form) return;

    const originalAction = form.action;
    if (this.formAction) {
      form.action = this.formAction;
    }
    form.requestSubmit();
    form.action = originalAction;
  }

  // --- Drag and Drop Handlers ---

  private _handleDragStart(event: DragEvent, key: string) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    this.draggedKey = key;
    this.isDragging = true;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
    }
  }

  private _handleDragEnd() {
    if (this.isDragging) {
      // Emit events for the final position change
      this._syncHiddenInputs();
      this.emit('zn-change');
      this.emit('zn-reorder');
      this._submitForm();
    }

    this.draggedKey = null;
    this.dragOverKey = null;
    this.isDragging = false;
  }

  private _handleDragOver(event: DragEvent, key: string) {
    event.preventDefault();

    if (!this.draggedKey || this.draggedKey === key) return;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    // Move the item in real-time so other items shift around
    const fromIndex = this._value.indexOf(this.draggedKey);
    const toIndex = this._value.indexOf(key);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const newOrder = [...this._value];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    this._value = newOrder;
    this._assignSlotNames();
    this.requestUpdate();

    this.dragOverKey = key;
  }

  private _handleDragLeave(event: DragEvent, key: string) {
    const related = event.relatedTarget as Node | null;
    const target = event.currentTarget as HTMLElement;
    if (related && target.contains(related)) return;

    if (this.dragOverKey === key) {
      this.dragOverKey = null;
    }
  }

  private _handleDrop(event: DragEvent) {
    event.preventDefault();
    // Item is already in position from real-time dragover moves
    // dragend handles cleanup and event emission
  }

  // --- Keyboard Handlers ---

  private _handleKeyDown(event: KeyboardEvent, key: string) {
    if (this.disabled) return;

    const index = this._value.indexOf(key);
    if (index === -1) return;

    let newIndex: number | null = null;

    switch (event.key) {
      case 'ArrowUp':
        if (index > 0) {
          newIndex = index - 1;
        }
        break;
      case 'ArrowDown':
        if (index < this._value.length - 1) {
          newIndex = index + 1;
        }
        break;
      case 'Home':
        if (index > 0) {
          newIndex = 0;
        }
        break;
      case 'End':
        if (index < this._value.length - 1) {
          newIndex = this._value.length - 1;
        }
        break;
      default:
        return;
    }

    if (newIndex !== null) {
      event.preventDefault();
      this._moveItem(index, newIndex);

      // Focus the moved item after re-render
      this.updateComplete.then(() => {
        const items = this.shadowRoot?.querySelectorAll<HTMLElement>('.priority-list__item');
        items?.[newIndex!]?.focus();
      });
    }
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
  }

  render() {
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
              'priority-list--drag-active': this.isDragging,
            })}
            role="listbox"
            aria-label=${this.label || 'Reorderable list'}
            aria-orientation="vertical">
            ${repeat(this._value, (key) => key, (key, index) => html`
              <div
                part="item"
                class=${classMap({
                  'priority-list__item': true,
                  'priority-list__item--dragging': this.draggedKey === key,
                  'priority-list__item--disabled': this.disabled,
                })}
                role="option"
                tabindex=${this.disabled ? '-1' : '0'}
                aria-selected="false"
                aria-label="${key} - priority ${this.priorityStart + index}"
                draggable=${this.disabled ? 'false' : 'true'}
                @dragstart=${(e: DragEvent) => this._handleDragStart(e, key)}
                @dragend=${this._handleDragEnd}
                @dragover=${(e: DragEvent) => this._handleDragOver(e, key)}
                @dragleave=${(e: DragEvent) => this._handleDragLeave(e, key)}
                @drop=${(e: DragEvent) => this._handleDrop(e)}
                @keydown=${(e: KeyboardEvent) => this._handleKeyDown(e, key)}>
                <span class="priority-list__handle" part="drag-handle">
                  <zn-icon src="drag_indicator" size="16"></zn-icon>
                </span>
                <span class="priority-list__priority" part="priority">${this.priorityStart + index}</span>
                <span class="priority-list__content" part="content">
                  <slot name="_item-${key}"></slot>
                </span>
                <span class="priority-list__actions" part="actions">
                  <slot name="action-${key}"></slot>
                </span>
              </div>
            `)}
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
