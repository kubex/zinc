import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnButtonGroup from '../button-group';
import ZnDropdown from '../dropdown';
import ZnMenu from '../menu';
import type {ZnMenuSelectEvent} from '../../events/zn-menu-select';
import type ZnTranslations from '../translations/translations.component';

import styles from './translation-group.scss';

/**
 * @summary A panel-styled container that provides a shared language toggle for multiple zn-translations children.
 *
 * @dependency zn-button
 * @dependency zn-button-group
 * @dependency zn-dropdown
 * @dependency zn-menu
 *
 * @event zn-language-change - Emitted when the active language changes. Detail: `{ language: string }`.
 *
 * @slot - Default slot for `<zn-translations>` elements.
 * @slot label - The group label. Alternatively, use the `label` attribute.
 *
 * @csspart base - The component's base wrapper.
 * @csspart header - The header area containing label and language buttons.
 * @csspart translations - The container for slotted translation elements.
 */
export default class ZnTranslationGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-button-group': ZnButtonGroup,
    'zn-dropdown': ZnDropdown,
    'zn-menu': ZnMenu
  };

  private readonly hasSlotController = new HasSlotController(this, 'label');

  /** The group label displayed in the panel header. */
  @property() label = '';

  /** The available languages for the group. */
  @property({type: Object}) languages: Record<string, string> = {
    'en': 'EN'
  };

  /** When true, removes padding from the body area. */
  @property({type: Boolean, reflect: true}) flush = false;

  @state() private _activeLanguage = 'en';

  /** Tracks all language codes that have been activated across children. */
  @state() private _activatedLanguages: string[] = ['en'];

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.syncChildren();
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (changedProperties.has('languages')) {
      this.syncChildLanguages();
    }
  }

  private getAllTranslations(): ZnTranslations[] {
    return [...this.querySelectorAll<ZnTranslations>('zn-translations')];
  }

  /** Sync grouped state, languages, and active language to all children. */
  private syncChildren() {
    const children = this.getAllTranslations();

    // Collect all language codes from children's existing values
    const allLanguageCodes = new Set<string>(this._activatedLanguages);
    children.forEach(child => {
      child.getValueLanguages().forEach(code => allLanguageCodes.add(code));
    });
    this._activatedLanguages = [...allLanguageCodes];

    children.forEach(child => {
      child.grouped = true;
      child.languages = this.languages;
      child.setActiveLanguage(this._activeLanguage);
    });
  }

  private syncChildLanguages() {
    this.getAllTranslations().forEach(child => {
      child.languages = this.languages;
    });
  }

  private handleSlotChange = () => {
    this.syncChildren();
  };

  private handleLanguageClick = (e: MouseEvent) => {
    const button = (e.target as HTMLElement).closest('zn-button') as HTMLElement;
    if (button) {
      const lang = button.getAttribute('data-lang');
      if (lang) {
        this._activeLanguage = lang;
        this.getAllTranslations().forEach(child => child.setActiveLanguage(lang));
        this.emit('zn-language-change', {detail: {language: lang}});
      }
    }
  };

  private handleLanguageAdd = (e: ZnMenuSelectEvent) => {
    const element = e.detail.element as HTMLElement;
    const languageCode = element.getAttribute('data-path');
    if (languageCode) {
      if (!this._activatedLanguages.includes(languageCode)) {
        this._activatedLanguages = [...this._activatedLanguages, languageCode];
      }

      this._activeLanguage = languageCode;

      this.getAllTranslations().forEach(child => {
        child.addLanguageKey(languageCode);
        child.setActiveLanguage(languageCode);
      });

      this.emit('zn-language-change', {detail: {language: languageCode}});
      this.requestUpdate();
    }
  };

  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabel = this.label ? true : hasLabelSlot;

    const availableLanguages = Object.entries(this.languages)
      .filter(([code]) => code !== 'en' && !this._activatedLanguages.includes(code))
      .map(([code, name]) => ({
        title: name,
        type: 'dropdown',
        path: code
      }));

    const visibleTabs = [...this._activatedLanguages];
    if (!visibleTabs.includes('en')) {
      visibleTabs.unshift('en');
    }

    const hasMultipleLanguages = Object.keys(this.languages).length > 1;

    return html`
      <div part="base"
           class="${classMap({
             'translation-group': true,
             'translation-group--flush': this.flush,
           })}">

        <div part="header" class="${classMap({
          'translation-group__header': true,
          'translation-group__header--has-label': hasLabel,
        })}">
          ${hasLabel ? html`
            <label part="form-control-label" class="translation-group__label">
              <slot name="label">${this.label}</slot>
            </label>
          ` : nothing}

          ${hasMultipleLanguages ? html`
            <div class="translation-group__languages" @click="${this.handleLanguageClick}">
              <zn-button-group>
                ${visibleTabs.map(code => html`
                  <zn-button
                    size="x-small"
                    color="default"
                    ?outline="${code !== this._activeLanguage}"
                    data-lang="${code}"
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
                    >+</zn-button>
                    <zn-menu
                      actions="${JSON.stringify(availableLanguages)}"
                      @zn-menu-select="${this.handleLanguageAdd}"
                    ></zn-menu>
                  </zn-dropdown>
                ` : nothing}
              </zn-button-group>
            </div>
          ` : nothing}
        </div>

        <div part="translations" class="translation-group__body">
          <slot @slotchange="${this.handleSlotChange}"></slot>
        </div>
      </div>
    `;
  }
}
