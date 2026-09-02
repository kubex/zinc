import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, state} from 'lit/decorators.js';
import ZnChip from '../chip';
import ZnHeader from '../header';
import ZnOption from '../option';
import ZnPanel from '../panel/panel.component';
import ZnSelect from '../select';
import type ZnTranslations from '../translations/translations.component';

import styles from './translation-group.scss';

/**
 * @summary Puts several zn-translations fields behind one language select, so a whole form's worth of copy is
 *  translated a language at a time.
 * @documentation https://zinc.style/components/translation-group
 * @status experimental
 * @since 1.0
 *
 * The select sits above the fields it drives, at the top of the panel body. Choosing a language switches every child
 * at once, and each child hides its own select while it is in a group — `grouped` is set on them from here.
 *
 * Every language carries a chip aggregated across the children:
 *
 * - `Translated` — every child has a value for it
 * - `Partial` — only some children do
 * - `English` — none do, so all of them fall back to the English text
 *
 * `Empty` replaces the last of those for English itself, which has nothing to fall back to. English is the source
 * rather than a translation, so it is also left out of the `n of m translated` count beside the label.
 *
 * The children own their values; this component only chooses which language is shown and reports on what they hold.
 * It reads them back on every child `zn-change`, so the chips and the count follow an edit as it is typed.
 *
 * Extends `zn-panel`, so `caption`, `icon`, `flush`, `transparent` and the `footer` slot behave as they do there.
 * Nested inside another panel, add `inline` to drop the chrome and keep the fields aligned with the surrounding form.
 *
 * @dependency zn-chip
 * @dependency zn-header
 * @dependency zn-option
 * @dependency zn-select
 *
 * @event zn-language-change - Emitted when the active language changes. Detail: `{ language: string }`.
 *
 * @slot - The `zn-translations` fields the select drives.
 * @slot actions - Actions displayed in the panel header, beside the caption.
 * @slot footer - Content displayed in the panel footer — an auto-translate button, typically.
 *
 * @csspart base - The component's base wrapper.
 * @csspart language-field - The label and select that choose the language every child is editing.
 * @csspart language-select - The language select itself.
 */
export default class ZnTranslationGroup extends ZnPanel {
  static styles: CSSResultGroup = [ZnPanel.styles, unsafeCSS(styles)];
  static dependencies = {
    'zn-chip': ZnChip,
    'zn-header': ZnHeader,
    'zn-option': ZnOption,
    'zn-select': ZnSelect
  };

  private readonly _slotController = new HasSlotController(this, 'actions', 'footer');

  /** The caption shown in the panel header. An alias for the inherited `caption`, which wins where both are set. */
  @property() label = '';

  /**
   * Drops the panel chrome — border, background and padding — so the group reads as a section of the form around it
   * rather than a panel of its own. For groups nested inside another panel, where the fields would otherwise sit
   * indented behind a second border.
   */
  @property({type: Boolean, reflect: true}) inline = false;

  /** The label shown above the language select. The translated count is appended to it. */
  @property({attribute: 'language-label'}) languageLabel = 'Edit Languages';

  /**
   * The languages on offer, as language code to display name — `{"en": "English", "fr": "French"}`. Writing the code
   * as the name (`{"en": "EN"}`) is also accepted. `en` is the language every other one falls back to. Set on every
   * child, so they do not need their own copy.
   */
  @property({type: Object}) languages: Record<string, string> = {
    'en': 'EN'
  };

  /** The language every child is currently editing. */
  @state() private _activeLanguage = 'en';

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

  /** The children the select drives. Read live rather than cached, so markup added later is picked up. */
  private getAllTranslations(): ZnTranslations[] {
    return [...this.querySelectorAll<ZnTranslations>('zn-translations')];
  }

  /** Sync grouped state, languages, and active language to all children. */
  private syncChildren() {
    this.getAllTranslations().forEach(child => {
      child.grouped = true;
      child.languages = this.languages;
      child.setActiveLanguage(this._activeLanguage);
    });
  }

  /**
   * A language is translated once every child carries a value for it, partial while only some do. The chips and the
   * count are read off the children, so a child's edit has to bring the group back round.
   */
  private languageState(language: string): { type: 'success' | 'warning' | 'error'; label: string } {
    const children = this.getAllTranslations();
    const translated = children.filter(child => child.hasTranslation(language)).length;

    if (children.length > 0 && translated === children.length) return {type: 'success', label: 'Translated'};
    if (translated > 0) return {type: 'warning', label: 'Partial'};
    return {type: 'error', label: language === 'en' ? 'Empty' : 'English'};
  }

