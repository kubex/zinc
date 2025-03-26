import {property, query, state} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {watch} from '../../internal/watch';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';

import styles from './color-select.scss';
import {HasSlotController} from "../../internal/slot";
import ZnPopup from "../popup";
import {FormControlController, validValidityState} from "../../internal/form";
import {deepQuerySelectorAll} from "../../utilities/query";
import {waitForEvent} from "../../internal/event";
import {classMap} from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/color-select
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnColorSelect extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  protected readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');
  protected readonly formControlController = new FormControlController(this);

  private typeToSelectString = '';
  private typeToSelectTimeout: number;
  private closeWatcher: CloseWatcher | null;

  @query('.select') popup: ZnPopup;
  @query('.select__combobox') combobox: HTMLSlotElement;
  @query('.select__display-input') displayInput: HTMLSlotElement;
  @query('.select__value-input') valueInput: HTMLInputElement;
  @query('.select__listbox') listbox: HTMLSlotElement;
  @property() name: string;

  @state() private hasFocus = false;
  @state() displayLabel = '';
  @state() currentOption: HTMLElement;
  @state() selectedOptions: HTMLElement[] = [];

  @property({
    converter: {
      fromAttribute: (value: string) => value.split(' '),
      toAttribute: (value: string[]) => value.join(' ')
    }
  }) value: string | string[] = '';

  @property({
    converter: {
      fromAttribute: (value: string) => value.split(' '),
      toAttribute: (value: string[]) => value.join(' ')
    }
  }) options: string[] = [];


  @property() label: string;
  @property() helpText: string;
  @property() placeholder: string = 'Select a color';


  @property({type: Boolean}) clearable: boolean;
  @property({type: Boolean}) disabled: boolean;
  @property({type: Boolean, reflect: true}) open = false;

  get validationMessage() {
    return '';
  }

  get validity(): ValidityState {
    return validValidityState;
  }


  checkValidity(): boolean {
    return true;
  }

  getForm(): HTMLFormElement | null {
    return null;
  }


  reportValidity(): boolean {
    return true;
  }

  setCustomValidity(_: string): void {
    return;
  }


  private addOpenListeners() {
    const root = this.getRootNode();
    root.addEventListener('focusin', this.handleDocumentFocusIn);
    root.addEventListener('keydown', this.handleDocumentKeyDown);
    root.addEventListener('mousedown', this.handleDocumentMouseDown);

    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => {
        if (this.open) {
          this.hide();
          this.displayInput.focus({preventScroll: true});
        }
      };
    }
  }

  private removeOpenListeners() {
    const root = this.getRootNode();
    root.removeEventListener('focusin', this.handleDocumentFocusIn);
    root.removeEventListener('keydown', this.handleDocumentKeyDown);
    root.removeEventListener('mousedown', this.handleDocumentMouseDown);

    this.closeWatcher?.destroy();
  }

  private handleLabelClick() {
    this.displayInput.focus();
  }

  private handleDocumentFocusIn = (event: FocusEvent) => {
    const path = event.composedPath();
    if (this && !path.includes(this)) this.hide();
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    // Close when pressing escape
    if (event.key === 'Escape' && this.open && !this.closeWatcher) {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      this.displayInput.focus({preventScroll: true});
    }

    if (event.key === 'Enter' || (event.key === " " && this.typeToSelectString === '')) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (!this.open) {
        this.show();
        return;
      }

      if (this.currentOption) {
        this.setSelectedOptions(this.currentOption);
      }

      this.updateComplete.then(() => {
        this.emit('zn-input');
        this.emit('zn-change');
      });

      this.hide();
      this.displayInput.focus({preventScroll: true});
      return;
    }

    // Navigation
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      const allOptions = this.getAllOptions();
      const currentIndex = allOptions.indexOf(this.currentOption);
      let newIndex = Math.max(0, currentIndex);

      // Prevent scrolling
      event.preventDefault();

      if (!this.open) {
        this.show();
        if (this.currentOption) return;
      }

      switch (event.key) {
        case 'ArrowUp':
          newIndex = currentIndex - 1;
          if (newIndex < 0) newIndex = allOptions.length - 1;
          break;
        case 'ArrowDown':
          newIndex = currentIndex + 1;
          if (newIndex > allOptions.length - 1) newIndex = 0;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = allOptions.length - 1;
          break;
      }

      this.setCurrentOption(allOptions[newIndex]);
    }

    // All other keys
    if (event.key.length === 1 || event.key == 'Backspace') {
      const allOptions = this.getAllOptions();

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (!this.open) {
        if (event.key === 'Backspace') return;
        this.show();
      }

      event.stopPropagation();
      event.preventDefault();

      clearTimeout(this.typeToSelectTimeout);
      this.typeToSelectTimeout = window.setTimeout(() => (this.typeToSelectString = ''), 1000);

      if (event.key === 'Backspace') {
        this.typeToSelectString = this.typeToSelectString.slice(0, -1);
      } else {
        this.typeToSelectString += event.key.toLowerCase();
      }

      for (const options of allOptions) {
        const label = (options.textContent as string).toLowerCase();

        if (label.startsWith(this.typeToSelectString)) {
          this.setCurrentOption(options);
          break;
        }
      }
    }
  };

  private handleDocumentMouseDown = (event: MouseEvent) => {
    const path = event.composedPath();
    if (this && !path.includes(this)) this.hide();
  };

  private handleComboboxKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      return;
    }

    e.stopPropagation();
    this.handleDocumentKeyDown(e);
  }

  private handleComboboxMouseDown(e: MouseEvent) {
    if (this.disabled) {
      return;
    }

    e.preventDefault();
    this.displayInput.focus({preventScroll: true});
    this.open = !this.open;
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private handleOptionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const option = target.closest<HTMLElement>('.select__option');
    const oldValue = this.value;

    if (option) {
      this.setSelectedOptions(option);

      this.updateComplete.then(() => this.displayInput.focus({preventScroll: true}));

      if (this.value !== oldValue) {
        this.updateComplete.then(() => {
          this.emit('zn-input');
          this.emit('zn-change');
        });
      }

      this.hide();
      this.displayInput.focus({preventScroll: true});
    }
  }

  private getAllOptions(): HTMLElement[] {
    return deepQuerySelectorAll('.select__option', this, '') as HTMLElement[];
  }

  private setCurrentOption(option: HTMLElement | null) {
    const allOptions = this.getAllOptions();

    allOptions.forEach(el => {
      el.removeAttribute('current');
      el.tabIndex = -1;
    });

    if (option) {
      this.currentOption = option;
      option.setAttribute('current', '');
      option.tabIndex = 0;
      option.focus();
    }
  }

  private setSelectedOptions(option: HTMLElement | HTMLElement[]) {
    const allOptions = this.getAllOptions();
    const newSelectedOptions = Array.isArray(option) ? option : [option];

    allOptions.forEach(option => option.removeAttribute('selected'));

    if (newSelectedOptions.length) {
      newSelectedOptions.forEach(option => option.setAttribute('selected', ''));
    }

    this.selectionChanged();
  }

  private selectionChanged() {
    this.selectedOptions = this.getAllOptions().filter(option => option.getAttribute('selected') !== null);
    this.value = this.selectedOptions[0]?.getAttribute('data-key') ?? '';
    this.displayLabel = this.selectedOptions[0]?.getAttribute('data-value') ?? '';

    this.updateComplete.then(() => {
      this.formControlController.updateValidity();
    });
  }

  private getFirstOption() {
    return this.getAllOptions()[0] ?? null;
  }

  async show() {
    if (this.open || this.disabled) {
      this.open = false;
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'zn-after-show');
  }

  async hide() {
    if (!this.open || this.disabled) {
      this.open = false;
      return undefined;
    }

    this.open = false;
    return waitForEvent(this, 'zn-after-hide');
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    if (this.disabled) {
      this.open = false;
      this.handleOpenChange();
    }
  }

  @watch('value', {waitUntilFirstUpdate: true})
  handleValueChange() {
    const allOptions = this.getAllOptions();
    const value = Array.isArray(this.value) ? this.value : [this.value];

    // Select only the options that match the new value
    this.setSelectedOptions(allOptions.filter(el => value.includes(el.getAttribute('data-key') as string)));
  }

  @watch('open', {waitUntilFirstUpdate: true})
  async handleOpenChange() {
    if (this.open && !this.disabled) {
      // Reset the current option
      this.setCurrentOption(this.selectedOptions[0] || this.getFirstOption());

      // Show
      this.emit('zn-show');
      this.addOpenListeners();

      this.listbox.hidden = false;
      this.popup.active = true;

      // Select the appropriate option based on value after the listbox opens
      requestAnimationFrame(() => {
        this.setCurrentOption(this.currentOption);
      });

      this.emit('zn-after-show');
    } else {
      // Hide
      this.emit('zn-hide');
      this.removeOpenListeners();
      this.listbox.hidden = true;
      this.popup.active = false;
      this.emit('zn-after-hide');
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
  }

  protected render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;

    return html`
      <div
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control--has-label': hasLabel,
          'form-control--has-help-text': hasHelpText,
        })}>
        <label
          id="label"
          part="form-control-label"
          class=${classMap({
            'form-control__label': true,
            'form-control__label--has-label': hasLabel,
          })}
          aria-hidden=${hasLabel ? 'false' : 'true'}
          @click=${this.handleLabelClick}>
          <slot name="label">${this.label}</slot>
        </label>
        <div part="form-control-input" class="form-control-input">
          <zn-popup
            class=${classMap({
              select: true,
              'select--focused': this.hasFocus,
            })}
            placement="bottom-start"
            flip
            shift
            sync="width"
            auto-size="vertical">
            <div part="combobox" class="select__combobox" slot="anchor"
                 @keydown=${this.handleComboboxKeyDown}
                 @mousedown=${this.handleComboboxMouseDown}>
              <div
                class="display-color ${this.value ? 'display-color--selected display-color--' + this.value : ''}"></div>
              <input
                part="display-input"
                class="select__display-input"
                type="text"
                placeholder=${this.placeholder}
                .disabled=${this.disabled}
                .value=${this.displayLabel}
                autocomplete="off"
                spellcheck="false"
                autocapitalize="off"
                readonly
                aria-controls="listbox"
                aria-expanded=${this.open ? 'true' : 'false'}
                aria-disabled=${this.disabled ? 'true' : 'false'}
                aria-describedby="help-text"
                role="combobox"
                tabindex="0"
                @focus=${() => this.focus()}
                @invalid=${this.handleInvalid}
              />
              <span class="opener"><svg xmlns="http://www.w3.org/2000/svg" width="12px" viewBox="0 0 12 8"><path
                fill="#7B7097" d="m6 7.4-6-6L1.4 0 6 4.6 10.6 0 12 1.4z"/></svg></span>
            </div>
            <div
              id="listbox"
              role="listbox"
              aria-expanded=${this.open ? 'true' : 'false'}
              aria-multiselectable="false"
              aria-labelledby="label"
              part="listbox"
              class="select__listbox"
              tabindex="-1"
              @mouseup=${this.handleOptionClick}>
              ${this.options.map(option => html`
                <div
                  class="select__option"
                  data-value=${option.charAt(0).toUpperCase() + option.slice(1)}
                  data-key=${option.toLowerCase()}>
                  <div class="color-icon color-icon--${option.toLowerCase()}"></div>
                  ${option.charAt(0).toUpperCase() + option.slice(1)}
                </div>`)}
            </div>
          </zn-popup>
        </div>
      </div>
    `;
  }
}
