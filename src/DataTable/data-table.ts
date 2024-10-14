import {ZincElement} from "@/zinc-element";
import {html, TemplateResult, unsafeCSS} from "lit";
import {Task} from "@lit/task";
import {customElement, property} from 'lit/decorators.js';
import {classMap} from "lit/directives/class-map.js";

import '../Icon';

import styles from './index.scss?inline';

type TableData = {
  page: 1,
  per_page: 10,
  total: 100,
  total_pages: 10,
  data: any[];
}

@customElement('zn-data-table')
export class DataTable extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'data-uri'}) dataUri: string;
  @property({type: Boolean, attribute: 'query-as-route-data'}) queryAsRouteData: boolean = false;
  @property({attribute: 'sort-column'}) sortColumn: string = 'id';
  @property({attribute: 'key'}) key: string = 'id';
  @property({attribute: 'sort-direction'}) sortDirection: string = 'asc';
  @property({attribute: 'wide-column'}) wideColumn: string;

  @property({attribute: 'headers', type: Object}) headers = '{}';

  // Data Table Properties
  private itemsPerPage: number = 10;
  private page: number = 1;
  private totalItems: number;
  private totalPages: number;

  private rows: any[] = [];

  private numberOfRowsSelected: number = 0;
  private selectedRows: any[] = [];

  private _dataTask = new Task(this, {
    task: async ([dataUri], {signal}) =>
    {
      let url = dataUri;


      if(this.queryAsRouteData)
      {
        url += `/${this.page}/${this.itemsPerPage}/${this.sortColumn}/${this.sortDirection}`;
      }
      else
      {
        // append query params to the end of url
        const params = new URLSearchParams();
        params.append('page', this.page.toString());
        params.append('per_page', this.itemsPerPage.toString());
        params.append('sort_column', this.sortColumn);
        params.append('sort_direction', this.sortDirection);
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        signal,
        credentials: 'same-origin',
        method: 'get',
        headers: {
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      if(!response.ok) throw new Error(response.statusText);
      return response.json();
    },
    args: () => [this.dataUri]
  });

  render()
  {

    return this._dataTask.render({
      pending: () => html`
        <div>Loading...</div>`,
      complete: (data) => html`
        <div>${this.renderTable(data as TableData)}</div>`,
      error: (error) => html`
        <div>Error: ${error}</div>`
    });
  }

  renderTable(data: TableData)
  {
    this.itemsPerPage = data.per_page;
    this.page = data.page;
    this.totalItems = data.total;
    this.totalPages = data.total_pages;

    if(!data || !data.data || data.data.length === 0)
    {
      return html`
        <div class="table--empty">No data available</div>`;
    }

    // Sort the data into rows
    const keys = Object.entries(this.headers).map(([key, _]) => key);
    this.rows = Object.values(data.data).map((row: any) =>
    {
      return keys.map((header: any) => row[header]);
    });

    // sort the rows by the key
    this.rows = this.rows.sort((a, b) =>
    {
      if(this.sortDirection === 'asc')
      {
        return a[keys.indexOf(this.sortColumn)] > b[keys.indexOf(this.sortColumn)] ? 1 : -1;
      }

      return a[keys.indexOf(this.sortColumn)] < b[keys.indexOf(this.sortColumn)] ? 1 : -1;
    });

    return html`
      <table class=${classMap({
        'table': true,
      })}>
        <thead>
        <tr>
          <th>
            <div><input type="checkbox" @change=${this.selectAll}></div>
          </th>
          ${keys.map((key: any) => html`
            <th
              class=${classMap({
                'table__header': true,
                'table__header--wide': key === this.wideColumn
              })}
              @click="${this.updateSort(key)}">
              <div>
                ${this.headers[key]}
                <div class="table__header__sort">${this.getTableSortIcon(key)}</div>
              </div>
            </th>`)}
        </tr>
        </thead>
        <tbody>
        ${this.rows.map((row: any) => html`
          <tr>
            <td>
              <div><input type="checkbox" @change=${this.selectRow}></div>
            </td>
            ${row.map((value: any) => html`
              <td>
                <div>${this.renderData(value)}`)}</div>
            </td>
          </tr>`)}
        </tbody>
      </table>

      ${this.getTableFooter()}
    `;
  }

  getTableFooter()
  {
    const optionsRowsPerPage = [10, 20, 30, 40, 50];

    return html`
      <div class="table__footer">
        <div class="table__footer__left">
          <p>${this.numberOfRowsSelected} of ${this.itemsPerPage} rows selected</p>
        </div>

        <div class="table__footer__right">

          <div class="table__footer__rows-per-page">
            <p>Rows per page</p>
            <select name="rowPerPage" @change=${this.updateRowsPerPage}>
              ${optionsRowsPerPage.map((option) => html`
                <option value="${option}" ?selected=${option === this.itemsPerPage}>${option}</option>`
              )}
            </select>
          </div>

          <div class="table__footer__pagination-count">
            <p>Page ${this.page} of ${this.totalPages}</p>
          </div>

          <div class="table__footer__pagination-buttons">
            <zn-button @click=${this.goToFirstPage} ?
                       disabled=${this.page === 1}
                       icon-size="16"
                       size="small"
                       icon="keyboard_double_arrow_left"
                       outline>
            </zn-button>
            <zn-button @click=${this.goToPreviousPage}
                       ?disabled=${this.page === 1}
                       icon-size="16"
                       size="small"
                       icon="chevron_left"
                       outline>
            </zn-button>
            <zn-button @click=${this.goToNextPage}
                       ?disabled=${this.page === this.totalPages}
                       icon-size="16"
                       size="small"
                       icon="chevron_right"
                       outline>
            </zn-button>
            <zn-button @click=${this.goToLastPage}
                       ?disabled=${this.page === this.totalPages}
                       icon-size="16"
                       size="small"
                       icon="keyboard_double_arrow_right"
                       outline>
            </zn-button>
          </div>

        </div>
      </div>`;
  }

  goToFirstPage()
  {
    this.page = 1;
    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this._dataTask.run();
  }

  goToPreviousPage()
  {
    this.page = Math.max(this.page - 1, 1);
    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this._dataTask.run();
  }

  goToNextPage()
  {
    this.page = Math.min(this.page + 1, this.totalPages);
    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this._dataTask.run();
  }

  goToLastPage()
  {
    this.page = this.totalPages;
    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this._dataTask.run();
  }

  updateRowsPerPage(event: Event)
  {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(select.value);
    this.page = 1; // reset the page to 1 when changing the number of rows per page
    this.requestUpdate();
    this._dataTask.run();
  }

  selectAll(event: Event)
  {
    const checkbox = event.target as HTMLInputElement;
    const checked = checkbox.checked;

    // go through all the checkboxes and check them
    for(const row of this.renderRoot.querySelectorAll('tbody input[type="checkbox"]'))
    {
      (row as HTMLInputElement).checked = checked;
      this.selectedRows = checked ? this.rows : [];
    }

    // if the select all checkbox is checked
    this.numberOfRowsSelected = this.selectedRows.length;
    this.requestUpdate();
  }

  selectRow()
  {
    this.selectedRows = this.rows.filter((_, index) =>
    {
      return (this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')[index] as HTMLInputElement).checked;
    });

    this.numberOfRowsSelected = this.selectedRows.length;
    this.requestUpdate();
  }

  updateSort(key: string)
  {
    // Rerun the render task with the extra params
    return () =>
    {
      this.sortColumn = key;
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this._dataTask.run();
    };
  }

  renderData(value: any)
  {
    if(value && typeof value === 'object')
    {
      let content: TemplateResult = html`${value['value']}`;

      if(value['type'] === 'timestamp')
      {
        value = parseInt(value['value']);
        content = html`${new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          hourCycle: 'h12',
          timeZone: 'UTC'
        }).format(new Date(value < 10000000000 ? value * 1000 : value))}`;
      }

      if(value['tag'] === 'zn-chip')
      {
        const type = value['type'];
        content = html`
          <zn-chip type="${type}">${content}</zn-chip>`;
      }

      if(value['url'])
      {
        content = html`
          <a href="${value['url']}">${content}</a>`;
      }

      return content;
    }

    return value;
  }

  private getTableSortIcon(key: any)
  {
    if(this.sortColumn !== key)
    {
      return html`
        <zn-icon src="unfold_more" size="14"></zn-icon>`;
    }

    if(this.sortDirection === 'asc')
    {
      return html`
        <zn-icon src="arrow_downward_alt" size="16"></zn-icon>`;
    }

    return html`
      <zn-icon src="arrow_upward_alt" size="16"></zn-icon>`;
  }
}


