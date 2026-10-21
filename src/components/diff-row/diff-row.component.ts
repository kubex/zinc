import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnChip from '../chip';

import styles from './diff-row.scss';

const changeLabels = { changed: 'Changed', added: 'Added', removed: 'Removed' } as const;

/**
 * @summary One aligned row of a `zn-diff`: the same item in both versions, tinted by how it changed.
 * @documentation https://zinc.style/components/diff-row
 * @status experimental
 * @since 1.1
 *
 * @dependency zn-chip
 *
 * @property {string} caption - The item's name, shown in both columns.
 * @property {string} change - How the item changed: `changed`, `added` or `removed`. Unchanged when empty.
 * @property {boolean} heading - When true, the row is a heading spanning both columns, such as a section name.
 * @property {string} beforePlaceholder - Shown in the left column when the item was added.
 * @property {string} afterPlaceholder - Shown in the right column when the item was removed.
 *
 * @slot before - The item's details in the older version.
 * @slot after - The item's details in the newer version.
 *
 * @csspart row - The row.
 * @csspart before - The left cell.
 * @csspart after - The right cell.
 *
 * @cssproperty --zn-diff-row-border - The line below the row.
 */
export default class ZnDiffRow extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-chip': ZnChip,
  };

  @property() caption = '';
  @property({ reflect: true }) change: '' | 'changed' | 'added' | 'removed' = '';
  @property({ type: Boolean, reflect: true }) heading = false;
  @property({ attribute: 'before-placeholder' }) beforePlaceholder = 'Not in this version';
  @property({ attribute: 'after-placeholder' }) afterPlaceholder = 'Not in this version';

  private renderCell(side: 'before' | 'after') {
    const absent = side === 'before' ? this.change === 'added' : this.change === 'removed';
    if (absent) {
      return html`
        <div class="row__cell row__cell--absent" part="${side}" role="cell">
          ${side === 'before' ? this.beforePlaceholder : this.afterPlaceholder}
        </div>`;
    }
    const label = this.change ? changeLabels[this.change] : '';
    const chipType = this.change === 'added' ? 'success' : this.change === 'removed' ? 'error' : 'info';
    return html`
      <div class="row__cell" part="${side}" role="cell">
        <span class="row__caption">
          ${this.caption}
          ${side === 'after' && label ? html`<zn-chip size="small" type="${chipType}">${label}</zn-chip>` : ''}
        </span>
        <span class="row__details"><slot name="${side}"></slot></span>
      </div>`;
  }

  render() {
    if (this.heading) {
      return html`<div class="row row--heading" part="row" role="row"><span role="rowheader">${this.caption}</span></div>`;
    }
    return html`
      <div class="row" part="row" role="row">
        ${this.renderCell('before')}
        ${this.renderCell('after')}
      </div>`;
  }
}
