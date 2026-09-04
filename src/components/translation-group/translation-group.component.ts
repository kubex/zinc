import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZnChip from '../chip';
import ZnFormGroup from '../form-group';
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
 * The fields sit in a `zn-form-group`, so the caption, help text and the language select share its label column and
 * the fields line up with every other form group around them. Choosing a language switches every child at once, and
 * each child hides its own select while it is in a group — `grouped` is set on them here.
 *
 * The select is searchable. Each option holds its language code as its value, so typing `de` finds German without the
 * code being on show.
 *
 * Closed, the select carries how many target languages are done — `1/5`. Its options each carry a chip aggregated
 * across the children:
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
 * Extends `zn-panel`, so `caption`, `flush`, `transparent` and the `footer` slot behave as they do there. Nested
 * inside another panel, add `inline` to drop the chrome and keep the fields aligned with the surrounding form.
 *
 * @dependency zn-chip
 * @dependency zn-form-group
 * @dependency zn-option
 * @dependency zn-select
 *
 * @event zn-language-change - Emitted when the active language changes. Detail: `{ language: string }`.
 *
 * @slot - The `zn-translations` fields the select drives.
 * @slot actions - Buttons for the bottom of the panel, on the white body rather than the grey footer. They sit on
 *  the right, as zinc's form action rows do; `align="start"` moves one to the left. Write them in the order they
 *  should be read — the sides are set by CSS ordering, so markup order is what a keyboard follows.
 * @slot footer - Content displayed in the grey panel footer.
 *
 * @csspart base - The component's base wrapper.
 * @csspart form-group - The form group holding the caption, the language select and the fields.
 * @csspart actions - The row of buttons at the bottom of the body.
 * @csspart language-field - The select that chooses the language every child is editing, in the group's chip slot.
 * @csspart language-select - The select itself.
 */
export default class ZnTranslationGroup extends ZnPanel {
  static styles: CSSResultGroup = [ZnPanel.styles, unsafeCSS(styles)];
  static dependencies = {
    'zn-chip': ZnChip,
    'zn-form-group': ZnFormGroup,
    'zn-option': ZnOption,
    'zn-select': ZnSelect
  };

  private readonly _slotController = new HasSlotController(this, 'actions', 'footer');

  /** The form group's label. An alias for the inherited `caption`, which wins where both are set. */
  @property() label = '';

  /** Sits under the label, above the language select, as help text does in any other form group. */
  @property({attribute: 'help-text'}) helpText = '';

  /**
   * Drops the panel chrome — border, background and padding — so the group reads as a section of the surrounding form
   * rather than a panel of its own. For groups nested inside another panel, where the fields would otherwise sit
   * indented behind a second border.
   */
  @property({type: Boolean, reflect: true}) inline = false;

  /**
   * The select's accessible name. Not shown — the caption is what names the section on screen — but read out by a
   * screen reader, which has nothing else to go on once the visible label is gone.
   */
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

  private _form: HTMLFormElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._form = this.closest('form');
    this._form?.addEventListener('reset', this.handleFormReset);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._form?.removeEventListener('reset', this.handleFormReset);
    this._form = null;
  }

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

  /** The configured name, or the code where `languages` does not name the language. */
  private displayName(language: string): string {
    return this.languages[language] ?? language.toUpperCase();
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

  /**
   * The children restore their own values on the form's reset event without announcing it, and the chips and the
   * count are read off them — so re-read once every listener on that event has run.
   */
  private handleFormReset = () => {
    requestAnimationFrame(() => this.requestUpdate());
  };

  render() {
    const hasActionsSlot = this._slotController.test('actions');
    const hasFooterSlot = this._slotController.test('footer');
    const caption = this.caption || this.label;

    // A child's value can carry a language `languages` does not list — server-rendered content outliving a config
    // change. Offer those too, or the translation is stranded in the value with no way to reach it.
    const extra = new Set<string>();
    this.getAllTranslations().forEach(child => child.getValueLanguages()
      .filter(code => !Object.prototype.hasOwnProperty.call(this.languages, code))
      .forEach(code => extra.add(code)));
    const languageCodes = [...Object.keys(this.languages), ...extra];
    const hasMultipleLanguages = languageCodes.length > 1;

    // English is the source every other language falls back to, so it is not itself one of the translations counted.
    const targets = languageCodes.filter(code => code !== 'en');
    const translated = targets.filter(code => this.languageState(code).type === 'success').length;
    // Closed, the select answers "how much is left to do" rather than the state of the one language on show — that
    // is what the options are for.
    const summary = {
      label: `${translated}/${targets.length}`,
      type: translated === targets.length ? 'success' : translated > 0 ? 'warning' : 'error'
    };

    return html`
      <div part="base" class="${classMap({
        panel: true,
        'panel--flush': this.flush || this.inline,
        'panel--transparent': this.transparent || this.inline,
        'translation-group--inline': this.inline,
        'panel--has-actions': hasActionsSlot,
        'panel--has-footer': hasFooterSlot,
      })}">

        <div class="panel__inner">
          <div class="panel__content">
            <div class="panel__body">
              <zn-form-group
                part="form-group"
                label="${caption}"
                help-text="${this.helpText}">

                ${hasMultipleLanguages ? html`
                  <div slot="chip" class="translation-group__language-field" part="language-field">
                    <zn-select
                      label="${this.languageLabel}"
                      class="translation-group__language-select"
                      part="language-select"
                      hoist
                      search
                      .value="${this._activeLanguage}"
                      @zn-change="${this.handleLanguageSelect}"
                      @zn-input="${this.handleLanguageInput}">
                      <zn-chip slot="suffix" type="${summary.type}">${summary.label}</zn-chip>
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
              </zn-form-group>

              ${hasActionsSlot ? html`
                <div class="translation-group__actions" part="actions">
                  <slot name="actions"></slot>
                  <span class="translation-group__actions-spacer"></span>
                </div>` : nothing}

            </div>
          </div>

          ${hasFooterSlot ? html`
            <slot name="footer" class="panel__footer"></slot>` : null}
        </div>
      </div>`;
  }
}
