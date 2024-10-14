import {ZincElement} from "@/zinc-element";
import {html, unsafeCSS} from "lit";
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
  @property({attribute: 'sort-column'}) sortColumn: string = 'id';
  @property({attribute: 'key'}) key: string = 'id';
  @property({attribute: 'sort-direction'}) sortDirection: string = 'asc';
  @property({attribute: 'wide-column'}) wideColumn: string;

  @property({attribute: 'headers', type: Object}) headers = '{}';

  // Data Table Properties
  private rowsPerPage: number = 10;
  private currentPage: number = 1;
  private totalRows: number = 0;
  private totalPages: number = 0;

  private rows: any[] = [];

  private numberOfRowsSelected: number = 0;
  private selectedRows: any[] = [];

  private _dataTask = new Task(this, {
    task: async ([dataUri], {signal}) =>
    {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // const uri = new URL(dataUri);

      // append parameters to the uri
      // uri.searchParams.append('page', this.currentPage.toString());
      // uri.searchParams.append('rowsPerPage', this.rowsPerPage.toString());
      // uri.searchParams.append('sortColumn', this.sortColumn);
      // uri.searchParams.append('sortDirection', this.sortDirection);

      const response = await fetch(dataUri, {signal});
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
      </table>`;
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

    this.numberOfRowsSelected = checked ? this.rows.length : 0;
    console.log(this.selectedRows);
  }

  selectRow(event: Event)
  {
    const checkbox = event.target as HTMLInputElement;
    const checked = checkbox.checked;
    this.numberOfRowsSelected += checked ? 1 : -1;

    console.log(this.numberOfRowsSelected);
    this.selectedRows = this.rows.filter((row, index) =>
    {
      return (this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')[index] as HTMLInputElement).checked;
    });

    console.log(this.selectedRows);
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
    // Match Unix Timestamp
    if(String.prototype.match.call(value, /^(\d{10}|\d{13})$/))
    {
      value = parseInt(value);
      return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hourCycle: 'h12',
        timeZone: 'UTC'
      }).format(new Date(value < 10000000000 ? value * 1000 : value));
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