  /** `English (EN)`, or the code alone where the configured name already is the code. */
  private displayName(language: string): string {
    const name = this.languages[language] ?? language.toUpperCase();
    const code = language.toUpperCase();
    return name.toUpperCase() === code ? name : `${name} (${code})`;
  }

  /** Children take their language list from the group, so a change to `languages` has to reach them. */
  private syncChildLanguages() {
    this.getAllTranslations().forEach(child => {
      child.languages = this.languages;
    });
  }

  private handleSlotChange = () => {
    this.syncChildren();
  };

  /** Moves every child onto `lang` and announces it. Does not touch their values. */
  private switchLanguage(lang: string) {
    this._activeLanguage = lang;
    this.getAllTranslations().forEach(child => child.setActiveLanguage(lang));
    this.emit('zn-language-change', {detail: {language: lang}});
  }

  /**
   * The select's own change and input events describe the language being browsed, not a translation being edited, so
   * they are stopped rather than allowed to reach a consumer listening for a child's value change.
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

  /** A child's edit changes which chips the select shows, and the translated count above it. */
  private handleChildChange = () => {
    this.requestUpdate();
  };

  render() {
    const hasActionSlot = this._slotController.test('actions');
    const hasFooterSlot = this._slotController.test('footer');
    const headerCaption = this.caption || this.label;

    // A child's value can carry a language `languages` does not list — server-rendered content outliving a config
    // change. Offer those too, or the translation is stranded in the value with no way to reach it.
    const extra = new Set<string>();
    this.getAllTranslations().forEach(child => child.getValueLanguages()
      .filter(code => !Object.prototype.hasOwnProperty.call(this.languages, code))
      .forEach(code => extra.add(code)));
    const languageCodes = [...Object.keys(this.languages), ...extra];
    const hasMultipleLanguages = languageCodes.length > 1;
    const hasHeader = Boolean(headerCaption) || hasActionSlot;

    // English is the source every other language falls back to, so it is not itself one of the translations counted.
    const targets = languageCodes.filter(code => code !== 'en');
    const translated = targets.filter(code => this.languageState(code).type === 'success').length;
    const activeState = this.languageState(this._activeLanguage);

    return html`
      <div class="${classMap({
        panel: true,
        'panel--flush': this.flush || this.inline,
        'panel--transparent': this.transparent || this.inline,
        'translation-group--inline': this.inline,
        'panel--has-header': hasHeader,
        'panel--has-actions': hasActionSlot,
        'panel--has-footer': hasFooterSlot,
      })}">

        <div class="panel__inner">
          ${hasHeader ? html`
            <zn-header class="panel__header"
                       caption="${ifDefined(headerCaption || undefined)}"
                       transparent>
              ${hasActionSlot ? html`
                <slot name="actions" slot="actions"></slot>` : null}
            </zn-header>` : null}

          <div class="panel__content">
            <div class="panel__body">
              ${hasMultipleLanguages ? html`
                <div class="translation-group__language-field" part="language-field">
                  <label class="translation-group__language-label" for="language">
                    ${this.languageLabel}
                    <span
                      class="translation-group__language-count">(${translated} of ${targets.length} translated)</span>
                  </label>
                  <zn-select
                    id="language"
                    part="language-select"
                    hoist
                    .value="${this._activeLanguage}"
                    @zn-change="${this.handleLanguageSelect}"
                    @zn-input="${this.handleLanguageInput}">
                    <zn-chip slot="suffix" type="${activeState.type}">${activeState.label}</zn-chip>
                    ${languageCodes.map(code => {
                      const optionState = this.languageState(code);
                      return html`
                        <zn-option value="${code}">
                          ${this.displayName(code)}
                          <zn-chip slot="suffix" type="${optionState.type}">${optionState.label}</zn-chip>
                        </zn-option>`;
                    })}
                  </zn-select>
                </div>` : nothing}
              <slot
                @slotchange="${this.handleSlotChange}"
                @zn-change="${this.handleChildChange}"></slot>
            </div>
          </div>

          ${hasFooterSlot ? html`
            <slot name="footer" class="panel__footer"></slot>` : null}
        </div>
      </div>`;
  }
}
