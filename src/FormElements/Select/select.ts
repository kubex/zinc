import {customElement, property, query, state} from "lit/decorators.js";
import {ZincElement, ZincFormControl} from "@/zinc-element";
import {scrollIntoView} from "@/scroll";
import {FormControlController} from "@/form";
import {HasSlotController} from "@/slot";
import {Popup} from "@/Popup";
import {Option} from "@/FormElements/Select/option";
import {defaultValue} from "@/default-value";
import {TemplateResult, unsafeCSS} from "lit";
import {html} from "lit/static-html.js";
import {watch} from "@/watch";
import {classMap} from "lit/directives/class-map.js";
import {ZnRemoveEvent} from "@/Events/zn-remove";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import styles from './select.scss?inline';

@customElement('zn-select')
export class Select extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  // @ts-expect-error - Not reporting Correctly
  private readonly formControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this);
  private typeToSelectString = '';
  private typeToSelectTimeout: number;
  private closeWatcher: CloseWatcher | null;

  @query('.select') popup: Popup;
  @query('.select__combobox') combobox: HTMLSlotElement;
  @query('.select__display-input') displayInput: HTMLInputElement;
  @query('.select__value-input') valueInput: HTMLInputElement;
  @query('.select__listbox') listbox: HTMLSlotElement;

  @state() private hasFocus = false;
  @state() displayLabel = '';
  @state() currentOption: Option;
  @state() selectedOptions: Option[] = [];
  @state() private valueHasChanged: boolean = false;

  /** The name of the select, submitted as a name/value pair with form data. */
  @property() name = '';

  /**
   * The current value of the select, submitted as a name/value pair with form data.
   */
  @property({attribute: 'value', reflect: true})
  private _value: string | string[] = '';

  get value()
  {
    return this._value;
  }

  @state()
  // @ts-expect-error - Not reporting Correctly
  set value(val: string | string[])
  {
    if(this.multiple === true)
    {
      val = Array.isArray(val) ? val : val.split(' ');
    }

    if(this._value === val)
    {
      return;
    }

    this.valueHasChanged = true;
    this._value = val;
  }

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue() defaultValue: string = '';

  /** Placeholder text to show as a hint when the select is empty. */
  @property() placeholder = '';


  /** Allows more than one option to be selected. */
  @property({type: Boolean, reflect: true}) multiple = false;

  /**
   * The maximum number of selected options to show when `multiple` is true. After the maximum, "+n" will be shown to
   * indicate the number of additional items that are selected. Set to 0 to remove the limit.
   */
  @property({attribute: 'max-options-visible', type: Number}) maxOptionsVisible = 0;

  /** Disables the select control. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Adds a clear button when the select is not empty. */
  @property({type: Boolean}) clearable = false;

  /**
   * Indicates whether or not the select is open. You can toggle this attribute to show and hide the menu, or you can
   * use the `show()` and `hide()` methods and this attribute will reflect the select's open state.
   */
  @property({type: Boolean, reflect: true}) open = false;

  /**
   * Enable this option to prevent the listbox from being clipped when the component is placed inside a container with
   * `overflow: auto|scroll`. Hoisting uses a fixed positioning strategy that works in many, but not all, scenarios.
   */
  @property({type: Boolean}) hoist = false;

  /**
   * The preferred placement of the select's menu. Note that the actual placement may vary as needed to keep the listbox
   * inside of the viewport.
   */
  @property({reflect: true}) placement: 'top' | 'bottom' = 'bottom';

  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  @property({reflect: true}) form = '';

  /** The select's required attribute. */
  @property({type: Boolean, reflect: true}) required = false;

  @property() label = '';

  /**
   * A function that customizes the tags to be rendered when multiple=true. The first argument is the option, the second
   * is the current tag's index.  The function should return either a Lit TemplateResult or a string containing trusted HTML of the symbol to render at
   * the specified value.
   */
  @property() getTag: (option: Option, index: number) => TemplateResult | string | HTMLElement = option =>
  {
    return html`
      <zn-tag
        part="tag"
        exportparts="
              base:tag__base,
              content:tag__content,
              remove-button:tag__remove-button,
              remove-button__base:tag__remove-button__base
            "
        removable
        @zn-remove=${(event: ZnRemoveEvent) => this.handleTagRemove(event, option)}
      >
        ${option.getTextLabel()}
      </zn-tag>
    `;
  };

  /** Gets the validity state object */
  get validity()
  {
    return this.valueInput.validity;
  }

  /** Gets the validation message */
  get validationMessage()
  {
    return this.valueInput.validationMessage;
  }

  connectedCallback()
  {
    super.connectedCallback();

    setTimeout(() =>
    {
      this.handleDefaultSlotChange();
    });

    // Because this is a form control, it shouldn't be opened initially
    this.open = false;
  }

  disconnectedCallback()
  {
    this.removeOpenListeners();
    super.disconnectedCallback();
  }

  private addOpenListeners()
  {
    //
    // Listen on the root node instead of the document in case the elements are inside a shadow root
    //
    // https://github.com/shoelace-style/shoelace/issues/1763
    //
    document.addEventListener('focusin', this.handleDocumentFocusIn);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);

    // If the component is rendered in a shadow root, we need to attach the focusin listener there too
    if(this.getRootNode() !== document)
    {
      this.getRootNode().addEventListener('focusin', this.handleDocumentFocusIn);
    }

    if('CloseWatcher' in window)
    {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () =>
      {
        if(this.open)
        {
          this.hide();
          this.displayInput.focus({preventScroll: true});
        }
      };
    }
  }

  private removeOpenListeners()
  {
    document.removeEventListener('focusin', this.handleDocumentFocusIn);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);

    if(this.getRootNode() !== document)
    {
      this.getRootNode().removeEventListener('focusin', this.handleDocumentFocusIn);
    }

    this.closeWatcher?.destroy();
  }

  private handleFocus()
  {
    this.hasFocus = true;
    this.displayInput.setSelectionRange(0, 0);
    // this.emit('zn-focus');
  }

  private handleBlur()
  {
    this.hasFocus = false;
    // this.emit('zn-blur');
  }

  private handleDocumentFocusIn = (event: KeyboardEvent) =>
  {
    // Close when focusing out of the select
    const path = event.composedPath();
    if(this && !path.includes(this))
    {
      this.hide();
    }
  };

  private handleLabelClick()
  {
    this.displayInput.focus();
  }

  private handleDocumentKeyDown = (event: KeyboardEvent) =>
  {
    const target = event.target as HTMLElement;
    const isIconButton = target.closest('zn-button') !== null;

    // Ignore presses when the target is an icon button
    if(isIconButton)
    {
      return;
    }

    // Close when pressing escape
    if(event.key === 'Escape' && this.open && !this.closeWatcher)
    {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      this.displayInput.focus({preventScroll: true});
    }

    // Handle enter and space. When pressing space, we allow for type to select behaviors so if there's anything in the
    // buffer we _don't_ close it.
    if(event.key === 'Enter' || (event.key === ' ' && this.typeToSelectString === ''))
    {
      event.preventDefault();
      event.stopImmediatePropagation();

      // If it's not open, open it
      if(!this.open)
      {
        this.show();
        return;
      }

      // If it is open, update the value based on the current selection and close it
      if(this.currentOption && !this.currentOption.disabled)
      {
        this.valueHasChanged = true;
        if(this.multiple)
        {
          this.toggleOptionSelection(this.currentOption);
        }
        else
        {
          this.setSelectedOptions(this.currentOption);
        }

        this.setSelectedOptions(this.currentOption);

        // Emit after updating
        this.updateComplete.then(() =>
        {
          this.emit('zn-input');
          this.emit('zn-change');
        });

        if(!this.multiple)
        {
          this.hide();
          // this.displayInput.focus({preventScroll: true});
        }
      }

      return;
    }

    // Navigate options
    if(['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
    {
      const allOptions = this.getAllOptions();
      const currentIndex = allOptions.indexOf(this.currentOption);
      let newIndex = Math.max(0, currentIndex);

      // Prevent scrolling
      event.preventDefault();

      // Open it
      if(!this.open)
      {
        this.show();

        // If an option is already selected, stop here because we want that one to remain highlighted when the listbox
        // opens for the first time
        if(this.currentOption)
        {
          return;
        }
      }

      if(event.key === 'ArrowDown')
      {
        newIndex = currentIndex + 1;
        if(newIndex > allOptions.length - 1) newIndex = 0;
      }
      else if(event.key === 'ArrowUp')
      {
        newIndex = currentIndex - 1;
        if(newIndex < 0) newIndex = allOptions.length - 1;
      }
      else if(event.key === 'Home')
      {
        newIndex = 0;
      }
      else if(event.key === 'End')
      {
        newIndex = allOptions.length - 1;
      }

      this.setCurrentOption(allOptions[newIndex]);
    }

    // All other "printable" keys trigger type to select
    if((event.key && event.key.length === 1) || event.key === 'Backspace')
    {
      const allOptions = this.getAllOptions();

      // Don't block important key combos like CMD+R
      if(event.metaKey || event.ctrlKey || event.altKey)
      {
        return;
      }

      // Open, unless the key that triggered is backspace
      if(!this.open)
      {
        if(event.key === 'Backspace')
        {
          return;
        }

        this.show();
      }

      event.stopPropagation();
      event.preventDefault();

      clearTimeout(this.typeToSelectTimeout);
      this.typeToSelectTimeout = window.setTimeout(() => (this.typeToSelectString = ''), 1000);

      if(event.key === 'Backspace')
      {
        this.typeToSelectString = this.typeToSelectString.slice(0, -1);
      }
      else
      {
        this.typeToSelectString += event.key.toLowerCase();
      }

      for(const option of allOptions)
      {
        const label = option.getTextLabel().toLowerCase();

        if(label.startsWith(this.typeToSelectString))
        {
          this.setCurrentOption(option);
          break;
        }
      }
    }
  };

  private handleDocumentMouseDown = (event: MouseEvent) =>
  {
    // Close when clicking outside of the select
    const path = event.composedPath();
    if(this && !path.includes(this))
    {
      this.hide();
    }
  };

  private handleComboboxMouseDown(event: MouseEvent)
  {
    event.preventDefault();
    this.displayInput.focus({preventScroll: true});
    this.open = !this.open;
  }

  private handleComboboxKeyDown(event: KeyboardEvent)
  {
    if(event.key === 'Tab')
    {
      return;
    }

    event.stopPropagation();
    this.handleDocumentKeyDown(event);
  }

  private handleClearClick(event: MouseEvent)
  {
    event.stopPropagation();

    if(this.value !== '')
    {
      this.setSelectedOptions([]);
      this.displayInput.focus({preventScroll: true});

      // Emit after update
      this.updateComplete.then(() =>
      {
        // this.emit('zn-clear');
        this.emit('zn-input');
        this.emit('zn-change');
      });
    }
  }

  private handleClearMouseDown(event: MouseEvent)
  {
    // Don't lose focus or propagate events when clicking the clear button
    event.stopPropagation();
    event.preventDefault();
  }

  private handleOptionClick(event: MouseEvent)
  {
    const target = event.target as HTMLElement;
    const option = target.closest('zn-option') as Option | null;
    const oldValue = this.value;

    if(option && !option.disabled)
    {
      this.valueHasChanged = true;
      if(this.multiple)
      {
        this.toggleOptionSelection(option);
      }
      else
      {
        this.setSelectedOptions(option);
      }

      // Set focus after updating so the value is announced by screen readers
      this.updateComplete.then(() => this.displayInput.focus({preventScroll: true}));

      if(this.value !== oldValue)
      {
        // Emit after updating
        this.updateComplete.then(() =>
        {
          this.emit('zn-input');
          this.emit('zn-change');
        });
      }

      if(!this.multiple)
      {
        this.hide().then(() =>
        {
          this.displayInput.focus({preventScroll: true});
        });
      }
    }
  }

  /* @internal - used by options to update labels */
  public handleDefaultSlotChange()
  {
    if(!customElements.get('zn-option'))
    {
      customElements.whenDefined('zn-option').then(() => this.handleDefaultSlotChange());
    }

    const allOptions = this.getAllOptions();
    const val = this.valueHasChanged ? this.value : this.defaultValue;
    const value = Array.isArray(val) ? val : [val];
    const values: string[] = [];

    // Check for duplicate values in menu items
    allOptions.forEach(option => values.push(option.value));

    // Select only the options that match the new value
    this.setSelectedOptions(allOptions.filter(el => value.includes(el.value)));

    // if still no value, select the first option
    if(this.selectedOptions.length === 0 && !this.multiple)
    {
      // check if option is disabled
      if(allOptions.length > 0 && allOptions[0].disabled)
      {
        for(const option of allOptions)
        {
          if(!option.disabled)
          {
            this.setSelectedOptions(option);
            break;
          }
        }
      }
      else if(!this.multiple)
      {
        this.setSelectedOptions(allOptions[0]);
      }
    }
  }

  private handleTagRemove(event: ZnRemoveEvent, option: Option)
  {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.valueHasChanged = true;

    if(!this.disabled)
    {
      this.toggleOptionSelection(option, false);

      // Emit after updating
      this.updateComplete.then(() =>
      {
        this.emit('zn-input');
        this.emit('zn-change');
      });
    }
  }

  // Gets an array of all <zn-option> elements
  private getAllOptions()
  {
    return [...this.querySelectorAll<Option>('zn-option')];
  }

  // Gets the first <zn-option> element
  private getFirstOption()
  {
    return this.querySelector<Option>('zn-option');
  }

  // Sets the current option, which is the option the user is currently interacting with (e.g. via keyboard). Only one
  // option may be "current" at a time.
  private setCurrentOption(option: Option | null)
  {
    const allOptions = this.getAllOptions();

    // Clear selection
    allOptions.forEach(el =>
    {
      el.current = false;
      el.tabIndex = -1;
    });

    // Select the target option
    if(option)
    {
      this.currentOption = option;
      option.current = true;
      option.tabIndex = 0;
      option.focus();
    }
  }

  // Sets the selected option(s)
  private setSelectedOptions(option: Option | Option[])
  {
    const allOptions = this.getAllOptions();
    const newSelectedOptions = Array.isArray(option) ? option : [option];

    // Clear existing selection
    allOptions.forEach(el => (el.selected = false));

    // Set the new selection
    if(newSelectedOptions.length)
    {
      newSelectedOptions.forEach((el: Option) => (el.selected = true));
    }

    // Update selection, value, and display label
    this.selectionChanged();
  }

  // Toggles an option's selected state
  private toggleOptionSelection(option: Option, force?: boolean)
  {
    if(force === true || force === false)
    {
      option.selected = force;
    }
    else
    {
      option.selected = !option.selected;
    }

    this.selectionChanged();
  }

  // This method must be called whenever the selection changes. It will update the selected options cache, the current
  // value, and the display value
  private selectionChanged()
  {
    const options = this.getAllOptions();
    // Update selected options cache
    this.selectedOptions = options.filter(el => el.selected === true);

    // Update the value and display label
    // Update the value and display label
    if(this.multiple)
    {
      this.value = this.selectedOptions.map(el => el.value);

      if(this.placeholder && this.value.length === 0)
      {
        // When no items are selected, keep the value empty so the placeholder shows
        this.displayLabel = '';
      }
      else
      {
        this.displayLabel = 'numOptionsSelected ' + this.selectedOptions.length;
      }
    }
    else
    {
      console.log(this.selectedOptions);
      const selectedOption = this.selectedOptions[0];
      this.value = selectedOption?.value ?? '';
      this.displayLabel = selectedOption?.getTextLabel?.() ?? '';
    }

    // Update validity
    this.updateComplete.then(() =>
    {
      this.formControlController.updateValidity();
    });
  }

  protected get tags()
  {
    return this.selectedOptions.map((option, index) =>
    {
      if(index < this.maxOptionsVisible || this.maxOptionsVisible <= 0)
      {
        const tag = this.getTag(option, index);
        // Wrap so we can handle the remove
        return html`
          <div @zn-remove=${(e: ZnRemoveEvent) => this.handleTagRemove(e, option)}>
            ${typeof tag === 'string' ? unsafeHTML(tag) : tag}
          </div>`;
      }
      else if(index === this.maxOptionsVisible)
      {
        // Hit tag limit
        return html`
          <zn-tag>+${this.selectedOptions.length - index}</zn-tag>`;
      }
      return html``;
    });
  }

  private handleInvalid(event: Event)
  {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange()
  {
    // Close the listbox when the control is disabled
    if(this.disabled)
    {
      this.open = false;
      this.handleOpenChange();
    }
  }

  @watch('value', {waitUntilFirstUpdate: true})
  handleValueChange()
  {
    if(!this.valueHasChanged)
    {
      const cachedValueHasChanged = this.valueHasChanged;
      this.value = this.defaultValue;

      // Set it back to false since this isn't an interaction.
      this.valueHasChanged = cachedValueHasChanged;
    }

    const allOptions = this.getAllOptions();
    const value = Array.isArray(this.value) ? this.value : [this.value];

    // Select only the options that match the new value
    this.setSelectedOptions(allOptions.filter(el => value.includes(el.value)));
  }

  @watch('open', {waitUntilFirstUpdate: true})
  async handleOpenChange()
  {
    if(this.open && !this.disabled)
    {
      // Reset the current option
      this.setCurrentOption(this.selectedOptions[0] || this.getFirstOption());

      // Show
      this.emit('zn-show');
      this.addOpenListeners();
      this.listbox.hidden = false;
      this.popup.active = true;
      // Make sure the current option is scrolled into view (required for Safari)
      if(this.currentOption)
      {
        scrollIntoView(this.currentOption, this.listbox, 'vertical', 'auto');
      }

      this.emit('zn-after-show');
    }
    else
    {
      // Hide
      this.emit('zn-hide');
      this.removeOpenListeners();
      this.listbox.hidden = true;
      this.popup.active = false;

      this.emit('zn-after-hide');
    }
  }

  /** Shows the listbox. */
  async show()
  {
    if(this.open || this.disabled)
    {
      this.open = false;
      return undefined;
    }

    this.open = true;
    // return waitForEvent(this, 'zn-after-show');
  }

  /** Hides the listbox. */
  async hide()
  {
    if(!this.open || this.disabled)
    {
      this.open = false;
      return undefined;
    }

    this.open = false;
    // return waitForEvent(this, 'zn-after-hide');
  }

  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity()
  {
    return this.valueInput.checkValidity();
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity()
  {
    return this.valueInput.reportValidity();
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string)
  {
    this.valueInput.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  /** Sets focus on the control. */
  focus(options?: FocusOptions)
  {
    this.displayInput.focus(options);
  }

  /** Removes focus from the control. */
  blur()
  {
    this.displayInput.blur();
  }

  render()
  {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasClearIcon = this.clearable && !this.disabled && this.value.length > 0;
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const isPlaceholderVisible = this.placeholder && this.value && this.value.length <= 0;

    return html`
      <div part="form-control"
           class=${classMap({
             'form-control': true,
             'form-control--has-label': hasLabel
           })}>
        <label
          id="label"
          part="form-control-label"
          class="form-control__label"
          aria-hidden=${hasLabel ? 'false' : 'true'}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <zn-popup
            class=${classMap({
              select: true,
              'select--standard': true,
              'select--open': this.open,
              'select--multiple': this.multiple,
              'select--disabled': this.disabled,
              'select--focused': this.hasFocus,
              'select--placeholder-visible': isPlaceholderVisible,
              'select--top': this.placement === 'top',
              'select--bottom': this.placement === 'bottom',
            })}
            placement=${this.placement}
            strategy=${this.hoist ? 'fixed' : 'absolute'}
            flip
            shift
            sync="width"
            auto-size="vertical"
            auto-size-padding="10"
          >
            <div
              part="combobox"
              class="select__combobox"
              slot="anchor"
              @keydown=${this.handleComboboxKeyDown}
              @mousedown=${this.handleComboboxMouseDown}
            >
              <slot part="prefix" name="prefix" class="select__prefix"></slot>
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
                aria-haspopup="listbox"
                aria-disabled=${this.disabled ? 'true' : 'false'}
                aria-describedby="help-text"
                role="combobox"
                tabindex="0"
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
              />

              ${this.multiple ? html`
                <div part="tags" class="select__tags">${this.tags}</div>` : ''}

              <input
                class="select__value-input"
                type="text"
                ?disabled=${this.disabled}
                ?required=${this.required}
                .value=${Array.isArray(this.value) ? this.value.join(', ') : this.value}
                tabindex="-1"
                aria-hidden="true"
                @focus=${() => this.focus()}
                @invalid=${this.handleInvalid}
              />

              ${hasClearIcon
                ? html`
                  <button
                    part="clear-button"
                    class="select__clear"
                    type="button"
                    aria-label="Clear"
                    @mousedown=${this.handleClearMouseDown}
                    @click=${this.handleClearClick}
                    tabindex="-1"
                  >
                    <slot name="clear-icon">
                      <zn-icon src="cancel"></zn-icon>
                    </slot>
                  </button>
                `
                : ''}

              <slot name="suffix" part="suffix" class="select__suffix"></slot>

              <slot name="expand-icon" part="expand-icon" class="select__expand-icon">
                <zn-icon src="keyboard_arrow_down"></zn-icon>
              </slot>
            </div>

            <div
              id="listbox"
              role="listbox"
              aria-expanded=${this.open ? 'true' : 'false'}
              aria-multiselectable='false'
              aria-labelledby="label"
              part="listbox"
              class="select__listbox"
              tabindex="-1"
              @mouseup=${this.handleOptionClick}
              @slotchange=${this.handleDefaultSlotChange}
            >
              <slot></slot>
            </div>
          </zn-popup>
        </div>
      </div>
    `;
  }
}
