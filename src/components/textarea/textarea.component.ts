import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {getSlashMenuPreset, parseSlashItems, type SlashMenuItem} from "../slash-menu/slash-menu-items";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";
import {property, query, state} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {SlashMenuController} from "../slash-menu/slash-menu-controller";
import {watch} from '../../internal/watch';
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import ZnSlashItem from "../slash-item";
import ZnSlashMenu from "../slash-menu";

import styles from './textarea.scss';

/**
 * @summary Textareas collect data from the user and allow multiple lines of text.
 * @documentation https://zinc.style/components/textarea
 * @status stable
 * @since 2.0
 *
 * @slot label - The textareas label. Alternatively, you can use the `label` attribute.
 * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
 * @slot context-note - Used to add contextual text that is displayed above the textarea, on the right. Alternatively, you can use the `context-note` attribute.
 * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
 * @slot slash-items - `<zn-slash-item>` elements describing the insertions offered by the slash menu. Items are
 *  picked up wherever they sit inside the textarea, so this slot name is optional.
 * @slot slash-menu - A `<zn-slash-menu>` to use instead of the built-in one, so its heading, sizing and styling can
 *  be set in markup. Any `<zn-slash-item>` children of it become the menu's items.
 *
 * @dependency zn-slash-item
 * @dependency zn-slash-menu
 *
 * @event zn-blur - Emitted when the control loses focus.
 * @event zn-change - Emitted when an alteration to the control's value is committed by the user.
 * @event zn-focus - Emitted when the control gains focus.
 * @event zn-input - Emitted when the control receives input.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 * @event zn-slash-select - Emitted when a slash menu item is chosen. Cancelable — call `preventDefault()` to
 *  suppress the insertion and handle the item yourself.
 * @event zn-slash-insert - Emitted after a slash menu item's value has been inserted.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The input's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart base - The component's base wrapper.
 * @csspart textarea - The internal `<textarea>` control.
 * @csspart slash-menu - The slash menu shown at the caret.
 */
