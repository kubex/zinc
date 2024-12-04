import {customElement, property, state} from "lit/decorators.js";
import {scrollIntoView} from "@/scroll";
import {Option} from "@/FormElements/Select/option";
import {defaultValue} from "@/default-value";
import {TemplateResult} from "lit";
import {html} from "lit/static-html.js";
import {watch} from "@/watch";
import {classMap} from "lit/directives/class-map.js";
import {ZnRemoveEvent} from "@/Events/zn-remove";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {Select} from "@/FormElements/Select/select";

@customElement('zn-multi-select')
export class MultiSelect extends Select
{
  private multiple = true;
  private maxOptionsVisible: number = 3;

  get value()
  {
    return this._value;
  }

  @state()
  set value(val: string | string[])
  {
    if(val === undefined || val === null)
    {
      return;
    }

    val = Array.isArray(val) ? val : val.split(' ');

    this.valueHasChanged = true;
    this._value = val;
  }

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue() defaultValue: string = '';

  /** Placeholder text to show as a hint when the select is empty. */
  @property() placeholder = '';


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

  protected handleDocumentKeyDown = (event: KeyboardEvent) =>
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


  protected handleComboboxMouseDown(event: MouseEvent)
  {
    event.preventDefault();

    console.log(event.target);
    if(this.multiple && (event.target instanceof HTMLElement && event.target.getAttribute('part') === 'clear-button'))
    {
      return;
    }

    this.displayInput.focus({preventScroll: true});
    this.open = !this.open;
  }


  protected handleOptionClick(event: MouseEvent)
  {
    const target = event.target as HTMLElement;
    const option = target.closest('zn-option') as Option | null;
    const oldValue = this.value;

    if(option && !option.disabled)
    {
      this.valueHasChanged = true;
      this.toggleOptionSelection(option);

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
  }

  protected handleTagRemove(event: ZnRemoveEvent, option: Option)
  {
    event.stopPropagation();
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
  protected getAllOptions()
  {
    return [...this.querySelectorAll<Option>('zn-option')];
  }

  // Gets the first <zn-option> element
  protected getFirstOption()
  {
    return this.querySelector<Option>('zn-option');
  }

  // Sets the current option, which is the option the user is currently interacting with (e.g. via keyboard). Only one
  // option may be "current" at a time.
  protected setCurrentOption(option: Option | null)
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

  // This method must be called whenever the selection changes. It will update the selected options cache, the current
  // value, and the display value
  protected selectionChanged()
  {
    const options = this.getAllOptions();
    // Update selected options cache
    this.selectedOptions = options.filter(el => el.selected === true);

    // Update the value and display label
    if(this.multiple)
    {
      console.log('multiple', 'selectionChanged', this.selectedOptions);
      // this.value = this.selectedOptions.map(el => el.value);
      this.displayLabel = (this.placeholder && this.value.length === 0) ?
        '' : 'numOptionsSelected ' + this.selectedOptions.length;
    }
    else
    {
      const selectedOption = this.selectedOptions[0];
      // this.value = selectedOption?.value ?? '';
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
