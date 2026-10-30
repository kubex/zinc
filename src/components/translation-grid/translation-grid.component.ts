import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './translation-grid.scss';

export type TranslationStatus = 'source' | 'translated' | 'outdated' | 'missing';

export interface TranslationGridLanguage {
  code: string;
  label: string;
  /** The language's status when there are no `fields`. */
  status?: TranslationStatus;
  /** Where choosing the language goes, such as its translation form. */
  href?: string;
}

export interface TranslationGridCell {
  status: TranslationStatus;
  href?: string;
}

export interface TranslationGridField {
  key: string;
  label: string;
  /** Each language's cell, keyed by language code. */
  cells: Record<string, TranslationGridCell>;
}

const STATUS_LABELS: Record<TranslationStatus, string> = {
  source: 'Source',
  translated: 'Translated',
  outdated: 'Source changed',
  missing: 'Missing',
};

/**
 * @summary Shows how far each language's translation has got, with a column per language to choose and enable it,
 * and optionally a row per translated field.
 * @documentation https://zinc.style/components/translation-grid
 * @status experimental
 * @since 1.0
 *
 * @slot - Help text under the legend.
 * @slot enable-{code} - The control that enables the language with that code, such as a `zn-checkbox` in a form.
 *   The Enable row only shows when at least one is given.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnTranslationGrid extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** The languages, in column order, as a JSON array of `{code, label, status, href}`. */
  @property({type: Array}) languages: TranslationGridLanguage[] = [];

  /** A row per translated field, as a JSON array of `{key, label, cells}`; without it there is one Translation row. */
  @property({type: Array}) fields: TranslationGridField[] = [];

  /** The code of the language being edited. */
  @property({reflect: true}) selected = '';

  /** The key of the field being edited, when there are `fields`. */
  @property({attribute: 'selected-field', reflect: true}) selectedField = '';

  /** Where the language links open, as a console `data-target`; `self` replaces the content they sit in. */
  @property({attribute: 'link-target'}) linkTarget = '';

  /** Names the source in the legend, such as "English changed". */
  @property({attribute: 'source-label'}) sourceLabel = 'English';

  private _statusLabel(status: TranslationStatus) {
    return status === 'outdated' ? `${this.sourceLabel} changed` : STATUS_LABELS[status];
  }

  private _link(href: string | undefined, selected: boolean, content: unknown, block: string, label: string,
                status?: TranslationStatus) {
    const classes = {
      [block]: true,
      [`${block}--${status}`]: !!status,
      [`${block}--selected`]: selected,
    };
    if (!href || status === 'source') {
      return html`<span class=${classMap(classes)} title=${label} aria-label=${label}>${content}</span>`;
    }
    return html`<a class=${classMap(classes)} href=${href} title=${label} aria-label=${label}
                   data-target=${this.linkTarget || nothing}
                   aria-current=${selected ? 'true' : nothing}>${content}</a>`;
  }

  private _cell(language: TranslationGridLanguage, cell: TranslationGridCell | undefined, selected: boolean, row = '') {
    const status = cell?.status ?? 'missing';
    const name = row ? `${row}, ${language.label}` : language.label;
    return html`<td>${this._link(cell?.href, selected, nothing, 'translation-grid__cell',
      `${name}: ${this._statusLabel(status)}`, status)}</td>`;
  }

  private _rows() {
    if (!this.fields.length) {
      return html`
        <tr>
          <th scope="row">Translation</th>
          ${this.languages.map(language => this._cell(language,
            {status: language.status ?? 'missing', href: language.href}, language.code === this.selected))}
        </tr>`;
    }
    return this.fields.map(field => html`
      <tr>
        <th scope="row">${field.label}</th>
        ${this.languages.map(language => this._cell(language, field.cells[language.code],
          field.key === this.selectedField && language.code === this.selected, field.label))}
      </tr>`);
  }

  private _legend(status: TranslationStatus) {
    return html`
      <span class="translation-grid__key">
        <span class="translation-grid__cell translation-grid__cell--${status}"></span>${this._statusLabel(status)}
      </span>`;
  }

  render() {
    return html`
      <div part="base" class="translation-grid">
        <div class="translation-grid__scroll">
          <table class="translation-grid__table">
            <thead>
            <tr>
              <th scope="col">Field</th>
              ${this.languages.map(language => html`
                <th scope="col">
                  ${this._link(language.href, language.code === this.selected,
                    language.code.toUpperCase(), 'translation-grid__code', language.label)}
                </th>`)}
            </tr>
            </thead>
            <tbody>
            ${this.querySelector('[slot^="enable-"]') ? html`
              <tr>
                <th scope="row">Enable</th>
                ${this.languages.map(language => html`
                  <td><div class="translation-grid__slot"><slot name="enable-${language.code}"></slot></div></td>`)}
              </tr>` : nothing}
            ${this._rows()}
            </tbody>
          </table>
        </div>
        <div class="translation-grid__legend">
          ${this._legend('translated')}
          ${this._legend('outdated')}
          ${this._legend('missing')}
        </div>
        <div class="translation-grid__help"><slot></slot></div>
      </div>
    `;
  }
}
