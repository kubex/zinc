import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './pagination.scss';

/**
 * @summary Pagination component for navigating through pages of content.
 * @documentation https://zinc.style/components/pagination
 * @status experimental
 * @since 1.0
 */
export default class ZnPagination extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'limit', type: Number, reflect: true}) limit: number = 10; // Per-page limit
  @property({attribute: 'total', type: Number, reflect: true}) total: number = 0; // Total number of items
  @property({attribute: 'page', type: Number, reflect: true}) page: number = 1; // Current page
  @property({attribute: 'uri', type: String, reflect: true}) uri: string = ""; // Uri to call replacing #page# with page number

  protected _createLink(page: number): string {
    if (page === this.page) return "";
    return this.uri.replace('#page#', page.toString());
  }

  protected _calculatePages() {
    return Math.ceil(this.total / this.limit);
  }

  protected render() {
    const numberOfPages = this._calculatePages();

    const prevButton = html`
      <div class="pagination__item">
        ${this.page > 1 ? html`
          <a class="pagination__button pagination__button--prev" href="${this._createLink(this.page - 1)}">
            Previous
          </a>` : html`
          <span class="pagination__button pagination__button--prev pagination__button--disabled">
            Previous
          </span>`}
      </div>`;

    const nextButton = html`
      <div class="pagination__item">
        ${this.page < numberOfPages ? html`
          <a class="pagination__button pagination__button--next" href="${this._createLink(this.page + 1)}">
            Next
          </a>` : html`
          <span class="pagination__button pagination__button--next pagination__button--disabled">
            Next
          </span>`}
      </div>`;

    let buttonStart = Math.max(1, this.page - 2);
    let buttonEnd = Math.min(numberOfPages, this.page + 2);

    if (buttonStart === 1) {
      buttonEnd = Math.min(numberOfPages, 5);
    }

    if (buttonEnd === numberOfPages) {
      buttonStart = Math.max(1, numberOfPages - 4);
    }


    const pageButtons = [];

    for (let i = buttonStart; i <= buttonEnd; i++) {
      pageButtons.push(html`
        <div class="pagination__item">
          ${this.page !== i ? html`
            <a class="pagination__button pagination__button--page" href="${this._createLink(i)}">
              ${i}
            </a> ` : html`
            <span class="pagination__button pagination__button--page pagination__button--active">
              ${i}
            </span>`}
        </div>`);
    }


    return html`
      <div class="pagination">
        ${prevButton}
        ${pageButtons}
        ${nextButton}
      </div>
    `;
  }
}
