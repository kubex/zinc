import { classMap } from 'lit/directives/class-map.js';
import { type CSSResultGroup, html, nothing, unsafeCSS } from 'lit';
import { HasSlotController } from '../../internal/slot';
import { property, state } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnNavbar from '../navbar';
import type { PropertyValues } from 'lit';
import type ZnTranslations from '../translations/translations.component';
import type { ZnMenuSelectEvent } from '../../events/zn-menu-select';
import type { ZnSelectEvent } from '../../events/zn-select';

import styles from './translation-group.scss';

/**
 * @summary A container that provides a shared language toggle for multiple zn-translations children.
 *
 * @dependency zn-navbar
 *
 * @event zn-language-change - Emitted when the active language changes. Detail: `{ language: string }`.
 *
 * @slot - Default slot for `<zn-translations>` elements.
 * @slot label - The group label. Alternatively, use the `label` attribute.
 */
export default class ZnTranslationGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-navbar': ZnNavbar
  };

  private readonly hasSlotController = new HasSlotController(this, 'label');

  /** The group label displayed above the language navbar. */
  @property() label = '';

  /** The available languages for the group. */
  @property({ type: Object }) languages: Record<string, string> = {
    'en': 'EN'
  };

  /** When true, applies flush styling to the navbar. */
  @property({ type: Boolean, reflect: true }) flush = false;

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

  private handleNavbarClick = (e: ZnSelectEvent) => {
    e.stopPropagation();
    const li = e.detail.item as HTMLElement;
    if (li) {
      const tab = li.getAttribute('tab') || li.getAttribute('data-tab');
      if (tab) {
        this._activeLanguage = tab;
        this.getAllTranslations().forEach(child => child.setActiveLanguage(tab));
        this.emit('zn-language-change', { detail: { language: tab } });
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

      this.emit('zn-language-change', { detail: { language: languageCode } });
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

    const navigation = visibleTabs.map(code => ({
      title: code.toUpperCase(),
      active: code === this._activeLanguage,
      tab: code
    }));

    return html`
      <div part="form-control"
           class="${classMap({
             'translation-group': true,
             'form-control': true,
             'form-control--medium': true,
             'form-control--has-label': hasLabel,
           })}">
        <label part="form-control-label" class="form-control__label"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>
        </label>

        <zn-navbar
          part="navbar"
          .navigation="${navigation}"
          .dropdown="${availableLanguages}"
          @zn-select="${this.handleNavbarClick}"
          @zn-menu-select="${this.handleLanguageAdd}"
          flush=${this.flush || nothing}
          isolated
          manual-add-items
        ></zn-navbar>

        <div part="translations" class="translation-group__children">
          <slot @slotchange="${this.handleSlotChange}"></slot>
        </div>
      </div>
    `;
  }
}
