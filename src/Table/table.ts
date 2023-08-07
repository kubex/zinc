import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

export type InputType = 'text' | 'number';

@customElement('zn-table')
export class Table extends LitElement {
  @property({attribute: 'headless', type: Boolean, reflect: true}) headless: boolean = false
  @property({attribute: 'selectable', type: Boolean, reflect: true}) selectable: boolean = false
  @property({attribute: 'borders', type: Boolean, reflect: true}) borders: boolean = false
  @property({attribute: 'cborders', type: Boolean, reflect: true}) cborders: boolean = false
  @property({attribute: 'data', type: Object, reflect: true}) data: Object

  private columns = [];
  private columnDisplay = [];
  private rows = [];

  static styles = unsafeCSS(styles);

  connectedCallback() {
    if (this.data === null || this.data === undefined) {
      if (this.childNodes.length > 0 && this.childNodes[0].nodeType === 3) {
        const data = this.childNodes[0];
        try {
          this.data = JSON.parse(data.textContent);
        } catch (e) { /* empty */ }
      }
    }

    if (this.data !== null && this.data !== undefined) {
      if (this.data.hasOwnProperty('header')) {
        this.data['header'].forEach((col) => {
          this.columns.push(col.hasOwnProperty('name') ? col['name'] : '');
          this.columnDisplay.push(col.hasOwnProperty('display') ? col['display'] : '')
        })
      }
      if (this.data.hasOwnProperty('items')) {
        this.rows = this.data['items'];
      }
    }

    return super.connectedCallback()
  }

  render() {
    return html`
      <div>
        <table>
          ${this.tableHead()}
          ${this.tableBody()}
        </table>
      </div>
    `;
  }

  tableHead() {
    if (this.headless) return;

    const headers = []
    this.columns.forEach((col, k) => {
      const minDisplay = this.columnDisplay[k];
      if (k == 0) {
        headers.push(html`
          <th>${col}</th>`)
      } else {
        let cellClass = ""
        if (minDisplay != "") {
          cellClass = "hidden " + minDisplay + ":table-cell"
        }
        headers.push(html`
          <th class="${cellClass}">${col}</th>`)
      }
    })

    return html`
      <thead>
      <tr>${headers}</tr>
      </thead>`
  }

  tableBody() {
    const rows = []


    this.rows.forEach((row, rk) => {
      const rowHtml = []

      const caption = row.hasOwnProperty('caption') ? this.columnContent(row['caption']) : '';
      const summary = row.hasOwnProperty('summary') ? this.columnContent(row['summary']) : '';
      const icon = row.hasOwnProperty('icon') ? row['icon'] : '';

      let iconHtml = html``;
      if (icon != '') {
        iconHtml = html`
          <zn-icon round size="40" src="${icon}"></zn-icon>`;
      }

      rowHtml.push(html`
        <td>
          <div>${iconHtml}
            <div><span class="caption">${caption}</span><span class="summary">${summary}</span></div>
          </div>
        </td>`)

      if (row.hasOwnProperty('data') && row['data'] != null) {
        row['data'].forEach((col, ck) => {
          const minDisplay = this.columnDisplay[ck + 1];
          let cellClass = ""
          if (minDisplay != "") {
            cellClass = "hidden " + minDisplay + ":table-cell"
          }
          col = this.columnContent(col);

          rowHtml.push(html`
            <td class="${cellClass}">${col}</td>`)
        })
      }
      rows.push(html`
        <tr>${rowHtml}</tr>`)
    })

    return html`
      <tbody>
      ${rows}
      </tbody>`
  }

  columnContent(col) {
    col = col.trim();
    if (col.length > 4 && col[0] == '{') {
      const colJson = JSON.parse(col);
      if (colJson.hasOwnProperty('chip')) {
        let chipState = "";
        if (colJson.hasOwnProperty('state')) {
          chipState = colJson['state'];
        }
        col = html`
          <zn-chip ${chipState}>${colJson['chip']}</zn-chip>`;
      } else if (colJson.hasOwnProperty('href')) {
        const url = colJson['href'];
        const text = colJson.hasOwnProperty('text') ? colJson['text'] : url;
        const target = colJson.hasOwnProperty('target') ? colJson['target'] : '';
        col = html`
          <a href="${url}" data-target="${target}">${text}</a>`;
      }
    }
    return col
  }
}


