import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {ifDefined} from "lit/directives/if-defined.js";
import {classMap} from "lit/directives/class-map.js";

import styles from './table.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/table
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
export default class ZnTable extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'fixed-first', type: Boolean, reflect: true}) fixedFirst: boolean = false;
  @property({attribute: 'has-actions', type: Boolean, reflect: true}) hasActions: boolean = false;
  @property({attribute: 'headless', type: Boolean, reflect: true}) headless: boolean = false;
  @property({attribute: 'left-align', type: Boolean, reflect: true}) allLeft: boolean = false;
  @property({attribute: 'data', type: Object, reflect: true}) data: any;
  @property({attribute: 'bool-icons', type: Boolean}) boolIcons: boolean = false;


  private columns: any = [];
  private columnDisplay: any = [];
  private wideColumn: any = [];
  private rows: any = [];


  resizing() {
    // TODO Resizing event
  }

  connectedCallback() {
    if (this.fixedFirst) {
      new ResizeObserver((_) => this.resizing).observe(this.parentElement as Element);
    }

    if (this.data === null || this.data === undefined) {
      if (this.childNodes.length > 0 && this.childNodes[0].nodeType === 3) {
        // merge all nodes into one
        const nodes = this.childNodes;
        let text = '';
        for (const node of nodes) {
          text += node.textContent;
        }

        // remove all \n
        text = text.replace(/\n/g, '');

        try {
          this.data = JSON.parse(text);
          this.innerText = '';
        } catch (e) { /* empty */
          console.error('Error parsing JSON', e);
        }
      }
    }

    if (this.data !== null && this.data !== undefined) {
      if (this.data.hasOwnProperty('header')) {
        this.data['header'].forEach((col: any) => {
          if (typeof col == 'string') {
            col = {name: col};
          }
          this.columns.push(col.hasOwnProperty('name') ? col['name'] : '');
          this.columnDisplay.push(col.hasOwnProperty('display') ? col['display'] : '');
          this.wideColumn.push(col.hasOwnProperty('wide') ? col['wide'] : '');
        });
      }
      if (this.data.hasOwnProperty('items') && this.data['items'] != null) {
        this.rows = this.data['items'];
      }

      if (this.rows.length == 0 && this.columns.length == 0) {
        this.columns.push('');
        for (const row in this.data) {
          for (const column in this.data[row]) {
            const colName = column.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
            if (!this.columns.includes(colName)) {
              this.columns.push(colName);
            }
          }
          this.rows.push({data: Object.values(this.data[row])});
        }
      }
    }

    return super.connectedCallback();
  }

  render() {
    return html`
      <div class="table-wrapper">
        <table class="${classMap({
          'table': true,
          'table--last-right': !this.allLeft,
        })}">
          ${this.tableHead()}
          ${this.tableBody()}
        </table>
      </div>
    `;
  }

  tableHead() {
    if (this.headless) return;

    const headers: any = [];
    this.columns.forEach((col: any, k: number) => {

      if (col == "") {
        return;
      }

      if (col == "_") {
        col = "";
      }

      const minDisplay = this.columnDisplay[k];
      if (k == 0) {
        headers.push(html`
          <th>${col}</th>`);
      } else {
        let cellClass = "";
        if (minDisplay != "" && minDisplay != undefined) {
          cellClass = "hidden " + minDisplay + ":table-cell";
        }

        if (this.wideColumn[k]) {
          cellClass += " wide-column";
        }

        headers.push(html`
          <th class="${cellClass}">${col}</th>`);
      }
    });

    return html`
      <thead>
      <tr>${headers}</tr>
      </thead>`;
  }

  public menuClick(e: any) {
    const menu = e.target.closest('.actions').querySelector('zn-menu');
    menu.style.top = (e.clientY - this.clientTop) + 'px';
    menu.style.left = (e.clientX - this.clientLeft) + 'px';
  }

  tableBody() {
    const rows: any = [];
    this.hasActions = false;
    this.rows.forEach((row: any, _: any) => {
      const rowHtml = [];
      const basicData = !row.hasOwnProperty('caption') && !row.hasOwnProperty('data');

      if (basicData) {
        row["data"] = row;
      }

      const actions = row.hasOwnProperty('actions') ? row['actions'] : [];
      const uri = row.hasOwnProperty('uri') ? row['uri'] : [];
      const target = row.hasOwnProperty('target') ? row['target'] : [];
      let caption = row.hasOwnProperty('caption') ? this.columnContent(row['caption']) : '';
      const summary = row.hasOwnProperty('summary') ? this.columnContent(row['summary']) : '';
      const icon = row.hasOwnProperty('icon') ? row['icon'] : '';
      let iconSize = row.hasOwnProperty('iconSize') ? row['iconSize'] : '';
      const id = row.hasOwnProperty('id') ? row['id'] : '';
      const color = row.hasOwnProperty('color') ? row['color'] : '';

      this.hasActions = this.hasActions || (actions && actions.length > 0);

      if (uri != "") {
        caption = html`<a data-target="${ifDefined(target)}" href="${uri}">${caption}</a>`;
      }

      let iconHtml = html``;
      if (icon != '') {
        iconSize = iconSize ? iconSize : summary == '' ? 20 : 40;
        iconHtml = html`
          <zn-icon size="${iconSize}" src="${icon}"></zn-icon>`;
      }
      let actionsHtml = html`
        <div class="actions"></div>`;
      if (actions && actions.length > 0) {
        actionsHtml = html`
          <div class="actions">
            <zn-dropdown>
              <zn-new-menu actions="${JSON.stringify(actions)}"></zn-new-menu>
              <button slot="trigger">
                <zn-icon src="more_vert"></zn-icon>
              </button>
            </zn-dropdown>
          </div>`;
      }

      if (!basicData && (caption + summary + icon + this.columns[0]) != "") {
        rowHtml.push(html`
          <td class="capcol">
            <div>
              ${actionsHtml} ${iconHtml}
              <div class="capd"><span class="caption">${caption}</span><span class="summary">${summary}</span></div>
            </div>
          </td>`);
      }

      if (row.hasOwnProperty('data') && row['data'] != null) {
        row['data'].forEach((col: any, ck: any) => {
          const minDisplay = this.columnDisplay[ck + 1];
          let cellClass = "";
          if (minDisplay != "" && minDisplay != undefined) {
            cellClass = "hidden " + minDisplay + ":table-cell";
          }
          col = this.columnContent(col);

          rowHtml.push(html`
            <td class="${cellClass}">${typeof col == 'string' ? unsafeHTML(col) : col}</td>`);
        });
      }

      rows.push(html`
        <tr .id="${id}" .color="${color}">${rowHtml}</tr>`);
    });

    return html`
      <tbody>${rows}</tbody>`;
  }

  _handleMenu(e: any) {
    e.target.closest('.actions').querySelector('zn-menu').toggleAttribute('hidden');
  }

  columnContent(col: any) {
    if (typeof col !== 'object' || col === null) {
      if (this.boolIcons && (col.toString() === 'true' || col.toString() === 'false')) {
        console.log('BoolIcons', col);
        return html`
          <zn-icon src="${col ? 'check' : 'close'}" size="16"></zn-icon>`;
      }

      return col;
    }

    if (col.hasOwnProperty('chips')) {
      console.log('Chips', col);
      const colContent = col['chips'].map((chip: any) => {
        return html`
          <zn-chip type="${chip['state']}">${chip['chip']}</zn-chip>`;
      });

      col = html`
        <span>${colContent}</span>`;
    } else if (col.hasOwnProperty('chip')) {
      let chipState = "";
      if (col.hasOwnProperty('state')) {
        chipState = col['state'];
      }
      col = html`
        <zn-chip type="${chipState}">${col['chip']}</zn-chip>`;
    } else if (col.hasOwnProperty('href')) {
      const url = col['href'];
      const text = col.hasOwnProperty('text') ? col['text'] : url;
      const target = col.hasOwnProperty('target') ? col['target'] : '';
      const gaid = col.hasOwnProperty('gaid') ? col['gaid'] : '';
      col = html`
        <a href="${url}" data-target="${target}" gaid=${gaid}>${text}</a>`;
    }

    return col;
  }
}
