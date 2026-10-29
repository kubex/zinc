import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './translation-grid.scss';

export type TranslationStatus = 'source' | 'translated' | 'outdated' | 'missing';

export interface TranslationGridLanguage {
  code: string;
  label: string;
  status: TranslationStatus;
  /** Where choosing the language goes, such as its translation form. */
  href?: string;
}

const STATUS_LABELS: Record<TranslationStatus, string> = {
  source: 'Source',
  translated: 'Translated',
  outdated: 'Source changed',
  missing: 'Missing',
};

/**
 * @summary Shows how far each language's translation has got, with a column per language to choose and enable it.
 * @documentation https://zinc.style/components/translation-grid
 * @status experimental
 * @since 1.0
 *
 * @slot - Help text under the legend.
 * @slot enable-{code} - The control that enables the language with that code, such as a `zn-checkbox` in a form.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnTranslationGrid extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** The languages, in column order, as a JSON array of `{code, label, status, href}`. */
  @property({type: Array}) languages: TranslationGridLanguage[] = [];

  /** The code of the language being edited. */
  @property({reflect: true}) selected = '';

  /** Where the language links open, as a console `data-target`; `self` replaces the content they sit in. */
  @property({attribute: 'link-target'}) linkTarget = '';

  /** Names the source in the legend, such as "English changed". */
  @property({attribute: 'source-label'}) sourceLabel = 'English';

  private _statusLabel(status: TranslationStatus) {
    return status === 'outdated' ? `${this.sourceLabel} changed` : STATUS_LABELS[status];
  }

  private _link(language: TranslationGridLanguage, content: unknown, block: string, label: string, modifier = '') {
    const classes = {
      [block]: true,
      [`${block}--${modifier}`]: !!modifier,
      [`${block}--selected`]: language.code === this.selected,
    };
    if (!language.href || language.status === 'source') {
      return html`<span class=${classMap(classes)} title=${label} aria-label=${label}>${content}</span>`;
    }
    return html`<a class=${classMap(classes)} href=${language.href} title=${label} aria-label=${label}
                   data-target=${this.linkTarget || nothing}
                   aria-current=${language.code === this.selected ? 'true' : nothing}>${content}</a>`;
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
                  ${this._link(language, language.code.toUpperCase(), 'translation-grid__code', language.label)}
                </th>`)}
            </tr>
            </thead>
            <tbody>
            <tr>
              <th scope="row">Enable</th>
              ${this.languages.map(language => html`
                <td><div class="translation-grid__slot"><slot name="enable-${language.code}"></slot></div></td>`)}
            </tr>
            <tr>
              <th scope="row">Translation</th>
              ${this.languages.map(language => html`
                <td>
                  ${this._link(language, nothing, 'translation-grid__cell',
                    `${language.label}: ${this._statusLabel(language.status)}`, language.status)}
                </td>`)}
            </tr>
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
