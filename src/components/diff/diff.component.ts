import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './diff.scss';

/**
 * @summary A side-by-side comparison of two versions of something, one column each, built from `zn-diff-row`s.
 * @documentation https://zinc.style/components/diff
 * @status experimental
 * @since 1.1
 *
 * @property {string} beforeCaption - The left column's heading, such as the older version.
 * @property {string} beforeDescription - A line under the left heading.
 * @property {string} afterCaption - The right column's heading, such as the newer version.
 * @property {string} afterDescription - A line under the right heading.
 *
 * @slot - The `zn-diff-row`s.
 * @slot before - Inline content after the left heading, such as a status chip.
 * @slot after - Inline content after the right heading, such as a status chip.
 *
 * @csspart base - The table.
 * @csspart head - The sticky row of column headings.
 *
 * @cssproperty --zn-diff-head-background - The heading row's background.
 * @cssproperty --zn-diff-sticky-top - How far from the top of its scroll container the heading row sticks.
 */
export default class ZnDiff extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'before-caption' }) beforeCaption = '';
  @property({ attribute: 'before-description' }) beforeDescription = '';
  @property({ attribute: 'after-caption' }) afterCaption = '';
  @property({ attribute: 'after-description' }) afterDescription = '';

  render() {
    return html`
      <div class="diff" part="base" role="table">
        <div class="diff__head" part="head" role="row">
          <div class="diff__column" role="columnheader">
            <span class="diff__caption">${this.beforeCaption}<slot name="before"></slot></span>
            ${this.beforeDescription ? html`<span class="diff__description">${this.beforeDescription}</span>` : ''}
          </div>
          <div class="diff__column" role="columnheader">
            <span class="diff__caption">${this.afterCaption}<slot name="after"></slot></span>
            ${this.afterDescription ? html`<span class="diff__description">${this.afterDescription}</span>` : ''}
          </div>
        </div>
        <div role="rowgroup">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