export default class ZnTextarea extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-slash-item': ZnSlashItem,
    'zn-slash-menu': ZnSlashMenu
  };

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-blur', 'zn-input']
  });
  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');
  private readonly resizeObserver = new ResizeController(this, {
    target: null,
    callback: () => this.setTextareaHeight(),
  });
  /** Ensures we only attempt to derive the initial value from light DOM content once */
  private _didInitFromContent = false;

  private readonly slashController = new SlashMenuController(this, {
    menu: () => this.mountSlashMenu(),
    items: search => this.resolveSlashItems(search),
    trigger: () => this.slashTrigger,
    onSelect: (item, search) => !this.emit('zn-slash-select', {
      detail: {item, query: search}
    }).defaultPrevented,
    // The field's own input event has already synced `value` by this point
    onInsert: (item, value) => this.emit('zn-slash-insert', {detail: {item, value}})
  });

  @query('.form-control-input') formControl: HTMLElement;
  @query('.textarea__control') input: HTMLTextAreaElement;
  @query('zn-slash-menu') slashMenuElement: ZnSlashMenu | null;

  @state() hasFocus = false;

  /** Renders the slash menu only once it has been needed, keeping unused textareas cheap. */
  @state() private hasSlashMenu = false;

  @property() title = ''; // make reactive to pass through

  /** The name of the textarea, submitted as a name/value pair with form data. */
  @property() name = '';

  /** The current value of the textarea, submitted as a name/value pair with form data. */
  @property() value = '';

  /** The text area's size. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /**  The textarea label. If you need to display HTML, use the `label` slot instead. */
  @property() label = '';

  /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
  @property({attribute: 'label-tooltip'}) labelTooltip = '';

  /** Text that appears above the textarea, on the right, to add additional context. If you need to display HTML in this text, use the `context-note` slot instead. */
  @property({attribute: 'context-note'}) contextNote = '';

  /** The text area's help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({attribute: 'help-text'}) helpText = '';

  /** Placeholder text to show as a hint when the input is empty. */
  @property() placeholder = '';

  /** The number of rows to display by default. */
  @property({attribute: 'rows',type: Number}) rows = 4;

  /** Controls how the textarea can be resized. */
  @property() resize: 'none' | 'vertical' | 'auto' = 'vertical';

  /** Disables the textarea. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Makes the textarea readonly. */
  @property({type: Boolean, reflect: true}) readonly = false;

  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  @property({reflect: true}) form = '';

  @property({type: Boolean, reflect: true}) flush = false;

  /** Makes the textarea a required field. */
  @property({type: Boolean, reflect: true}) required = false;

  /** The minimum length of input that will be considered valid. */
  @property({type: Number}) minlength: number;

  /** The maximum length of input that will be considered valid. */
  @property({type: Number}) maxlength: number;

  /** Controls whether and how text input is automatically capitalized as it is entered by the user. */
  @property() autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

  /** Indicates whether the browser's autocorrect feature is on or off. */
  @property() autocorrect: string;

  /**
   * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
   * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
   */
  @property() autocomplete: string;

  /** Indicates that the input should receive focus on page load. */
  @property({type: Boolean}) autofocus: boolean;

  /** Used to customize the label or icon of the Enter key on virtual keyboards. */
  @property() enterkeyhint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

  /** Enables spell checking on the textarea. */
  @property({
    type: Boolean,
    converter: {
      // Allow "true|false" attribute values but keep the property boolean
      fromAttribute: value => (!(!value || value === 'false')),
      toAttribute: value => (value ? 'true' : 'false')
    }
  })
  spellcheck = true;

  /**
   * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
   * keyboard on supportive devices.
   */
  @property() inputmode: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /**
   * Quick insertions offered by the slash menu. Accepts a JSON array of items, or the shorthand
   * `Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}`. Can also be set as an array of
   * `SlashMenuItem` objects in JavaScript.
   */
  @property({
    attribute: 'slash-items',
    converter: {
      fromAttribute: (value: string) => parseSlashItems(value),
      toAttribute: (value: SlashMenuItem[]) => JSON.stringify(value)
    }
  })
  slashItems: SlashMenuItem[] = [];

  /** Names of item sets registered with `registerSlashMenuPreset`, comma separated. */
  @property({attribute: 'slash-preset'}) slashPreset = '';

  /** The characters that open the slash menu. */
  @property({attribute: 'slash-trigger'}) slashTrigger = '/';

  /** The heading shown above the slash menu's items. */
  @property({attribute: 'slash-heading'}) slashHeading = 'Insert';

  /**
   * Resolves additional items each time the menu opens, for lists that come from elsewhere (e.g. an
   * API). Receives the current query and may return a promise. JavaScript only.
   */
  @property({attribute: false}) slashItemsProvider?: (query: string) => SlashMenuItem[] | Promise<SlashMenuItem[]>;

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue() defaultValue = '';

  @property({type: Boolean}) transparent = false;

  /** Gets the validity state object */
  get validity() {
    return this.input?.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }

  connectedCallback() {
    super.connectedCallback();
    // Initialize the value from the element's light DOM text content when no value attribute/property is set.
    // This allows usage like: <zn-textarea>Initial content</zn-textarea>
    if (!this._didInitFromContent) {
      this._didInitFromContent = true;

      const hasValueAttribute = this.hasAttribute('value');
      const hasProgrammaticValue = typeof this.value === 'string' && this.value.length > 0;

      if (!hasValueAttribute && !hasProgrammaticValue) {
        // Collect only top-level text nodes to avoid pulling in slotted element text (e.g., label/help-text)
        const textNodes = Array.from(this.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
        const raw = textNodes.map(n => n.textContent ?? '').join('');
        const content = raw.replace(/\r\n/g, '\n').trim();

        if (content.length > 0) {
          this.value = content;
          this.defaultValue = content;
          // Remove the consumed text nodes to prevent stray light DOM text
          textNodes.forEach(n => {
            // Only remove nodes that actually contributed non-whitespace content
            if ((n.textContent ?? '').trim().length > 0) {
              n.parentNode?.removeChild(n);
            }
          });
        }
      }
    }

    this.updateComplete.then(() => {
      this.resizeObserver.observe(this.input);

      // Set the initial textarea height to maximum available space
      this.formControl.style.display = 'flex';
      this.formControl.style.flexGrow = '1';
    });
  }

  firstUpdated() {
    this.formControlController.updateValidity();
    this.slashController.attach(this.input);
  }

  /** The insertions the slash menu offers, gathered from every source, in the order they were declared. */
  async resolveSlashItems(search = ''): Promise<SlashMenuItem[]> {
    const items = [
      ...getSlashMenuPreset(this.slashPreset),
      ...this.slashItems,
      ...this.slottedSlashItems()
    ];

    const provided = await this.slashItemsProvider?.(search);
    return provided ? [...items, ...provided] : items;
  }

  /** Opens the slash menu at the caret, inserting the trigger if it isn't already there. */
  async showSlashMenu() {
    this.focus();

    const caret = this.input.selectionStart ?? this.input.value.length;
    const precedes = this.input.value.slice(caret - this.slashTrigger.length, caret);
    if (precedes !== this.slashTrigger) {
      this.setRangeText(this.slashTrigger, caret, caret, 'end');
    }

    await this.updateComplete;
    this.slashController.requestOpen();
  }

  /** Closes the slash menu. */
  hideSlashMenu() {
    this.slashController.close();
  }

  private slottedSlashItems(): SlashMenuItem[] {
    const elements = [...this.querySelectorAll<ZnSlashItem>('zn-slash-item')];

    return elements.map(element => {
      // Elements from a different zinc build may not have upgraded, so fall back to their markup
      if (typeof element.toSlashMenuItem === 'function') return element.toSlashMenuItem();

      const value = element.getAttribute('value') ?? (element.textContent ?? '').trim();
      const order = element.getAttribute('order');
      const caretOffset = element.getAttribute('caret-offset');

      return {
        label: element.getAttribute('label') ?? value,
        value,
        icon: element.getAttribute('icon') ?? undefined,
        description: element.getAttribute('description') ?? undefined,
        keywords: element.getAttribute('keywords') ?? undefined,
        group: element.getAttribute('group') ?? undefined,
        action: element.getAttribute('action') ?? undefined,
        order: order === null ? undefined : Number(order),
        caretOffset: caretOffset === null ? undefined : Number(caretOffset),
        disabled: element.hasAttribute('disabled')
      };
    });
  }

  private async mountSlashMenu(): Promise<ZnSlashMenu | null> {
    // A slotted menu is the author's own: it keeps its own heading, sizing and styling
    const slotted = this.querySelector<ZnSlashMenu>('zn-slash-menu');
    if (slotted) return slotted;

    if (!this.hasSlashMenu) {
      this.hasSlashMenu = true;
      await this.updateComplete;
    }

    return this.slashMenuElement;
  }

  private handleBlur() {
    this.hasFocus = false;
    this.emit('zn-blur');
  }

  private handleChange() {
    this.value = this.input.value;
    this.setTextareaHeight();
    this.emit('zn-change');
  }

  private handleFocus() {
    this.hasFocus = true;
    this.emit('zn-focus');
  }

  private handleInput() {
    this.value = this.input.value;
    this.emit('zn-input');
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private handleKeyDown(event: KeyboardEvent) {
    // The slash menu claims its own keys before this handler runs; Escape closes it, not the field
    if (this.slashController.open) return;

    if (event.key === 'Escape') {
      this.input.blur();
      event.stopPropagation();
    }
  }

  private setTextareaHeight() {
    if (this.resize === 'auto') {
      this.input.style.height = 'auto';
      this.input.style.height = `${this.input.scrollHeight}px`;
    } else {
      (this.input.style.height as string | undefined) = undefined;
    }

    // Force the form control to take up the full height of the textarea
    this.formControl.style.height = this.input.style.height;

    // Unset flex grow on initial resize
    if (this.formControl.style.height !== '') {
      this.formControl.style.flexGrow = '0';
    }
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    // Disabled form controls are always valid
    this.formControlController.setValidity(this.disabled);
  }

  @watch('rows', {waitUntilFirstUpdate: true})
  handleRowsChange() {
    this.setTextareaHeight();
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
    this.setTextareaHeight();
  }

  /** Sets focus on the textarea. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the textarea. */
  blur() {
    this.input.blur();
  }

  /** Selects all the text in the textarea. */
  select() {
    this.input.select();
  }

  /** Gets or sets the textarea scroll position. */
  scrollPosition(position?: { top?: number; left?: number }): { top: number; left: number } | undefined {
    if (position) {
      if (typeof position.top === 'number') this.input.scrollTop = position.top;
      if (typeof position.left === 'number') this.input.scrollLeft = position.left;
      return undefined;
    }

    return {
      top: this.input.scrollTop,
      left: this.input.scrollLeft
    };
  }

  /** Sets the start and end positions of the text selection (0-based). */
  setSelectionRange(
    selectionStart: number,
    selectionEnd: number,
    selectionDirection: 'forward' | 'backward' | 'none' = 'none'
  ) {
    this.input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }

  /** Replaces a range of text with a new string. */
  setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    const selectionStart = start ?? this.input.selectionStart;
    const selectionEnd = end ?? this.input.selectionEnd;

    this.input.setRangeText(replacement, selectionStart, selectionEnd, selectMode);

    if (this.value !== this.input.value) {
      this.value = this.input.value;
      this.setTextareaHeight();
    }
  }


  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    return this.input.checkValidity();
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.input.reportValidity();
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
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
        })}
      >
        <label
          part="form-control-label"
          class="form-control__label"
          for="input"
          aria-hidden=${hasLabel ? 'false' : 'true'}
        >
          <slot name="label">${this.label}</slot>
          ${hasLabelTooltip
            ? html`
              <zn-tooltip class="form-control--label-tooltip">
                <div slot="content">
                  <slot name="label-tooltip">${this.labelTooltip}</slot>
                </div>
                <zn-icon library="fa" src="info"></zn-icon>
              </zn-tooltip>`
            : ''}
        </label>
        ${hasContextNote
          ? html`<span class="form-control__label-context-note"><slot
            name="context-note">${this.contextNote}</slot></span>`
          : ''}

        <div part="form-control-input" class=${classMap({
          "form-control-input": true,
          "form-control-input--flush": this.flush
        })}>
          <div
            part="base"
            class=${classMap({
              textarea: true,
              'textarea--standard': true,
              'textarea--small': this.size === 'small',
              'textarea--medium': this.size === 'medium',
              'textarea--large': this.size === 'large',
              'textarea--disabled': this.disabled,
              'textarea--focused': this.hasFocus,
              'textarea--empty': !this.value,
              'textarea--resize-none': this.resize === 'none',
              'textarea--resize-vertical': this.resize === 'vertical',
              'textarea--resize-auto': this.resize === 'auto',
              'textarea--transparent': this.transparent
            })}>
            <textarea
              part="textarea"
              id="input"
              class="textarea__control"
              title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
              name=${ifDefined(this.name)}
              .value=${live(this.value)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              placeholder=${ifDefined(this.placeholder)}
              rows=${ifDefined(this.rows)}
              minlength=${ifDefined(this.minlength)}
              maxlength=${ifDefined(this.maxlength)}
              autocapitalize=${ifDefined(this.autocapitalize)}
              autocorrect=${ifDefined(this.autocorrect)}
              ?autofocus=${this.autofocus}
              spellcheck=${ifDefined(this.spellcheck)}
              enterkeyhint=${ifDefined(this.enterkeyhint)}
              inputmode=${ifDefined(this.inputmode)}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @keydown=${this.handleKeyDown}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            ></textarea>
          </div>
          ${this.hasSlashMenu
            ? html`
              <zn-slash-menu part="slash-menu" heading=${this.slashHeading}></zn-slash-menu>`
            : ''}
          <slot name="slash-menu"></slot>
          <slot name="slash-items" hidden></slot>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>`;
  }
}
