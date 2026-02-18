import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, state} from 'lit/decorators.js';
import ZnButton from '../button';
import ZnButtonGroup from '../button-group';
import ZnDropdown from '../dropdown';
import ZnHeader from '../header';
import ZnMenu from '../menu';
import ZnPanel from '../panel/panel.component';
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
 * @slot actions - Actions displayed in the panel header alongside language buttons.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnTranslationGroup extends ZnPanel {
  static styles: CSSResultGroup = [ZnPanel.styles, unsafeCSS(styles)];
  static dependencies = {
    'zn-button': ZnButton,
    'zn-button-group': ZnButtonGroup,
    'zn-dropdown': ZnDropdown,
    'zn-header': ZnHeader,
    'zn-menu': ZnMenu
  };

  private readonly _slotController = new HasSlotController(this, 'actions', 'footer');

  /** The group label displayed in the panel header. */
  @property() label = '';

  /** The available languages for the group. */
  @property({type: Object}) languages: Record<string, string> = {
    'en': 'EN'
  };

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
      // Ensure every activated language exists in each child's values.
      // This handles the case where one child has a language that another doesn't.
      for (const code of this._activatedLanguages) {
        child.addLanguageKey(code);
      }
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

  private switchLanguage(lang: string) {
    this._activeLanguage = lang;
    this.getAllTranslations().forEach(child => child.setActiveLanguage(lang));
    this.emit('zn-language-change', {detail: {language: lang}});
  }

  private handleLanguageAdd = (e: ZnMenuSelectEvent) => {
    e.stopPropagation();
    const element = e.detail.element as HTMLElement;
    const languageCode = element.getAttribute('data-path');
    if (languageCode) {
      if (!this._activatedLanguages.includes(languageCode)) {
        this._activatedLanguages = [...this._activatedLanguages, languageCode];
      }

      // Add language key to all children first so the key exists in values
      this.getAllTranslations().forEach(child => child.addLanguageKey(languageCode));
      this.switchLanguage(languageCode);
    }
  };

  render() {
    const hasActionSlot = this._slotController.test('actions');
    const hasFooterSlot = this._slotController.test('footer');
    const headerCaption = this.caption || this.label;

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
    const hasHeader = headerCaption || hasMultipleLanguages || hasActionSlot;

    return html`
      <div class="${classMap({
        panel: true,
        'panel--flush': this.flush,
        'panel--has-header': hasHeader,
        'panel--has-actions': hasMultipleLanguages || hasActionSlot,
        'panel--has-footer': hasFooterSlot,
      })}">

        <div class="panel__inner">
          ${hasHeader ? html`
            <zn-header class="panel__header"
                       caption="${ifDefined(headerCaption || undefined)}"
                       transparent>
              ${hasMultipleLanguages ? html`
                <div slot="actions" class="translation-group__languages">
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
                </div>
              ` : nothing}
              ${hasActionSlot ? html`
                <slot name="actions" slot="actions"></slot>` : null}
            </zn-header>` : null}

          <div class="panel__content">
            <div class="panel__body">
              <slot @slotchange="${this.handleSlotChange}"></slot>
            </div>
          </div>

          ${hasFooterSlot ? html`
            <slot name="footer" class="panel__footer"></slot>` : null}
        </div>
      </div>`;
  }
}
