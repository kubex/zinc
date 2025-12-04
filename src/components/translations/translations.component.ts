import {classMap} from 'lit/directives/class-map.js';
import {FormControlController, validValidityState} from '../../internal/form';
import {HasSlotController} from '../../internal/slot';
import {html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnInlineEdit from '../inline-edit';
import ZnInput from '../input';
import ZnNavbar from '../navbar';
import type {PropertyValues} from 'lit';
import type {ZincFormControl} from '../../internal/zinc-element';
import type {ZnMenuSelectEvent} from '../../events/zn-menu-select';

import styles from './translations.scss';

export default class ZnTranslations extends ZincElement implements ZincFormControl {
  static styles = unsafeCSS(styles);
  static dependencies = {
    'zn-navbar': ZnNavbar,
    'zn-input': ZnInput,
    'zn-inline-edit': ZnInlineEdit
  };

  private readonly formControlController: FormControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, 'label');

  @property() name = '';
  @property() value = '{"en":""}';
  @property() label: string = '';
  @property({type: Boolean, reflect: true}) disabled = false;
  @property({type: Boolean, reflect: true}) required = false;

  @property({type: Object}) languages: Record<string, string> = {
    'en': 'English'
  };
  @property({type: Object}) values: Record<string, string> = {};

  @state() private _activeLanguage = '';

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

      // Ensure active language is valid
      if (!this._activeLanguage || !Object.prototype.hasOwnProperty.call(this.values, this._activeLanguage)) {
        const keys = Object.keys(this.values);
        if (keys.length > 0) {
          this._activeLanguage = keys[0];
        } else {
          this._activeLanguage = '';
        }
      }
    }
  }

  private handleLanguageAdd(e: ZnMenuSelectEvent) {
    const element = e.detail.element as HTMLElement;
    const languageCode = element.getAttribute('data-path');
    if (languageCode) {
      // Add new language with empty string
      this.values = {...this.values, [languageCode]: ''};
      this._activeLanguage = languageCode;
      this.updateValue();
    }
  }

  private handleNavbarClick(e: MouseEvent) {
    const path = e.composedPath();
    const li = path.find(el => el instanceof HTMLElement && el.tagName === 'LI' && el.hasAttribute('tab')) as HTMLElement;
    if (li) {
      const tab = li.getAttribute('tab');
      if (tab) {
        this._activeLanguage = tab;
        this.requestUpdate();
      }
    }
  }

  private handleValueUpdate(e: CustomEvent) {
    const target = e.target as (ZnInput | ZnInlineEdit);
    if (this._activeLanguage) {
      const newValue: string = target.value as string;
      if (newValue !== this.values[this._activeLanguage]) {
        this.values = {...this.values, [this._activeLanguage]: newValue};
        this.updateValue();
      }
    }
  }

  private updateValue() {
    this.value = JSON.stringify(this.values);
    this.emit('zn-change');
    this.emit('zn-input');
  }

  render() {
    const availableLanguages = Object.entries(this.languages)
      .filter(([code]) => !Object.prototype.hasOwnProperty.call(this.values, code))
      .map(([code, name]) => ({
        title: name,
        type: 'dropdown',
        path: code
      }));

    const navigation = Object.keys(this.values).map(code => ({
      title: this.languages[code] || code,
      active: code === this._activeLanguage,
      tab: code
    }));

    const currentTranslation = this.values[this._activeLanguage];
    const useInlineEdit = currentTranslation && currentTranslation.length > 0;

    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabel = this.label ? true : hasLabelSlot;

    return html`
      <div part="form-control"
           class="${classMap({
             'translations': true,
             'form-control': true,
             'form-control--medium': true,
             'form-control--has-label': hasLabel,
           })}">
        <label part="form-control-label" class="form-control__label" for="input"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>
        </label>

        <zn-navbar
          .navigation="${navigation}"
          .dropdown="${availableLanguages}"
          @click="${this.handleNavbarClick}"
          @zn-menu-select="${this.handleLanguageAdd}"
          manual-add-items
        ></zn-navbar>
        <div class="input-container">
          ${this._activeLanguage ? html`
            ${useInlineEdit ? html`
              <zn-inline-edit
                .value=${currentTranslation}
                @zn-change="${this.handleValueUpdate}"
                @zn-input="${this.handleValueUpdate}"
              ></zn-inline-edit>
            ` : html`
              <zn-input
                .value="${currentTranslation || ''}"
                placeholder="Enter translation..."
                @zn-change="${this.handleValueUpdate}"
              ></zn-input>
            `}
          ` : ''}
        </div>
      </div>
    `;
  }
}
