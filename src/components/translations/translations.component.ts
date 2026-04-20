import {classMap} from 'lit/directives/class-map.js';
import {FormControlController, validValidityState} from '../../internal/form';
import {HasSlotController} from '../../internal/slot';
import {html, nothing, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {keyed} from 'lit/directives/keyed.js';
import {live} from 'lit/directives/live.js';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnButtonGroup from '../button-group';
import ZnDropdown from '../dropdown';
import ZnInlineEdit from '../inline-edit';
import ZnInput from '../input';
import ZnMenu from '../menu';
import type {PropertyValues} from 'lit';
import type {ZincFormControl} from '../../internal/zinc-element';
import type {ZnMenuSelectEvent} from '../../events/zn-menu-select';

import styles from './translations.scss';

export default class ZnTranslations extends ZincElement implements ZincFormControl {
  static styles = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-button-group': ZnButtonGroup,
    'zn-dropdown': ZnDropdown,
    'zn-inline-edit': ZnInlineEdit,
    'zn-input': ZnInput,
    'zn-menu': ZnMenu
  };

  private readonly formControlController: FormControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, 'label', 'expand');

  @property() name = '';
  @property() value = '{"en":""}';
  @property() label: string = '';
  @property({type: Boolean, reflect: true}) disabled = false;
  @property({type: Boolean, reflect: true}) required = false;
  @property({type: Boolean, reflect: true}) flush = false;
  @property({attribute: "input-type"}) inputType: 'select' | 'text' | 'number' | 'textarea' = 'text';
  @property({attribute: "textarea-rows", type: Number}) textareaRows: number | undefined;

  /** When true, hides the individual language navbar and defers language control to a parent zn-translation-group. */
  @property({type: Boolean, reflect: true}) grouped = false;

  @property({type: Object}) languages: Record<string, string> = {
    'en': 'EN'
  };
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

  /** Sets the active language externally. Used by zn-translation-group. */
  public setActiveLanguage(language: string) {
    this.addLanguageKey(language);
    this._activeLanguage = language;
    this.requestUpdate();
  }

  /** Returns the currently active language. */
  public getActiveLanguage(): string {
    return this._activeLanguage;
  }

  /** Adds a language key to this component's values if not already present. Used by zn-translation-group. */
  public addLanguageKey(languageCode: string) {
    if (!Object.prototype.hasOwnProperty.call(this.values, languageCode)) {
      this.values = {...this.values, [languageCode]: ''};
      this.updateValue();
    }
  }

  /** Returns all language codes that have values. */
  public getValueLanguages(): string[] {
    return Object.keys(this.values);
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
        if (!this._activeLanguage || (!Object.prototype.hasOwnProperty.call(this.values, this._activeLanguage) && this._activeLanguage !== 'en')) {
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

  private handleLanguageAdd = (e: ZnMenuSelectEvent) => {
    e.stopPropagation();
    const element = e.detail.element as HTMLElement;
    const languageCode = element.getAttribute('data-path');
    if (languageCode) {
      // Add new language with empty string
      this.values = {...this.values, [languageCode]: ''};
      this._activeLanguage = languageCode;
      this.updateValue();
    }
  };

  private switchLanguage = (lang: string) => {
    this._activeLanguage = lang;
    this.requestUpdate();
  };

  private handleValueUpdate = (e: CustomEvent) => {
    const target = e.target as (ZnInput | ZnInlineEdit);
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
      if (event.target instanceof ZnInlineEdit) {
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

  private isRTLLanguage(languageCode: string): boolean {
    // Check if language is Arabic or Hebrew (including variants)
    return languageCode.startsWith('ar') || languageCode === 'he' || languageCode === 'iw';
  }

  render() {
    const availableLanguages = Object.entries(this.languages)
      .filter(([code]) => code !== 'en' && !Object.prototype.hasOwnProperty.call(this.values, code))
      .map(([code, name]) => ({
        title: name,
        type: 'dropdown',
        path: code
      }));

    const visibleTabs = Object.keys(this.values);
    if (!visibleTabs.includes('en')) {
      visibleTabs.unshift('en');
    }

    const currentTranslation = this.values[this._activeLanguage] ?? '';
    const isRTL = this.isRTLLanguage(this._activeLanguage);

    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasExpandSlot = this.hasSlotController.test('expand');
    const hasMultipleLanguages = Object.keys(this.languages).length > 1;
    const showActions = !this.grouped && (hasMultipleLanguages || hasExpandSlot);

    return html`
      <div part="form-control"
           class="${classMap({
             'translations': true,
             'translations--grouped': this.grouped,
             'translations--flush': this.flush,
             'form-control': true,
             'form-control--medium': true,
             'form-control--has-label': hasLabel,
           })}"
           @keydown="${this.handleKeyDown}">
        <div class="translations__header">
          <label part="form-control-label" class="form-control__label" for="input"
                 aria-hidden=${hasLabel ? 'false' : 'true'}>
            <slot name="label">${this.label}</slot>
          </label>
          ${showActions ? html`
            <div class="translations__actions">
              ${hasExpandSlot ? html`<slot name="expand"></slot>` : nothing}
              ${hasMultipleLanguages ? html`
                <zn-button-group>
                  ${visibleTabs.map(code => html`
                    <zn-button
                      size="x-small"
                      color="default"
                      ?outline="${code !== this._activeLanguage}"
                      @click="${() => this.switchLanguage(code)}"
                    >${code.toUpperCase()}
                    </zn-button>
                  `)}
                  ${availableLanguages.length > 0 ? html`
                    <zn-dropdown placement="bottom-end">
                      <zn-button
                        slot="trigger"
                        size="x-small"
                        color="default"
                        outline
                      >+
                      </zn-button>
                      <zn-menu
                        .actions=${availableLanguages}
                        @zn-menu-select="${this.handleLanguageAdd}"
                      ></zn-menu>
                    </zn-dropdown>
                  ` : nothing}
                </zn-button-group>
              ` : nothing}
            </div>
          ` : nothing}
        </div>

        <div part="form-control-input" class="translations__body">
          ${keyed(this._activeLanguage, html`
            <zn-inline-edit
              input-type=${this.inputType}
              textarea-rows=${ifDefined(this.textareaRows)}
              .value=${live(currentTranslation)}
              name="${this.name}"
              placeholder="Enter translation..."
              dir="${isRTL ? 'rtl' : 'ltr'}"
              @zn-change="${this.handleValueUpdate}"
              @zn-input="${this.handleValueUpdate}"
              @zn-submit="${this.handleSubmit}"
            ></zn-inline-edit>
          `)}
        </div>
      </div>
    `;
  }
}
