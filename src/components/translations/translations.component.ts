import {classMap} from 'lit/directives/class-map.js';
import {FormControlController, validValidityState} from '../../internal/form';
import {HasSlotController} from '../../internal/slot';
import {html, nothing, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {keyed} from 'lit/directives/keyed.js';
import {live} from 'lit/directives/live.js';
import {parseSlashItems, type SlashMenuItem} from '../slash-menu';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnChip from '../chip';
import ZnInlineEdit from '../inline-edit';
import ZnInput from '../input';
import ZnOption from '../option';
import ZnSelect from '../select';
import ZnTextarea from '../textarea';
import type {PropertyValues} from 'lit';
import type {ZincFormControl} from '../../internal/zinc-element';

import formControlStyles from '../../form-control.scss';
import styles from './translations.scss';

/**
 * @summary Collects one piece of text in several languages, one language at a time.
 * @documentation https://zinc.style/components/translations
 * @status experimental
 * @since 1.0
 *
 * A select above the field chooses the language being edited, and every language it offers carries a chip saying
 * whether it has a translation of its own or falls back to English. Blank languages fall back to English at render
 * time, so a blank field shows the English text as its placeholder rather than looking empty.
 *
 * The value submitted is a JSON object keyed by language code. A language stays out of it until it is typed into, so
 * browsing the languages does not pad the payload with empty translations.
 *
 * Put several of these in a `zn-translation-group` to have one select drive all of them.
 *
 * @dependency zn-chip
 * @dependency zn-inline-edit
 * @dependency zn-input
 * @dependency zn-option
 * @dependency zn-select
 * @dependency zn-textarea
 *
 * @slot label - The field's label. Alternatively, use the `label` attribute.
 * @slot actions - Actions shown beside the label — an auto-translate button, typically. Hidden while `grouped`,
 *  where the group's own header carries them instead.
 * @slot help-text - Text describing how to fill the field in, shown below it and shared by every language.
 *  Alternatively, use the `help-text` attribute.
 *
 * @event zn-change - Emitted when a translation's value changes.
 * @event zn-input - Emitted when a translation receives input.
 *
 * @csspart form-control - The form control that wraps the label, the language select, the field and the help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The wrapper around the field being edited.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart language-select - The select that chooses the language being edited.
 */
export default class ZnTranslations extends ZincElement implements ZincFormControl {
  static styles = [unsafeCSS(formControlStyles), unsafeCSS(styles)];
  static dependencies = {
    'zn-chip': ZnChip,
    'zn-inline-edit': ZnInlineEdit,
    'zn-input': ZnInput,
    'zn-option': ZnOption,
    'zn-select': ZnSelect,
    'zn-textarea': ZnTextarea
  };

  private readonly formControlController: FormControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, 'label', 'actions', 'help-text');

  /** The name submitted with the form. */
  @property() name = '';

  /** The translations as a JSON object keyed by language code. The mirror of `values` in attribute form. */
  @property() value = '{"en":""}';

  /** The label shown above the field. If you need HTML, use the `label` slot instead. */
  @property() label: string = '';

  /**
   * Text shown below the field, describing how to fill it in. Applies to every language. If you need HTML, use the
   * `help-text` slot instead.
   */
  @property({attribute: 'help-text'}) helpText: string = '';

  /** Disables editing in every language. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Marks the label required. Validity is not enforced per language. */
  @property({type: Boolean, reflect: true}) required = false;

  /** Removes the component's own padding. */
  @property({type: Boolean, reflect: true}) flush = false;

  /** The control each translation is edited through. */
  @property({attribute: "input-type"}) inputType: 'text' | 'number' | 'textarea' = 'text';

  /** Rows of the textarea, when `input-type` is `textarea`. */
  @property({attribute: "textarea-rows", type: Number}) textareaRows: number | undefined;

  /**
   * Edits the translation through a `zn-inline-edit` — the value reads as text until it is clicked — rather than a
   * plain input or textarea.
   */
  @property({type: Boolean, reflect: true, attribute: 'inline-edit'}) inlineEdit = false;

  /**
   * Quick insertions offered by the slash menu on `text` and `textarea` inputs. Accepts a JSON array of items, or
   * the shorthand `Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}`. Every language shares the list.
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

  /** The name the slash menu's list is announced by. */
  @property({attribute: 'slash-heading'}) slashHeading = 'Insert';

  /** Hides the insertion keys normally shown against the slash menu's items. */
  @property({attribute: 'slash-hide-keys', type: Boolean}) slashHideKeys = false;

  /** Lists the slash menu items most recently chosen here above the rest, remembered under this key. */
  @property({attribute: 'slash-recent-key'}) slashRecentKey = '';

  /** Resolves additional slash menu items each time the menu opens. JavaScript only. */
  @property({attribute: false}) slashItemsProvider?: (query: string) => SlashMenuItem[] | Promise<SlashMenuItem[]>;

  /**
   * Hides this component's own language select and defers the choice to a parent zn-translation-group. The group sets
   * this on its children itself.
   */
  @property({type: Boolean, reflect: true}) grouped = false;

  /**
   * The languages on offer, as language code to display name — `{"en": "English", "fr": "French"}`. Writing the code
   * as the name (`{"en": "EN"}`) is also accepted. `en` is the language every other one falls back to.
   */
  @property({type: Object}) languages: Record<string, string> = {
    'en': 'EN'
  };

  /** The translations as an object keyed by language code. The mirror of `value` in property form. */
  @property({type: Object}) values: Record<string, string> = {};

  @state() private _activeLanguage = 'en';

  get validity(): ValidityState {
    return validValidityState;
  }

  get validationMessage() {
    return '';
  }

  checkValidity() {
    return true;
  }

  getForm() {
    return this.formControlController.getForm();
  }

  reportValidity() {
    return true;
  }

  setCustomValidity() {
    // no-op
  }

  /**
   * Sets the active language externally. Used by zn-translation-group. Browsing to a language does not create a key
   * for it — an untouched language stays absent from `values` so it is not submitted as an empty translation.
   */
  public setActiveLanguage(language: string) {
    this._activeLanguage = language;
    this.requestUpdate();
  }

  /** Returns the currently active language. */
  public getActiveLanguage(): string {
    return this._activeLanguage;
  }

  /** Adds a language key to this component's values if not already present. Used by zn-translation-group. */
  public addLanguageKey(languageCode: string) {
    const values = this.pendingValues();
    if (!Object.prototype.hasOwnProperty.call(values, languageCode)) {
      this.values = {...values, [languageCode]: ''};
      this.updateValue();
    }
  }

  /** Returns all language codes that have values. */
  public getValueLanguages(): string[] {
    return Object.keys(this.pendingValues());
  }

  /** Whether the language carries a translation of its own, rather than falling back to English. */
  public hasTranslation(language: string): boolean {
    return (this.pendingValues()[language] ?? '').trim() !== '';
  }

  /** The chip shown against a language, in the select's value and against each of its options. */
  private languageState(language: string): {type: 'success' | 'error'; label: string} {
    if (this.hasTranslation(language)) return {type: 'success', label: 'Translated'};
    return {type: 'error', label: language === 'en' ? 'Empty' : 'English'};
  }

  /**
   * `English (EN)` — the configured name plus its code, unless the name already is the code, in which case the code
   * alone. `languages` is written both ways: `{"en": "English"}` and `{"en": "EN"}`.
   */
  private languageLabel(language: string): string {
    const name = this.languages[language] ?? language.toUpperCase();
    const code = language.toUpperCase();
    return name.toUpperCase() === code ? name : `${name} (${code})`;
  }

  /**
   * `values`, falling back to the `value` attribute it is built from while that is still pending. A parent
   * zn-translation-group syncs its children from its own first update, which runs before theirs, so reading
   * `values` alone would see it empty and overwrite the value the server rendered.
   */
  private pendingValues(): Record<string, string> {
    if (Object.keys(this.values).length > 0) return this.values;
    try {
      return JSON.parse(this.value || '{}') as Record<string, string>;
    } catch {
      return this.values;
    }
  }

  protected firstUpdated() {
    this.formControlController.updateValidity();
  }

  willUpdate(changedProperties: PropertyValues) {
    let processValue = changedProperties.has('value');
    let processValues = changedProperties.has('values');

    if (processValue && processValues) {
      const isValueDefault = this.value === '{"en":""}';
      const isValuesEmpty = Object.keys(this.values).length === 0;

      if (isValueDefault && !isValuesEmpty) {
        processValue = false;
      } else if (!isValueDefault && isValuesEmpty) {
        processValues = false;
      } else if (this.hasAttribute('values') && !this.hasAttribute('value')) {
        processValue = false;
      } else if (this.hasAttribute('value') && !this.hasAttribute('values')) {
        processValues = false;
      }
    }

    if (processValue) {
      try {
        const newValues = JSON.parse(this.value || '{}') as Record<string, string>;
        if (JSON.stringify(newValues) !== JSON.stringify(this.values)) {
          this.values = newValues;
        }
      } catch (e) {
        // no-op
      }
    }

    if (processValues) {
      this.value = JSON.stringify(this.values);

      // Ensure active language is valid, but only when NOT grouped.
      // In grouped mode the parent zn-translation-group manages the active language,
      // so we must not override what it set via setActiveLanguage().
      if (!this.grouped) {
        const isKnown = Object.prototype.hasOwnProperty.call(this.values, this._activeLanguage)
          || Object.prototype.hasOwnProperty.call(this.languages, this._activeLanguage);
        if (!this._activeLanguage || (!isKnown && this._activeLanguage !== 'en')) {
          const keys = Object.keys(this.values);
          if (keys.length > 0) {
            this._activeLanguage = keys[0];
          } else {
            this._activeLanguage = 'en';
          }
        }
      }
    }
  }

  /**
   * The select's own change and input events are stopped here: they describe the language being browsed, not the
   * translation being edited, and a consumer listening on zn-translations reads either as a value change.
   */
  private handleLanguageSelect = (e: Event) => {
    e.stopPropagation();
    const language = (e.target as ZnSelect).value;
    if (typeof language === 'string' && language && language !== this._activeLanguage) {
      this.switchLanguage(language);
    }
  };

  private handleLanguageInput = (e: Event) => {
    e.stopPropagation();
  };

  /** The language shown in the field, without touching `values`. */
  private switchLanguage = (lang: string) => {
    this._activeLanguage = lang;
    this.requestUpdate();
  };

  private handleValueUpdate = (e: CustomEvent) => {
    const target = e.target as (ZnInput | ZnInlineEdit | ZnTextarea);
    if (this._activeLanguage) {
      const newValue: string = target.value as string;
      if (newValue !== this.values[this._activeLanguage]) {
        this.values = {...this.values, [this._activeLanguage]: newValue};
        this.updateValue();
      }
    }
  };

  private updateValue() {
    this.value = JSON.stringify(this.values);
    this.emit('zn-change');
    this.emit('zn-input');
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      // An inline edit commits on Enter itself, and a textarea needs it for the newline.
      if (event.target instanceof ZnInlineEdit || event.target instanceof ZnTextarea) {
        return;
      }

      const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

      if (!hasModifier && !event.defaultPrevented && !event.isComposing) {
        this.formControlController.submit();
      }
    }
  };

  private handleSubmit = () => {
    this.formControlController.submit();
  };

  /** The control the active language's translation is edited through. */
  private renderField(value: string, placeholder: string, isRTL: boolean) {
    const dir = isRTL ? 'rtl' : 'ltr';

    if (this.inlineEdit) {
      return html`
        <zn-inline-edit
          input-type=${this.inputType}
          textarea-rows=${ifDefined(this.textareaRows)}
          .value=${live(value)}
          name="${this.name}"
          placeholder="${placeholder}"
          dir="${dir}"
          ?disabled="${this.disabled}"
          slash-trigger="${this.slashTrigger}"
          slash-heading="${this.slashHeading}"
          slash-preset="${this.slashPreset}"
          slash-recent-key="${this.slashRecentKey}"
          ?slash-hide-keys="${this.slashHideKeys}"
          .slashItems="${this.slashItems}"
          .slashItemsProvider="${this.slashItemsProvider}"
          @zn-change="${this.handleValueUpdate}"
          @zn-input="${this.handleValueUpdate}"
          @zn-submit="${this.handleSubmit}"
        ></zn-inline-edit>`;
    }

    if (this.inputType === 'textarea') {
      return html`
        <zn-textarea
          rows=${ifDefined(this.textareaRows)}
          resize="auto"
          .value=${live(value)}
          name="${this.name}"
          placeholder="${placeholder}"
          dir="${dir}"
          ?disabled="${this.disabled}"
          slash-trigger="${this.slashTrigger}"
          slash-heading="${this.slashHeading}"
          slash-preset="${this.slashPreset}"
          slash-recent-key="${this.slashRecentKey}"
          ?slash-hide-keys="${this.slashHideKeys}"
          .slashItems="${this.slashItems}"
          .slashItemsProvider="${this.slashItemsProvider}"
          @zn-change="${this.handleValueUpdate}"
          @zn-input="${this.handleValueUpdate}"
        ></zn-textarea>`;
    }

    return html`
      <zn-input
        type="${this.inputType === 'number' ? 'number' : 'text'}"
        clearable
        .value=${live(value)}
        name="${this.name}"
        placeholder="${placeholder}"
        dir="${dir}"
        ?disabled="${this.disabled}"
        slash-trigger="${this.slashTrigger}"
        slash-heading="${this.slashHeading}"
        slash-preset="${this.slashPreset}"
        slash-recent-key="${this.slashRecentKey}"
        ?slash-hide-keys="${this.slashHideKeys}"
        .slashItems="${this.slashItems}"
        .slashItemsProvider="${this.slashItemsProvider}"
        @zn-change="${this.handleValueUpdate}"
        @zn-input="${this.handleValueUpdate}"
      ></zn-input>`;
  }

  /** Arabic and Hebrew read right to left, so the field's `dir` follows the language being edited. */
  private isRTLLanguage(languageCode: string): boolean {
    return languageCode.startsWith('ar') || languageCode === 'he' || languageCode === 'iw';
  }

  render() {
    // A value can carry a language `languages` does not list — server-rendered content outliving a config change.
    // Offer those too, or the translation is stranded in the value with no way to reach it.
    const values = this.pendingValues();
    const languageCodes = [
      ...Object.keys(this.languages),
      ...Object.keys(values).filter(code => !Object.prototype.hasOwnProperty.call(this.languages, code))
    ];
    const activeState = this.languageState(this._activeLanguage);

    const currentTranslation = this.values[this._activeLanguage] ?? '';
    const isRTL = this.isRTLLanguage(this._activeLanguage);

    // A blank translation falls back to English at render time, so show that English text as the placeholder rather
    // than leaving the field looking like it has nothing behind it.
    const englishValue = this.pendingValues().en ?? '';
    const placeholder = !currentTranslation && this._activeLanguage !== 'en' && englishValue
      ? englishValue
      : 'Enter translation...';

    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasActionsSlot = this.hasSlotController.test('actions');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;
    const hasMultipleLanguages = languageCodes.length > 1;
    const showActions = !this.grouped && hasActionsSlot;
    const showLanguageSelect = !this.grouped && hasMultipleLanguages;

    return html`
      <div part="form-control"
           class="${classMap({
             'translations': true,
             'translations--grouped': this.grouped,
             'translations--flush': this.flush,
             'form-control': true,
             'form-control--medium': true,
             'form-control--has-label': hasLabel,
             'form-control--has-help-text': hasHelpText,
           })}"
           @keydown="${this.handleKeyDown}">
        <div class="translations__header">
          <label part="form-control-label" class="form-control__label" for="input"
                 aria-hidden=${hasLabel ? 'false' : 'true'}>
            <slot name="label">${this.label}</slot>
          </label>
          ${showActions ? html`
            <div class="translations__actions">
              <slot name="actions"></slot>
            </div>
          ` : nothing}
        </div>

        ${showLanguageSelect ? html`
          <div class="translations__language">
            <zn-select
              class="translations__language-select"
              part="language-select"
              hoist
              ?disabled="${this.disabled}"
              .value="${this._activeLanguage}"
              @zn-change="${this.handleLanguageSelect}"
              @zn-input="${this.handleLanguageInput}">
              <zn-chip slot="suffix" type="${activeState.type}">${activeState.label}</zn-chip>
              ${languageCodes.map(code => {
                const optionState = this.languageState(code);
                return html`
                  <zn-option value="${code}">
                    ${this.languageLabel(code)}
                    <zn-chip slot="suffix" type="${optionState.type}">${optionState.label}</zn-chip>
                  </zn-option>`;
              })}
            </zn-select>
          </div>
        ` : nothing}

        <div part="form-control-input" class="translations__body">
          ${keyed(this._activeLanguage, this.renderField(currentTranslation, placeholder, isRTL))}
        </div>

        ${hasHelpText ? html`
          <div part="form-control-help-text" class="form-control__help-text" aria-hidden="false">
            <slot name="help-text">${this.helpText}</slot>
          </div>
        ` : nothing}
      </div>
    `;
  }
}
