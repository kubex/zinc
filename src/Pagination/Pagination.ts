import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc-element";

@customElement('zn-pagination')
export class Pagination extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'limit', type: Number, reflect: true}) limit: number = 10; // Per-page limit
  @property({attribute: 'total', type: Number, reflect: true}) total: number = 0; // Total number of items
  @property({attribute: 'page', type: Number, reflect: true}) page: number = 1; // Current page
  @property({attribute: 'uri', type: String, reflect: true}) uri: string = ""; // Uri to call replacing #page# with page number

  protected _gotoPage(page: number)
  {
    if(page === this.page) return;

    this.dispatchEvent(new CustomEvent('page-change', {detail: {page: page}}));

    // go to url
    const url = this.uri.replace('#page#', page.toString());
    const link = document.createElement('a');
    link.href = url;
    link.click();
  }

  protected _prevPage()
  {
    return this._gotoPage(this.page - 1);
  }

  protected _nextPage()
  {
    return this._gotoPage(this.page + 1);
  }

  protected _calculatePages()
  {
    return Math.ceil(this.total / this.limit);
  }

  protected render()
  {
    const numberOfPages = this._calculatePages();

    const prevButton = html`
      <div class="pagination__item">
        ${this.page > 1 ? html`
          <button class="pagination__button pagination__button--prev" @click="${this._prevPage}">
            Previous
          </button>` : html`
          <button class="pagination__button pagination__button--prev" disabled>
            Previous
          </button>`}
      </div>`;

    const nextButton = html`
      <div class="pagination__item">
        ${this.page < numberOfPages ? html`
          <button class="pagination__button pagination__button--next" @click="${this._nextPage}">
            Next
          </button>` : html`
          <button class="pagination__button pagination__button--next" disabled>
            Next
          </button>`}
      </div>`;

    let buttonStart = Math.max(1, this.page - 2);
    let buttonEnd = Math.min(numberOfPages, this.page + 2);

    if(buttonStart == 1)
    {
      buttonEnd = Math.min(numberOfPages, 5);
    }

    if(buttonEnd == numberOfPages)
    {
      buttonStart = Math.max(1, numberOfPages - 4);
    }


    const pageButtons = [];

    for(let i = buttonStart; i <= buttonEnd; i++)
    {
      pageButtons.push(html`
        <div class="pagination__item">
          <button
            class="pagination__button pagination__button--page ${this.page == i ? 'pagination__button--active' : ''}"
            @click="${() => this._gotoPage(i)}">
            ${i}
          </button>
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


