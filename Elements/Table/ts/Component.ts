import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-table')
export class ZincTable extends ZincElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'headless', type: Boolean, reflect: true})
    private headless: boolean = false
    @property({attribute: 'selectable', type: Boolean, reflect: true})
    private selectable: boolean = false
    @property({attribute: 'borders', type: Boolean, reflect: true})
    private borders: boolean = false
    @property({attribute: 'cborders', type: Boolean, reflect: true})
    private cborders: boolean = false
    @property({attribute: 'data', type: Object, reflect: true})
    private data: Object

    private columns = [];
    private columnDisplay = [];
    private rows = [];

    connectedCallback() {
        if (this.data === null || this.data === undefined) {
            if (this.childNodes.length > 0 && this.childNodes[0].nodeType === 3) {
                let data = this.childNodes[0];
                try {
                    this.data = JSON.parse(data.textContent);
                } catch (e) {
                }
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

        let headers = []
        this.columns.forEach((col, k) => {
            let minDisplay = this.columnDisplay[k];
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
        let rows = []


        this.rows.forEach((row, rk) => {
            let rowHtml = []

            let caption = row.hasOwnProperty('caption') ? row['caption'] : '';
            let summary = row.hasOwnProperty('summary') ? row['summary'] : '';
            let icon = row.hasOwnProperty('icon') ? row['icon'] : '';

            rowHtml.push(html`
              <td>
                <zn-icon rounded src="${icon}"></zn-icon>
                <div><span class="caption">${caption}</span><span class="summary">${summary}</span></div>
              </td>`)

            if (row.hasOwnProperty('data')) {
                row['data'].forEach((col, ck) => {
                    let minDisplay = this.columnDisplay[ck + 1];
                    let cellClass = ""
                    if (minDisplay != "") {
                        cellClass = "hidden " + minDisplay + ":table-cell"
                    }
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
}