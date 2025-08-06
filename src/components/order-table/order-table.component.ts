import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './order-table.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/order-table
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnOrderTable extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Object, reflect: true}) data: Object;

  private isMobile: boolean = false;
  private modifiedData: any = null;

  constructor() {
    super();
    this.modifiedData = this.data;
  }


  connectedCallback() {
    this.isMobile = window.innerWidth < 768;

    window.addEventListener('resize', () => {
      if (window.innerWidth < 768 && !this.isMobile) {
        this.isMobile = true;
        this.requestUpdate();
      } else if (window.innerWidth >= 768 && this.isMobile) {
        this.isMobile = false;
        this.requestUpdate();
      }
    });

    if (this.data === null || this.data === undefined) {
      if (this.childNodes.length > 0 && this.childNodes[0].nodeType === 3) {
        const data: any = this.childNodes[0];
        try {
          this.data = JSON.parse(data.textContent);
        } catch (e) { /* empty */
        }
      }
    }

    super.connectedCallback();
  }

  render() {
    this.modifiedData = this.data;
    if (this.isMobile) {
      return html`
        <div class="mobile-table">
          ${this.getMobileRows()}
        </div>
        ${this.getSummary()}
      `;
    }

    return html`
      <div class="table">
        ${this.getHeaders()}
        ${this.getRows()}
      </div>
      ${this.getSummary()}
    `;
  }

  getHeaders() {
    const data = this.modifiedData;
    const headers = [];

    if (data && data['headers']) {
      for (const header of data['headers']) {
        headers.push(header);
      }
    }

    return html`
      <div class="header">
        ${headers.map(header => html`
          <div class="header-item">
            ${header}
          </div>
        `)}
      </div>
    `;
  }

  getRows() {
    const data = this.modifiedData;
    const rows = [];


    if (data && data['items']) {
      for (const item of data['items']) {
        const caption = this.getCaption(item);
        const rowData = item['data'];

        rows.push(html`
          <div class="row">
            ${caption}
            ${rowData.map((row: any) => html`
              <div class="row-item">
                <div class="content">
                  ${row}
                </div>
              </div>
            `)}
          </div>
          ${this.getSubItems(item)}
        `);
      }
    }

    return html`
      <div class="rows">
        ${rows}
      </div>
    `;
  }

  getCaption(item: any) {
    const caption = item['caption'];
    const summary = item['summary'];

    return html`
      <div class="row-item row-caption">
        <div class="content">
          ${caption ? html`
            <div>${caption}</div>` : ''}
          ${summary ? html`
            <div>${summary}</div>` : ''}
        </div>
      </div>
    `;
  }

  getSubItems(item: any) {
    const subItems = item['sub'];

    const rows: any = [];
    if (subItems) {
      subItems.forEach((subitem: any) => {
        const caption = this.getCaption(subitem);
        const rowData = subitem['data'];

        rows.push(html`
          <div class="sub-row">
            ${caption}
            ${rowData.map((row: any) => html`
              <div class="row-item">
                <div class="content">
                  ${row}
                </div>
              </div>
            `)}
          </div>
        `);
      });
    }

    return html`
      <div class="sub">
        ${rows}
      </div>
    `;
  }

  getSummary() {
    let tax = html``;
    if (this.modifiedData && this.modifiedData['tax']) {
      tax = html`
        <div class="summary-item">
          <div class="summary-item-title">Tax</div>
          <div class="summary-item-value">${this.modifiedData['tax']}</div>
        </div>`;
    }

    let discount = html``;
    if (this.modifiedData && this.modifiedData['discount']) {
      discount = html`
        <div class="summary-item">
          <div class="summary-item-title">Discount</div>
          <div class="summary-item-value">${this.modifiedData['discount']}</div>
        </div>`;
    }

    let total = html``;
    if (this.modifiedData && this.modifiedData['total']) {
      total = html`
        <div class="summary-item">
          <div class="summary-item-title">Grand Total</div>
          <div class="summary-item-value">${this.modifiedData['total']}</div>
        </div>`;
    }


    let paid = html``;
    if (this.modifiedData && this.modifiedData['paid']) {
      paid = html`
        <div class="summary-item">
          <div class="summary-item-title">Amount Paid</div>
          <div class="summary-item-value">${this.modifiedData['paid']}</div>
        </div>`;
    }


    let remaining = html``;
    if (this.modifiedData && this.modifiedData['remaining']) {
      remaining = html`
        <div class="summary-item">
          <div class="summary-item-title">Amount Outstanding</div>
          <div class="summary-item-value">${this.modifiedData['remaining']}</div>
        </div>`;
    }

    return html`
      <div class="summary">
        ${tax}
        <div class="summary-divide"></div>
        ${discount}
        ${total}
        ${paid}
        ${remaining}
      </div>
    `;
  }

  private getMobileRows() {
    const data = this.modifiedData;
    const rows = [];

    if (data && data['items']) {
      for (const item of data['items']) {
        const caption = this.getMobileCaption(item, null);
        const rowData = item['data'];

        rows.push(html`
          <div class="row">
            ${caption}
            <div class="row-item">
              ${rowData.map((row: any) => {
                if (row === '-') return;
                return html`
                  <span>${row}</span>
                `;
              })}
            </div>
          </div>
          ${this.getMobileSubItems(item)}
        `);
      }
    }

    return html`
      <div class="rows">
        ${rows}
      </div>
    `;
  }

  getMobileSubItems(item: any) {
    const subitems = item['sub'];
    const rows: any[] = [];
    if (subitems) {
      subitems.forEach((subitem: any) => {
        const caption = this.getMobileCaption(subitem, subitem['data'][0]);
        const rowData = subitem['data'];

        rows.push(html`
          <div class="sub-row">
            ${caption}
            <div class="row-item">
              ${rowData.map((row: any, index: any) => index === 0 ? '' : html`
                <span>${row}</span>`
              )}
            </div>
          </div>
        `);
      });
    }

    return html`
      <div class="sub">
        ${rows}
      </div>
    `;
  }

  getMobileCaption(item: any, extra: any) {
    const caption = item['caption'];
    const summary = item['summary'];

    return html`
      <div class="row-item row-caption">
        <div class="content">
          ${caption ? html`
            <div>${caption}</div>` : ''}
          ${summary ? html`
            <div>${summary}</div>` : ''}
          ${extra ? html`
            <div>${extra}</div>` : ''}
        </div>
      </div>
    `;
  }
}
