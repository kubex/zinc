import { html, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import styles from './index.scss?inline';
import { ifDefined } from "lit/directives/if-defined.js";
import { ZincElement } from "@/zinc-element";
import { classMap } from "lit/directives/class-map.js";

@customElement('zn-table')
export class Table extends ZincElement
{
  @property({ attribute: 'fixed-first', type: Boolean, reflect: true }) fixedFirst: boolean = false;
  @property({ attribute: 'headless', type: Boolean, reflect: true }) headless: boolean = false;
  @property({ attribute: 'data', type: Object, reflect: true }) data: Object;

  private columns = [];
  private columnDisplay = [];
  private wideColumn = [];
  private rows = [];

  static styles = unsafeCSS(styles);

  resizing()
  {
    // TODO Resizing event
  }

  connectedCallback()
  {
    if(this.fixedFirst)
    {
      new ResizeObserver((entries) => this.resizing).observe(this.parentElement);
    }

    if(this.data === null || this.data === undefined)
    {
      if(this.childNodes.length > 0 && this.childNodes[0].nodeType === 3)
      {
        const data = this.childNodes[0];
        try
        {
          this.data = JSON.parse(data.textContent);
        }
        catch(e)
        { /* empty */
        }
      }
    }

    if(this.data !== null && this.data !== undefined)
    {
      if(this.data.hasOwnProperty('header'))
      {
        this.data['header'].forEach((col) =>
        {
          if(typeof col == 'string')
          {
            col = { name: col };
          }
          this.columns.push(col.hasOwnProperty('name') ? col['name'] : '');
          this.columnDisplay.push(col.hasOwnProperty('display') ? col['display'] : '');
          this.wideColumn.push(col.hasOwnProperty('wide') ? col['wide'] : '');
        });
      }
      if(this.data.hasOwnProperty('items') && this.data['items'] != null)
      {
        this.rows = this.data['items'];
      }

      if(this.rows.length == 0 && this.columns.length == 0)
      {
        this.columns.push('');
        for(const row in this.data)
        {
          for(const column in this.data[row])
          {
            const colName = column.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
            if(!this.columns.includes(colName))
            {
              this.columns.push(colName);
            }
          }
          this.rows.push({ data: Object.values(this.data[row]) });
        }
      }
    }

    return super.connectedCallback();
  }

  render()
  {
    return html`
      <table class="table">
        ${this.tableHead()}
        ${this.tableBody()}
      </table>
    `;
  }

  tableHead()
  {
    if(this.headless) return;

    const headers = [];
    this.columns.forEach((col, k) =>
    {

      if(col == "")
      {
        return;
      }

      if(col == "_")
      {
        col = "";
      }

      const minDisplay = this.columnDisplay[k];
      if(k == 0)
      {
        headers.push(html`
          <th>${col}</th>`);
      }
      else
      {
        let cellClass = "";
        if(minDisplay != "")
        {
          cellClass = "hidden " + minDisplay + ":table-cell";
        }

        headers.push(html`
          <th class="${classMap({ cellClass, 'wide-column': this.wideColumn[k] })}">${col}</th>`);
      }
    });

    return html`
      <thead>
      <tr>${headers}</tr>
      </thead>`;
  }

  tableBody()
  {
    const rows = [];

    this.rows.forEach((row, rk) =>
    {
      const rowHtml = [];
      const basicData = !row.hasOwnProperty('caption') && !row.hasOwnProperty('data');

      if(basicData)
      {
        row["data"] = row;
      }

      const actions = row.hasOwnProperty('actions') ? row['actions'] : [];
      const uri = row.hasOwnProperty('uri') ? row['uri'] : [];
      const target = row.hasOwnProperty('target') ? row['target'] : [];
      let caption = row.hasOwnProperty('caption') ? this.columnContent(row['caption']) : '';
      const summary = row.hasOwnProperty('summary') ? this.columnContent(row['summary']) : '';
      const icon = row.hasOwnProperty('icon') ? row['icon'] : '';

      if(uri != "")
      {
        caption = html`<a data-target="${ifDefined(target)}" href="${uri}">${caption}</a>`;
      }

      let iconHtml = html``;
      if(icon != '')
      {
        const iconSize = summary == '' ? 20 : 40;
        iconHtml = html`
          <zn-icon round size="${iconSize}" src="${icon}"></zn-icon>`;
      }
      let actionsHtml = html``;
      if(actions && actions.length > 0)
      {
        actionsHtml = html`
          <div class="actions">
            <zn-icon src="more_vert" @click="${this._handleMenu}"></zn-icon>
            <zn-menu actions="${JSON.stringify(actions)}" hidden></zn-menu>
          </div>`;
      }

      if(!basicData && (caption + summary + icon + this.columns[0]) != "")
      {
        rowHtml.push(html`
          <td class="capcol">
            <div>
              ${actionsHtml} ${iconHtml}
              <div class="capd"><span class="caption">${caption}</span><span class="summary">${summary}</span></div>
            </div>
          </td>`);
      }

      if(row.hasOwnProperty('data') && row['data'] != null)
      {
        row['data'].forEach((col, ck) =>
        {
          const minDisplay = this.columnDisplay[ck + 1];
          let cellClass = "";
          if(minDisplay != "")
          {
            cellClass = "hidden " + minDisplay + ":table-cell";
          }
          col = this.columnContent(col);

          rowHtml.push(html`
            <td class="${cellClass}">${typeof col == 'string' ? unsafeHTML(col) : col}</td>`);
        });
      }

      rows.push(html`
        <tr>${rowHtml}</tr>`);
    });

    return html`
      <tbody>${rows}</tbody>`;
  }

  _handleMenu(e)
  {
    e.target.closest('.actions').querySelector('zn-menu').toggleAttribute('hidden');
  }

  columnContent(col)
  {
    if(typeof col !== 'object')
    {
      return col;
    }

    if(col.hasOwnProperty('chip'))
    {
      let chipState = "";
      if(col.hasOwnProperty('state'))
      {
        chipState = col['state'];
      }
      col = html`<zn-chip .type="${chipState}">${col['chip']}</zn-chip>`;
    }
    else if(col.hasOwnProperty('href'))
    {
      const url = col['href'];
      const text = col.hasOwnProperty('text') ? col['text'] : url;
      const target = col.hasOwnProperty('target') ? col['target'] : '';
      col = html`
        <a href="${url}" data-target="${target}">${text}</a>`;
    }

    return col;
  }
}


