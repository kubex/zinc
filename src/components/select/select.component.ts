import { animateTo, stopAnimations } from '../../internal/animate.js';
import { classMap } from "lit/directives/class-map.js";
import { deepQuerySelectorAll } from "../../utilities/query";
import { FormControlController } from "../../internal/form";
import { getAnimation, setDefaultAnimation } from "../../utilities/animation-registry";
import { HasSlotController } from "../../internal/slot";
import type { CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
import { html, nothing, unsafeCSS } from 'lit';
import { LocalizeController } from "../../utilities/localize";
import { property, query, state } from 'lit/decorators.js';
import { scrollIntoView } from "../../internal/scroll";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { waitForEvent } from "../../internal/event";
import { watch } from '../../internal/watch';
import type { ZincFormControl } from '../../internal/zinc-element';
import ZincElement from '../../internal/zinc-element';
import ZnChip from "../chip";
import ZnIcon from "../icon";
import ZnOptGroup from "../opt-group";
import ZnOption from "../option";
import ZnPopup from "../popup";
import type { ZnRemoveEvent } from "../../events/zn-remove";

import styles from './select.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/select
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 * @dependency zn-opt-group
 * @dependency zn-option
 * @dependency zn-popup
 * @dependency zn-tag
 *
 * @slot - The listbox options. Must be `<zn-option>` elements. You can use `<zn-opt-group>` to group options under a labeled header, or `<zn-divider>` to group items visually.
 * @slot label - The input's label. Alternatively, you can use the `label` attribute.
 * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
 * @slot context-note - Used to add contextual text that is displayed above the select, on the right. Alternatively, you can use the `context-note` attribute.
 * @slot prefix - Used to prepend a presentational icon or similar element to the combobox.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot expand-icon - The icon to show when the control is expanded and collapsed. Rotates on open and close.
 * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
 *
 * @event zn-change - Emitted when the control's value changes.
 * @event zn-clear - Emitted when the control's value is cleared.
 * @event zn-input - Emitted when the control receives input.
 * @event zn-focus - Emitted when the control gains focus.
 * @event zn-blur - Emitted when the control loses focus.
 * @event zn-show - Emitted when the select's menu opens.
 * @event zn-after-show - Emitted after the select's menu opens and all animations are complete.
 * @event zn-hide - Emitted when the select's menu closes.
 * @event zn-after-hide - Emitted after the select's menu closes and all animations are complete.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 * @event zn-load - Emitted when options have been successfully loaded from the `src` URL.
 * @event zn-error - Emitted when loading options from the `src` URL fails.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The select's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart combobox - The container the wraps the prefix, combobox, clear icon, and expand button.
 * @csspart prefix - The container that wraps the prefix slot.
 * @csspart display-input - The element that displays the selected option's label, an `<input>` element.
 * @csspart listbox - The listbox container where options are slotted.
 * @csspart tags - The container that houses option tags when `multiselect` is used.
 * @csspart tag - The individual tags that represent each multiselect option.
 * @csspart tag__base - The tag's base part.
 * @csspart tag__content - The tag's content part.
 * @csspart tag__remove-button - The tag's remove button.
 * @csspart tag__remove-button__base - The tag's remove button base part.
 * @csspart clear-button - The clear button.
 * @csspart expand-icon - The container that wraps the expand icon.
 */
export default class ZnSelect extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-opt-group': ZnOptGroup,
    'zn-option': ZnOption,
    'zn-popup': ZnPopup,
    'zn-tag': ZnChip
  };

  protected readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-blur', 'zn-input']
  });
  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');
  private readonly localize = new LocalizeController(this);
  private typeToSelectString = '';
  private typeToSelectTimeout: number;
  private closeWatcher: CloseWatcher | null;

  @query('.select') popup: ZnPopup;
  @query('.select__combobox') combobox: HTMLSlotElement;
  @query('.select__display-input') displayInput: HTMLInputElement;
  @query('.select__value-input') valueInput: HTMLInputElement;
  @query('.select__listbox') listbox: HTMLSlotElement;
  @query('slot[name="prefix"]') prefixSlot: HTMLSlotElement;

  @state() private hasFocus = false;
  @state() displayLabel = '';
  @state() currentOption: ZnOption;
  @state() selectedOptions: ZnOption[] = [];
  @state() private valueHasChanged: boolean = false;
  @state() private inputPrefix: boolean = false;

  /** @internal - current search/filter text when search is enabled (lowercased for matching) */
  private _searchQuery = '';

  /** @internal - raw display value of the search input (preserves case for the input field) */
  private _searchDisplayValue = '';

  /** @internal - whether the "no matching options" empty state is visible */
  @state() private _noResultsVisible = false;

  /** @internal */
  @state() private _fetchedOptions: ({ key: string; value: string; group?: undefined } | {
    group: string;
    options: { key: string; value: string }[]
  })[] = [];

  /** @internal */
  @state() private _fetchLoading = false;

  /** @internal */
  @state() private _fetchError = '';

  /** @internal */
  private _fetchAbortController: AbortController | null = null;

  /** The name of the select, submitted as a name/value pair with form data. */
  @property() name = '';

  @property({ type: Boolean, attribute: "non-removable" }) nonRemovable = false;

  private _value: string | string[] = '';

  get value() {
    return this._value
  }

  /**
   * The current value of the select, submitted as a name/value pair with form data. When `multiple` is enabled, the
   * value property will be an array. Values may contain spaces when using JSON array syntax in the attribute,
   * e.g. `value='["my value", "their value"]'`. Space-delimited strings are still supported for backward compatibility.
   */
  @state()
  set value(val: string | string[]) {
    if (this.multiple) {
      if (Array.isArray(val)) {
        // Already an array, keep as-is
      } else if (val.trimStart().startsWith('[')) {
        try {
          const parsed = JSON.parse(val) as unknown;
          val = Array.isArray(parsed) ? parsed : val.split(" ");
        } catch {
          if (typeof val === "string") {
            val = val.split(" ");
          }
        }
      } else {
        val = val.split(" ");
      }
    } else {
      val = Array.isArray(val) ? val.join(" ") : val;
    }

    if (this._value === val) {
      return;
    }

    this.valueHasChanged = true;
    this._value = val;

    if (this.hasUpdated) {
      this.updateDependencies();
    }
  }

  /** The default value of the form control. Primarily used for resetting the form control. */
  @property({
    attribute: 'value',
    converter: {
      fromAttribute: (value) => {
        if (!value || Array.isArray(value)) return value;

        // Auto-detect JSON array syntax: value='["my value", "their value"]'
        if (value.trimStart().startsWith('[')) {
          try {
            const parsed = JSON.parse(value) as unknown;
            if (Array.isArray(parsed)) return parsed as string[];
          } catch {
            // Not valid JSON, fall through to space-delimited parsing
          }
        }

        return value.includes(' ') ? value.split(' ') : value;
      },
      toAttribute: (value) => {
        if (Array.isArray(value) && value.some((v: string) => v.includes(' '))) {
          return JSON.stringify(value);
        }
        return Array.isArray(value) ? value.join(' ') : value;
      }
    }
  }) defaultValue: string | string[] = '';


  /** The select's size. */
  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';

  /** Placeholder text to show as a hint when the select is empty. */
  @property() placeholder = '';

  /** Allows more than one option to be selected. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  /** Max number of options that can be selected when `multiple` is true. Set to 0 to allow unlimited selections. */
  @property({ attribute: 'max-options', type: Number }) maxOptions = 0;

  /**
   * The maximum number of selected options to show when `multiple` is true. After the maximum, "+n" will be shown to
   * indicate the number of additional items that are selected. Set to 0 to remove the limit.
   */
  @property({ attribute: 'max-options-visible', type: Number }) maxOptionsVisible = 3;

  /** Disables the select control. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Adds a clear button when the select is not empty. */
  @property({ type: Boolean }) clearable = false;

  /**
   * Indicates whether or not the select is open. You can toggle this attribute to show and hide the menu, or you can
   * use the `show()` and `hide()` methods and this attribute will reflect the select's open state.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Enable this option to prevent the listbox from being clipped when the component is placed inside a container with
   * `overflow: auto|scroll`. Hoisting uses a fixed positioning strategy that works in many, but not all, scenarios.
   */
  @property({ type: Boolean }) hoist = false;

  /** Draws a pill-style select with rounded edges. */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** Enables search/filter functionality. When enabled, the user can type into the select to filter the visible options. */
  @property({ type: Boolean, reflect: true }) search = false;

  /** The select's label. If you need to display HTML, use the `label` slot instead. */
  @property() label = '';

  /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
  @property({ attribute: 'label-tooltip' }) labelTooltip = '';

  /** Text that appears above the input, on the right, to add additional context. If you need to display HTML in this text, use the `context-note` slot instead. */
  @property({ attribute: 'context-note' }) contextNote = '';

  /**
   * The preferred placement of the selects menu. Note that the actual placement may vary as needed to keep the listbox
   * inside the viewport.
   */
  @property({ reflect: true }) placement: 'top' | 'bottom' = 'bottom';

  /** The select's help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({ attribute: 'help-text' }) helpText = '';

  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  @property({ reflect: true }) form: string;

  /** The select's required attribute. */
  @property({ type: Boolean, reflect: true }) required = false;

  @property({ attribute: 'cache-key' }) cacheKey: string = "";

  @property({ type: Boolean, attribute: 'trigger-submit' }) triggerSubmit = false;

  /**
   * A function that customizes the tags to be rendered when multiple=true. The first argument is the option, the second
   * is the current tag's index.  The function should return either a Lit TemplateResult or a string containing trusted HTML of the symbol to render at
   * the specified value.
   */
  @property() getTag: (option: ZnOption, index: number) => TemplateResult | string | HTMLElement = option => {
    return html`
      <zn-chip
        part="tag"
        exportparts="
              base:tag__base,
              content:tag__content,
              remove-button:tag__remove-button,
              remove-button__base:tag__remove-button__base"
        ?pill=${this.pill}
        size="x-small"
        type="primary"
        @zn-remove=${(event: ZnRemoveEvent) => this.handleTagRemove(event, option)}>
        ${option.getTextLabel()}
        ${(!this.nonRemovable) ? html`
          <zn-icon slot="action" src="close" size="16"
                   @click=${(e: any) => this.handleTagRemove(e as ZnRemoveEvent, option)}></zn-icon>` : nothing}
      </zn-chip>
    `;
  };

  @property() distinct = "";

  @property() conditional = "";

  /**
   * The URL to fetch options from. When set, the component fetches JSON from this URL and renders the results as
   * options. The expected format is an array of objects with `key` and `value` properties:
   * `[{"key": "us", "value": "United States"}, ...]`
   * When not set, the component works exactly as before using slotted `<zn-option>` elements.
   */
  @property({ attribute: 'data-uri' }) dataUri: string;

  /**
   * Context data to send as a header when fetching options from the URL specified by the `src` property.
   */
  @property({ attribute: 'context-data' }) contextData: string;

  /** Gets the validity state object */
  get validity() {
    return this.valueInput?.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.valueInput?.validationMessage;
  }

  connectedCallback() {
    super.connectedCallback();

    this.updateComplete.then(() => this.handleDefaultSlotChange());

    // Because this is a form control, it shouldn't be opened initially
    this.open = false;

    if (this.cacheKey) {
      const cache = JSON.parse(localStorage.getItem('zn-linked-select-cache') || '{}') as Record<string, string | string[]>;
      if (cache[this.cacheKey]) {
        this.value = cache[this.cacheKey];
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._fetchAbortController?.abort();
    this._fetchAbortController = null;
  }

  private updateHasInputPrefix() {
    const assigned = this.prefixSlot?.assignedElements({ flatten: true }) || [];
    this.inputPrefix = assigned.length > 0;
  }

  private addOpenListeners() {
    const root = this.getRootNode();
    root.addEventListener('focusin', this.handleDocumentFocusIn);
    root.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);

    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => {
        if (this.open) {
          this.hide().then();
          this.displayInput.focus({ preventScroll: true });
        }
      };
    }
  }

  private removeOpenListeners() {
    const root = this.getRootNode();
    root.removeEventListener('focusin', this.handleDocumentFocusIn);
    root.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);

    this.closeWatcher?.destroy();
  }

  private handleFocus() {
    this.hasFocus = true;
    this.displayInput.setSelectionRange(0, 0);
    this.emit('zn-focus');
  }

  private handleBlur() {
    this.hasFocus = false;
    this.emit('zn-blur');
  }

  private handleDocumentFocusIn = (event: KeyboardEvent) => {
    // Close when focusing out of the select
    const path = event.composedPath();
    if (this && !path.includes(this)) {
      this.hide().then();
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isClearButton = target.closest('.select__clear') !== null;
    const isIconButton = target.closest('zn-icon') !== null;

    // and isn't keyboard_arrow_down icon
    const isExpandIcon = target.closest('.select__expand-icon') !== null;

    // Ignore presses when the target is an icon button (e.g. the remove button in <zn-tag>)
    if ((isClearButton || isIconButton) && !isExpandIcon) {
      return;
    }

    // Close when pressing escape
    if ((event.key === 'Escape' || event.key === 'Tab') && this.open && !this.closeWatcher) {
      event.preventDefault();
      event.stopPropagation();
      this.hide().then();
      this.displayInput.focus({ preventScroll: true });
    }

    // Handle enter and space. When pressing space, we allow for type to select behaviors so if there's anything in the
    // buffer we _don't_ close it. When search is enabled, space should type into the input, not toggle.
    if (event.key === 'Enter' || (event.key === ' ' && !this.search && this.typeToSelectString === '')) {
      event.preventDefault();
      event.stopImmediatePropagation();

      // If it's not open, open it
      if (!this.open) {
        this.show().then();
        return;
      }

      // If it is open, update the value based on the current selection and close it
      if (this.currentOption && !this.currentOption.disabled) {
        this.valueHasChanged = true;
        if (this.multiple) {
          this.toggleOptionSelection(this.currentOption);
        } else {
          this.setSelectedOptions(this.currentOption);
        }

        // Clear search after keyboard selection
        if (this.search) {
          this.clearSearch();
          if (this.multiple) {
            this.displayInput.value = '';
          }
        }

        // Emit after updating
        this.updateComplete.then(() => {
          this.emit('zn-input');
          this.emit('zn-change');
        });

        if (!this.multiple) {
          this.hide().then();
          this.displayInput.focus({ preventScroll: true });
        } else if (this.search) {
          // In multi-select + search, re-focus the search input after keyboard selection
          this.updateComplete.then(() => {
            this.displayInput.value = '';
            this.displayInput.focus({ preventScroll: true });
          });
        }
      }

      return;
    }

    // Navigate options
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      const navOptions = this.search ? this.getVisibleOptions() : this.getAllOptions();
      const currentIndex = navOptions.indexOf(this.currentOption);
      let newIndex = Math.max(0, currentIndex);

      // Prevent scrolling
      event.preventDefault();

      // Open it
      if (!this.open) {
        this.show().then();

        // If an option is already selected, stop here because we want that one to remain highlighted when the listbox
        // opens for the first time
        if (this.currentOption) {
          return;
        }
      }

      if (event.key === 'ArrowDown') {
        newIndex = currentIndex + 1;
        if (newIndex > navOptions.length - 1) newIndex = 0;
      } else if (event.key === 'ArrowUp') {
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = navOptions.length - 1;
      } else if (event.key === 'Home') {
        newIndex = 0;
      } else if (event.key === 'End') {
        newIndex = navOptions.length - 1;
      }

      this.setCurrentOption(navOptions[newIndex]);
    }

    // When search is enabled, let the input handle keystrokes natively (they go through handleSearchInput)
    if (this.search) {
      return;
    }

    // All other "printable" keys trigger type to select
    if (event.key.length === 1 || event.key === 'Backspace') {
      const allOptions = this.getAllOptions();

      // Don't block important key combos like CMD+R
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      // Open, unless the key that triggered is backspace
      if (!this.open) {
        if (event.key === 'Backspace') {
          return;
        }

        this.show().then();
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

      for (const option of allOptions) {
        const label = option.getTextLabel().toLowerCase();

        if (label.startsWith(this.typeToSelectString)) {
          this.setCurrentOption(option);
          break;
        }
      }
    }
  };

  private handleDocumentMouseDown = (event: MouseEvent) => {
    // Close when clicking outside of the select
    const path = event.composedPath();
    if (this && !path.includes(this)) {
      this.hide().then();
    }
  };

  private handleLabelClick() {
    this.displayInput.focus();
  }

  private handleComboboxMouseDown(event: MouseEvent) {
    const path = event.composedPath();
    const isIcon = path.some(el => el instanceof Element && el.tagName.toLowerCase() === 'zn-icon');

    // not the keyboard_arrow_down icon
    const isExpandIcon = path.some(el => el instanceof Element && el.classList.contains('select__expand-icon'));
    // if click is inside the prefix area (e.g. checkbox), don't toggle the select
    const inPrefix = path.some(el => el instanceof Element && el.classList.contains('select__prefix'));
    // Ignore disabled controls, fetch loading/error, and clicks on tags (remove buttons)
    if (((this.disabled || this._fetchLoading || this._fetchError || isIcon) && !isExpandIcon) || inPrefix) {
      return;
    }

    // When search is enabled, clicking the input area should open (not toggle) so the user can type
    if (this.search && this.open && !isExpandIcon) {
      event.preventDefault();
      this.displayInput.focus({ preventScroll: true });
      return;
    }

    event.preventDefault();
    this.displayInput.focus({ preventScroll: true });
    this.open = !this.open;
  }

  private handleComboboxKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      return;
    }

    // If keydown originated from within the prefix (e.g. checkbox)
    const path = event.composedPath();
    const inPrefix = path.some(el => el instanceof Element && (el as Element).classList?.contains('select__prefix'));

    if (!inPrefix) {
      event.stopPropagation();
      this.handleDocumentKeyDown(event);
    }
  }

  private handleClearClick(event: MouseEvent) {
    event.stopPropagation();

    if (this.value !== '') {
      if (this.search) {
        this.clearSearch();
        this.displayInput.value = '';
      }

      this.setSelectedOptions([]);
      this.displayInput.focus({ preventScroll: true });

      // Emit after update
      this.updateComplete.then(() => {
        this.emit('zn-clear');
        this.emit('zn-input');
        this.emit('zn-change');
      });
    }
  }

  private handleClearMouseDown(event: MouseEvent) {
    // Don't lose focus or propagate events when clicking the clear button
    event.stopPropagation();
    event.preventDefault();
  }

  /** Handles text input on the display input for search/filter mode */
  private handleSearchInput() {
    if (!this.search) return;

    this._searchDisplayValue = this.displayInput.value;
    this._searchQuery = this._searchDisplayValue.toLowerCase();
    this.filterOptions();

    // Open the dropdown when the user starts typing
    if (!this.open) {
      this.show().then();
    }
  }

  /** Filters visible options based on the current search query */
  private filterOptions() {
    const allOptions = this.getAllOptions();
    const query = this._searchQuery;

    if (!query) {
      // Show all options and opt-groups
      allOptions.forEach(option => {
        option.hidden = false;
      });
      this.getAllOptGroups().forEach(group => {
        group.hidden = false;
      });
      this._noResultsVisible = false;
      return;
    }

    allOptions.forEach(option => {
      const label = option.getTextLabel().toLowerCase();
      const value = option.value.toLowerCase();
      const matches = label.includes(query) || value.includes(query);
      option.hidden = !matches;
    });

    // Update opt-group visibility based on whether any child options are visible
    this.getAllOptGroups().forEach(group => group.updateVisibility());

    // Show empty state when no options match
    this._noResultsVisible = allOptions.every(option => option.hidden);

    // Reset current option if it's now hidden
    if (this.currentOption && this.currentOption.hidden) {
      const firstVisible = allOptions.find(o => !o.hidden && !o.disabled);
      if (firstVisible) {
        this.setCurrentOption(firstVisible);
      }
    }
  }

  /** Clears the search query and shows all options */
  private clearSearch() {
    this._searchQuery = '';
    this._searchDisplayValue = '';
    this._noResultsVisible = false;
    const allOptions = this.getAllOptions();
    allOptions.forEach(option => {
      option.hidden = false;
    });
    // Also unhide any opt-groups that were hidden during filtering
    this.getAllOptGroups().forEach(group => {
      group.hidden = false;
    });
  }

  private handleOptionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const option = target.closest('zn-option');
    const oldValue = this.value;

    if (option && !option.disabled) {
      this.valueHasChanged = true
      if (this.multiple) {
        if (this.maxOptions > 0) {
          if (this.selectedOptions.length >= this.maxOptions && !option.selected) {
            return;
          }

          this.toggleOptionSelection(option);
        } else {
          this.toggleOptionSelection(option)
        }
      } else {
        this.setSelectedOptions(option);
      }

      // Clear search after selection when in search mode
      if (this.search) {
        this.clearSearch();
        if (this.multiple) {
          // Keep the search input clear for further typing
          this.displayInput.value = '';
        }
      }

      // Set focus after updating so the value is announced by screen readers
      this.updateComplete.then(() => {
        // In multi-select + search mode, re-focus the search input so the user can continue typing
        if (this.multiple && this.search && this.open) {
          this.displayInput.value = '';
          this.displayInput.focus({ preventScroll: true });
        } else {
          this.displayInput.focus({ preventScroll: true });
        }
      });

      if (this.value !== oldValue) {
        // Emit after updating
        this.updateComplete.then(() => {
          this.emit('zn-input');
          this.emit('zn-change');
        });
      }

      if (!this.multiple) {
        this.hide().then();
        this.displayInput.focus({ preventScroll: true });
      }

      if (this.triggerSubmit) {
        this.formControlController.submit();
      }
    }
  }

  /* @internal - used by options to update labels */
  private handleDefaultSlotChange() {
    if (!customElements.get('zn-option')) {
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

    // of check if an option has selected attribute set initially
    if (!this.valueHasChanged) {
      const initiallySelectedOptions = allOptions.filter(el => el.hasAttribute('selected'));
      if (initiallySelectedOptions.length) {
        if (this.multiple) {
          this.setSelectedOptions(initiallySelectedOptions);
        } else {
          this.setSelectedOptions(initiallySelectedOptions[0]);
        }
      }
    }
  }

  private handleTagRemove(event: ZnRemoveEvent, option: ZnOption) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!this.disabled) {
      this.toggleOptionSelection(option, false);

      // Emit after updating
      this.updateComplete.then(() => {
        this.emit('zn-input');
        this.emit('zn-change');
      });
    }
  }

  // Gets an array of all <zn-option> elements (both fetched in shadow DOM and slotted in light DOM)
  private getAllOptions() {
    const shadowOptions = this.shadowRoot
      ? [...this.shadowRoot.querySelectorAll<ZnOption>('.select__listbox zn-option')]
      : [];
    const slottedOptions = [...this.querySelectorAll<ZnOption>('zn-option')];
    return [...shadowOptions, ...slottedOptions];
  }

  // Gets an array of all <zn-opt-group> elements (both in shadow DOM and slotted in light DOM)
  private getAllOptGroups() {
    const shadowGroups = this.shadowRoot
      ? [...this.shadowRoot.querySelectorAll<ZnOptGroup>('.select__listbox zn-opt-group')]
      : [];
    const slottedGroups = [...this.querySelectorAll<ZnOptGroup>('zn-opt-group')];
    return [...shadowGroups, ...slottedGroups];
  }

  // Gets an array of visible (not hidden) <zn-option> elements, used by keyboard navigation when search is active
  private getVisibleOptions() {
    return this.getAllOptions().filter(option => !option.hidden);
  }

  // Gets the first <zn-option> element
  public getFirstOption() {
    return this.querySelector<ZnOption>('zn-option');
  }

  // Sets the current option, which is the option the user is currently interacting with (e.g. via keyboard). Only one
  // option may be "current" at a time.
  private setCurrentOption(option: ZnOption | null) {
    const allOptions = this.getAllOptions();

    // Clear selection
    allOptions.forEach((el: ZnOption) => {
      el.current = false;
      el.tabIndex = -1;
    });


    // Select the target option
    if (option) {
      this.currentOption = option;
      option.current = true;
      option.tabIndex = 0;
      // When search is active and the display input has focus, don't steal focus to the option.
      // The user is typing in the search input and we only want to visually highlight the current option.
      if (!(this.search && this.open && this.shadowRoot?.activeElement === this.displayInput)) {
        option.focus();
      }
    }
  }

  // Sets the selected option(s)
  private setSelectedOptions(option: ZnOption | ZnOption[]) {
    const allOptions = this.getAllOptions();
    const newSelectedOptions = Array.isArray(option) ? option : [option];

    // Clear existing selection
    allOptions.forEach(el => (el.selected = false));

    // Set the new selection
    if (newSelectedOptions.length) {
      newSelectedOptions.forEach(el => (el.selected = true));
    }

    // Update selection, value, and display label
    this.selectionChanged();
  }

  // Toggles an option's selected state
  private toggleOptionSelection(option: ZnOption, force?: boolean) {
    if (force === true || force === false) {
      option.selected = force;
    } else {
      option.selected = !option.selected;
    }

    this.selectionChanged();
  }

  // This method must be called whenever the selection changes. It will update the selected options cache, the current
  // value, and the display value
  private selectionChanged() {
    // Update selected options cache
    this.selectedOptions = this.getAllOptions().filter(el => el.selected);

    // Keep a reference to the previous `valueHasChanged`. Changes made here don't count has changing the value.
    const cachedValueHasChanged: boolean = this.valueHasChanged;

    // Update the value and display label
    if (this.multiple) {
      this.getAllOptions().filter(el => !el.multiple).forEach(el => {
        el.multiple = true;
      });

      this.value = this.selectedOptions.map(el => el.value);

      if (this.value.length === 0) {
        // When no items are selected, keep the value empty so the placeholder shows
        this.displayLabel = '';
      } else {
        this.displayLabel = this.localize.term('numOptionsSelected', this.selectedOptions.length);
      }
    } else {
      this.getAllOptions().filter(el => el.multiple).forEach(el => {
        el.multiple = false;
      });
      const selectedOption = this.selectedOptions[0];
      this.value = selectedOption?.value ?? '';
      this.displayLabel = selectedOption?.getTextLabel() ?? '';
    }

    this.valueHasChanged = cachedValueHasChanged;

    // Update validity
    this.updateComplete.then(() => {
      this.formControlController.updateValidity();
    });
  }

  protected get tags() {
    return this.selectedOptions.map((option, index) => {
      if (index < this.maxOptionsVisible || this.maxOptionsVisible <= 0) {
        const tag = this.getTag(option, index);
        return html`
          <div @zn-remove=${(e: ZnRemoveEvent) => this.handleTagRemove(e, option)}>
            ${typeof tag === 'string' ? unsafeHTML(tag) : tag}
          </div>`;
      } else if (index === this.maxOptionsVisible) {
        // Hit tag limit
        return html`
          <zn-chip>+${this.selectedOptions.length - index}</zn-chip>`;
      }
      return html``;
    });
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    if (this.distinct !== "") {
      // if we are linked to another zn-data-select remove the selected values from that select from this select
      const linkedSelect = document.querySelector<ZnSelect>(`zn-select[id="${this.distinct}"]`)!;
      if (linkedSelect) {
        linkedSelect.addEventListener('zn-change', () => {
          const linkedValues = Array.isArray(linkedSelect.value) ? linkedSelect.value : [linkedSelect.value];
          const options = this.getAllOptions().map(option => option as HTMLElement);
          options.forEach(option => {
            if (linkedValues.includes((option as ZnOption).value)) {
              option.style.display = 'none';
            } else {
              option.style.display = '';
            }
          });
        });

        // trigger the event once to initialize
        linkedSelect.dispatchEvent(new Event('zn-input'));
      }

    }

    if (this.conditional !== "") {
      const ids = this.conditional.split(',').map(id => id.trim());
      const conditionals: ZnSelect[] = [];

      ids.forEach(id => {
        const elements = deepQuerySelectorAll(`#${id}`, document.documentElement, '') as ZnSelect[];
        conditionals.push(...elements);
      });

      const checkConditionals = () => {
        this.disabled = conditionals.some(select => {
          let linkedValues = Array.isArray(select.value) ? select.value : [select.value];
          linkedValues = linkedValues.filter(v => v !== '');
          return linkedValues.length > 0;
        });
      };

      conditionals.forEach(select => {
        select.addEventListener('zn-change', checkConditionals);
        select.addEventListener('zn-input', checkConditionals);
      });

      // trigger the check once to initialize
      checkConditionals();
    }

    if (this.dataUri) {
      this.fetchOptions().then();
    }

    this.updateHasInputPrefix();
    this.updateDependencies();
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  handleDisabledChange() {
    if (this.disabled) {
      // Close the listbox and abort any in-progress fetch
      this.open = false;
      this.handleOpenChange().then();
      this._fetchAbortController?.abort();
      this._fetchAbortController = null;
      this._fetchLoading = false;
      this._fetchError = '';
    } else if (this.dataUri) {
      // Fetch options when enabled
      this.fetchOptions().then();
    }
  }

  @watch(['dataUri', 'contextData'], { waitUntilFirstUpdate: true })
  handleSrcChange() {
    if (this.dataUri) {
      this.fetchOptions().then();
    } else {
      this._fetchedOptions = [];
      this._fetchLoading = false;
      this._fetchError = '';
      this.handleDefaultSlotChange();
    }
  }

  private _handleFetchError(message: string) {
    this._fetchError = message;
    this._fetchLoading = false;
    this._fetchAbortController = null;
    this.emit('zn-error', { detail: { status: 400 } });
  }

  /** Fetches options from the URL specified by the `src` property. */
  async fetchOptions() {
    if (!this.dataUri || this.disabled) return;

    this._fetchAbortController?.abort();
    this._fetchAbortController = new AbortController();

    this._fetchLoading = true;
    this._fetchError = '';

    try {
      const response = await fetch(this.dataUri, {
        signal: this._fetchAbortController.signal,
        credentials: 'same-origin',
        headers: {
          'x-kx-fetch-style': 'zn-select-options',
          'x-kx-context-data': this.contextData || ''
        },
      });

      if (!response.ok) {
        this._handleFetchError(response.statusText || `HTTP ${response.status}`);
        return;
      }

      const data: unknown = await response.json();

      type FetchedOption = { key: string; value: string; group?: undefined };
      type FetchedGroup = { group: string; options: { key: string; value: string }[] };
      let options: (FetchedOption | FetchedGroup)[];

      if (Array.isArray(data)) {
        // Check if the array contains grouped items: [{ group: "Label", options: [...] }, ...]
        const isGrouped = data.length > 0 && data.some(
          (item: unknown) => item && typeof item === 'object' && 'group' in (item as Record<string, unknown>)
        );

        if (isGrouped) {
          options = (data as Record<string, unknown>[]).map(item => {
            if ('group' in item && Array.isArray(item.options)) {
              return {
                group: String(item.group),
                options: item.options as { key: string; value: string }[]
              } as FetchedGroup;
            }
            return item as unknown as FetchedOption;
          });
        } else {
          options = data as FetchedOption[];
        }
      } else if (data && typeof data === 'object') {
        // Convert {id: label, ...} object to [{key, value}, ...] array
        options = Object.entries(data as Record<string, unknown>).map(([key, value]) => ({
          key,
          value: String(value)
        }));
      } else {
        this._handleFetchError('Expected JSON array or object of options');
        return;
      }

      this._fetchedOptions = options;
      this._fetchLoading = false;
      this._fetchAbortController = null;

      this.emit('zn-load');

      this.updateComplete.then(() => {
        this.handleDefaultSlotChange();
      });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      this._handleFetchError(error instanceof Error ? error.message : 'Failed to load options');
    }
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    super.attributeChangedCallback(name, oldVal, newVal);

    if (name === 'value') {
      const cachedValueHasChanged = this.valueHasChanged;
      this.value = this.defaultValue;

      // Set it back to false since this isn't an interaction.
      this.valueHasChanged = cachedValueHasChanged;
    }
  }

  @watch(['defaultValue', 'value'], { waitUntilFirstUpdate: true })
  handleValueChange() {
    if (!this.valueHasChanged) {
      const cachedValueHasChanged = this.valueHasChanged;
      this.value = this.defaultValue;

      // Set it back to false since this isn't an interaction
      this.valueHasChanged = cachedValueHasChanged;
    }
    const allOptions = this.getAllOptions();
    const value = Array.isArray(this.value) ? this.value : [this.value];

    // Select only the options that match the new value
    this.setSelectedOptions(allOptions.filter(el => value.includes(el.value)));
    this.updateDependencies();
  }

  @watch('open', { waitUntilFirstUpdate: true })
  async handleOpenChange() {
    if (this.open && !this.disabled) {
      // Reset the current option
      this.setCurrentOption(null);

      // When search is enabled, clear the display input to allow typing and show all options
      if (this.search) {
        this.clearSearch();
        this.displayInput.value = '';
        this.displayInput.readOnly = false;
      }

      // Show
      this.emit('zn-show');
      this.addOpenListeners();

      await stopAnimations(this);
      this.listbox.hidden = false;
      this.popup.active = true;

      // Select the appropriate option based on value after the listbox opens
      requestAnimationFrame(() => {
        this.setCurrentOption(this.currentOption);
      });

      // Focus the search input so the user can start typing immediately
      if (this.search) {
        requestAnimationFrame(() => {
          this.displayInput.focus({ preventScroll: true });
        });
      }

      const { keyframes, options } = getAnimation(this, 'select.show', { dir: this.localize.dir() });
      await animateTo(this.popup.popup, keyframes, options);

      // Make sure the current option is scrolled into view (required for Safari)
      if (this.currentOption) {
        scrollIntoView(this.currentOption, this.listbox, 'vertical', 'auto');
      }

      this.emit('zn-after-show');
    } else {
      // Hide
      this.emit('zn-hide');
      this.removeOpenListeners();

      // When search is enabled, restore the display label and clear the search
      if (this.search) {
        this.clearSearch();
        this.displayInput.readOnly = true;
        // In multiple mode, tags show the selection so keep the input empty
        this.displayInput.value = this.multiple ? '' : this.displayLabel;
      }

      await stopAnimations(this);
      const { keyframes, options } = getAnimation(this, 'select.hide', { dir: this.localize.dir() });
      await animateTo(this.popup.popup, keyframes, options);
      this.listbox.hidden = true;
      this.popup.active = false;

      this.emit('zn-after-hide');
    }
  }

  /** Shows the listbox. */
  async show() {
    if (this.open || this.disabled) {
      this.open = false;
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'zn-after-show');
  }

  /** Hides the listbox. */
  async hide() {
    if (!this.open || this.disabled) {
      this.open = false;
      return undefined;
    }

    this.open = false;
    return waitForEvent(this, 'zn-after-hide');
  }

  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    return this.valueInput ? this.valueInput.checkValidity() : false;
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.valueInput ? this.valueInput.reportValidity() : false;
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string) {
    this.valueInput.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  /** Sets focus on the control. */
  focus(options?: FocusOptions) {
    this.displayInput.focus(options);
  }

  /** Removes focus from the control. */
  blur() {
    this.displayInput.blur();
  }

  private updateDependencies() {
    const root = this.getRootNode() as Document | ShadowRoot;
    if (!root?.querySelectorAll) return;

    const dependentElements = root.querySelectorAll('[data-disable-on]');
    dependentElements.forEach(el => {
      const selector = el.getAttribute('data-disable-on');
      if (!selector) return;

      let trigger: Element | null = null;
      try {
        trigger = root.querySelector(selector);
      } catch (e) {
        // no-op
      }

      if (!trigger) {
        const idSelector = selector.startsWith('#') ? selector : `#${selector}`;
        try {
          trigger = root.querySelector(idSelector);
        } catch (e) {
          // no-op
        }
      }

      if (trigger === this) {
        this.updateDependencyState(el as HTMLInputElement);
      }
    });
  }

  private updateDependencyState(target: HTMLInputElement) {
    const disableValue = target.getAttribute('data-disable-value');
    if (disableValue !== null) {
      const valuesToCheck = disableValue.split(',').map(v => v.trim());
      let shouldDisable: boolean;

      if (Array.isArray(this.value)) {
        shouldDisable = this.value.some(v => valuesToCheck.includes(v));
      } else {
        shouldDisable = valuesToCheck.includes(String(this.value));
      }

      this.toggleDisabled(target, shouldDisable);
    }
  }

  private toggleDisabled(target: HTMLInputElement, disabled: boolean) {
    const reset = () => {
      if ('defaultValue' in target && typeof target.defaultValue !== 'undefined') {
        target.value = target.defaultValue;
      }
    }

    target.disabled = disabled;

    if (disabled) {
      reset();
    }
  }

  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltipSlot = this.hasSlotController.test('label-tooltip');
    const hasContextNoteSlot = this.hasSlotController.test('context-note');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasLabelTooltip = this.labelTooltip ? true : hasLabelTooltipSlot;
    const hasContextNote = this.contextNote ? true : hasContextNoteSlot;
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;
    const hasClearIcon = this.clearable && !this.disabled && this.value.length > 0;
    const isPlaceholderVisible = this.placeholder && this.value.length === 0;
    const isFetchDisabled = this._fetchLoading || !!this._fetchError;
    const isDisabled = this.disabled || isFetchDisabled;

    return html`
      <div
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control--small': this.size === 'small',
          'form-control--medium': this.size === 'medium',
          'form-control--large': this.size === 'large',
          'form-control--has-label': hasLabel,
          'form-control--has-label-tooltip': hasLabelTooltip,
          'form-control--has-context-note': hasContextNote,
          'form-control--has-help-text': hasHelpText
        })}>
        <label
          id="label"
          part="form-control-label"
          class="form-control__label"
          aria-hidden=${hasLabel ? 'false' : 'true'}
          @click=${this.handleLabelClick}>
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
        ${hasContextNote
          ? html`
            <span class="form-control__label-context-note"><slot name="context-note">${this.contextNote}</slot></span>`
          : ''}

        <div part="form-control-input" class="form-control-input">
          <zn-popup
            class=${classMap({
              select: true,
              'select--standard': true,
              'select--pill': this.pill,
              'select--open': this.open,
              'select--disabled': this.disabled || isFetchDisabled,
              'select--multiple': this.multiple,
              'select--focused': this.hasFocus,
              'select--placeholder-visible': isPlaceholderVisible,
              'select--top': this.placement === 'top',
              'select--bottom': this.placement === 'bottom',
              'select--small': this.size === 'small',
              'select--medium': this.size === 'medium',
              'select--large': this.size === 'large',
              'select--has-input-prefix': this.inputPrefix,
              'select--search': this.search
            })}
            placement=${this.placement}
            strategy=${this.hoist ? 'fixed' : 'absolute'}
            flip
            shift
            sync="width"
            auto-size="vertical"
            auto-size-padding="10">
            <div
              part="combobox"
              class="select__combobox"
              slot="anchor"
              @keydown=${this.handleComboboxKeyDown}
              @mousedown=${this.handleComboboxMouseDown}>
              <slot part="prefix"
                    name="prefix"
                    class="select__prefix"
                    @slotchange=${() => this.updateHasInputPrefix()}></slot>

              <input
                part="display-input"
                class="select__display-input"
                type="text"
                placeholder=${this._fetchLoading ? 'Loading...' : this._fetchError ? this._fetchError : (this.search && this.open ? (this.displayLabel || this.placeholder || 'Search...') : this.placeholder)}
                .disabled=${isDisabled}
                .value=${isFetchDisabled ? '' : (this.search && this.open) ? this._searchDisplayValue : (this.search && this.multiple) ? '' : this.displayLabel}
                autocomplete="off"
                spellcheck="false"
                autocapitalize="off"
                ?readonly=${!(this.search && this.open)}
                aria-controls="listbox"
                aria-expanded=${this.open ? 'true' : 'false'}
                aria-haspopup="listbox"
                aria-labelledby="label"
                aria-disabled=${isDisabled ? 'true' : 'false'}
                aria-describedby="help-text"
                aria-autocomplete=${this.search ? 'list' : 'none'}
                role="combobox"
                tabindex="0"
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
                @input=${this.handleSearchInput}
              />

              ${this.multiple ? html`
                <div part="tags" class="select__tags">${this.tags}</div>` : ''}

              <input
                class="select__value-input"
                type="text"
                disabled=${isDisabled || nothing}
                required=${this.required || nothing}
                value=${Array.isArray(this.value) ? this.value.join(', ') : this.value}
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
                    aria-label=${this.localize.term('clearEntry')}
                    @mousedown=${this.handleClearMouseDown}
                    @click=${this.handleClearClick}
                    tabindex="-1">
                    <slot name="clear-icon">
                      <zn-icon src="cancel"></zn-icon>
                    </slot>
                  </button>`
                : ''}

              ${this._fetchLoading
                ? html`
                  <zn-icon src="progress_activity" class="select__expand-icon select__spinner"></zn-icon>`
                : this._fetchError
                  ? html`
                    <zn-icon src="error" class="select__expand-icon select__fetch-error-icon"></zn-icon>`
                  : html`
                    <slot name="expand-icon" part="expand-icon" class="select__expand-icon">
                      <zn-icon src="keyboard_arrow_down"></zn-icon>
                    </slot>`
              }
            </div>

            <div
              id="listbox"
              role="listbox"
              aria-expanded=${this.open ? 'true' : 'false'}
              aria-multiselectable=${this.multiple ? 'true' : 'false'}
              aria-labelledby="label"
              part="listbox"
              class="select__listbox"
              tabindex="-1"
              @mouseup=${this.handleOptionClick}
              @slotchange=${this.handleDefaultSlotChange}>
              <slot></slot>
              ${this._fetchedOptions.map(item =>
                item.group !== undefined
                  ? html`
                    <zn-opt-group label=${item.group}>
                      ${item.options.map(
                        option => html`
                          <zn-option value=${option.key}>${option.value}</zn-option>`
                      )}
                    </zn-opt-group>`
                  : html`
                    <zn-option value=${item.key}>${item.value}</zn-option>`
              )}
              <div part="empty-state" class="select__empty-state" ?hidden=${!this._noResultsVisible}>
                No matching options
              </div>
            </div>
          </zn-popup>
        </div>


        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `;
  }
}

setDefaultAnimation('select.show', {
  keyframes: [
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 100, easing: 'ease' }
});

setDefaultAnimation('select.hide', {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.9 }
  ],
  options: { duration: 100, easing: 'ease' }
});
