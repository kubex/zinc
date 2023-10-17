import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-order-table')
export class OrderTable extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: Object, reflect: true}) data: Object;

  private isMobile = false;
  private modifiedData = null;


  connectedCallback()
  {
    super.connectedCallback();
    this.isMobile = window.innerWidth < 768;

    window.addEventListener('resize', () =>
    {
      if(window.innerWidth < 768 && !this.isMobile)
      {
        this.isMobile = true;
        this.requestUpdate();
      }
      else if(window.innerWidth >= 768 && this.isMobile)
      {
        this.isMobile = false;
        this.requestUpdate();
      }
    });
  }

  render()
  {
    this.modifiedData = this.data;

    if(this.isMobile)
    {
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

  getHeaders()
  {
    const data = this.modifiedData;
    const headers = [];

    if(data && data['headers'])
    {
      for(const header of data['headers'])
      {
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

  getRows()
  {
    const data = this.modifiedData;
    const rows = [];


    if(data && data['items'])
    {
      for(const item of data['items'])
      {
        const caption = this.getCaption(item);
        const rowData = item['data'];

        rows.push(html`
          <div class="row">
            ${caption}
            ${rowData.map(row => html`
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

  getCaption(item)
  {
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

  getSubItems(item)
  {
    const subItems = item['sub'];

    const rows = [];
    if(subItems)
    {
      subItems.forEach(subitem =>
      {
        const caption = this.getCaption(subitem);
        const rowData = subitem['data'];

        rows.push(html`
          <div class="sub-row">
            ${caption}
            ${rowData.map(row => html`
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

  getSummary()
  {
    console.log(this.modifiedData);
    return html`
      <div class="summary">
        <div class="summary-item">
          <div class="summary-item-title">Tax</div>
          <div class="summary-item-value">${this.modifiedData['Tax']}</div>
        </div>
        <div class="summary-divide"></div>
        <div class="summary-item">
          <div class="summary-item-title">Grand Total</div>
          <div class="summary-item-value">${this.modifiedData['Grand Total']}</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-title">Paid</div>
          <div class="summary-item-value">${this.modifiedData['Paid']}</div>
        </div>

        <div class="summary-item">
          <div class="summary-item-title">Remaining Balance</div>
          <div class="summary-item-value">${this.modifiedData['Remaining Balance']}</div>
        </div>

      </div>
    `;
  }

  private getMobileRows()
  {
    const data = this.modifiedData;
    const rows = [];

    if(data && data['items'])
    {
      for(const item of data['items'])
      {
        const caption = this.getMobileCaption(item, null);
        const rowData = item['data'];

        rows.push(html`
          <div class="row">
            ${caption}
            <div class="row-item">
              ${rowData.map(row =>
              {
                if(row === '-') return;
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

  getMobileSubItems(item)
  {
    const subitems = item['sub'];

    const rows = [];
    if(subitems)
    {
      subitems.forEach(subitem =>
      {
        const caption = this.getMobileCaption(subitem, subitem['data'][0]);
        const rowData = subitem['data'];

        rows.push(html`
          <div class="sub-row">
            ${caption}
            <div class="row-item">
              ${rowData.map((row, index) => index === 0 ? '' : html`
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

  getMobileCaption(item, extra)
  {
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


