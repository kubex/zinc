import {ZincElement} from "@/zinc-element";
import {html, TemplateResult, unsafeCSS} from "lit";
import {Task} from "@lit/task";
import {customElement, property} from 'lit/decorators.js';
import {classMap} from "lit/directives/class-map.js";

import styles from './index.scss?inline';
import {HasSlotController} from "@/slot";

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
  @property({attribute: 'sort-direction'}) sortDirection: string = 'asc';

  @property({attribute: 'wide-column'}) wideColumn: string;
  @property({type: Boolean, attribute: 'query-as-route-data'}) queryAsRouteData: boolean = false;

  @property({attribute: 'key'}) key: string = 'id';

  @property({attribute: 'headers', type: Object}) headers = '{}';
  @property({attribute: 'hide-headers', type: Object}) hiddenHeaders = '{}';

  // Data Table Properties
  private itemsPerPage: number = 10;
  private page: number = 1;
  private totalItems: number;
  private totalPages: number;

  private _rows: any[] = [];
  private _filteredRows: any[] = [];

  private numberOfRowsSelected: number = 0;
  private selectedRows: any[] = [];

  private hasSlotController = new HasSlotController(this, '[default], modify-action');

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

    const keys = Object.entries(this.headers).map(([key, _]) => key);
    const filteredKeys = keys.filter((key) => !Object.values(this.hiddenHeaders).includes(key));

    this._filteredRows = this.getRows(filteredKeys, data);
    this._rows = this.getRows(keys, data);

    return html`
      ${this.getTableHeader()}
      <table class=${classMap({'table': true})}>
        <thead>
        <tr>
          <th>
            <div><input type="checkbox" @change=${this.selectAll}></div>
          </th>
          ${filteredKeys.map((key: any) => this.renderCellHeader(key))}
        </tr>
        </thead>
        <tbody>
        ${this._filteredRows.map((row: any) => html`
          <tr>
            <td>
              <div><input type="checkbox" @change=${this.selectRow}></div>
            </td>
            ${row.map((value: any, index: number) => this.renderCellBody(index, value))}
          </tr>`)}
        </tbody>
      </table>

      ${this.getTableFooter()}
    `;
  }

  getTableHeader()
  {
    const actions = [];

    if(this.selectedRows.length > 0)
    {
      actions.push(html`
        <zn-button @click=${this.clearSelectedRows} size="x-small" outline>
          Clear Selection
        </zn-button>`);

      if(this.hasSlotController.test('delete-action'))
      {
        actions.push(html`
          <slot name="delete-action"></slot>`);
      }

      if(this.hasSlotController.test('modify-action'))
      {
        actions.push(html`
          <slot name="modify-action"></slot>`);
      }
    }

    if(this.hasSlotController.test('create-action'))
    {
      actions.push(html`
        <slot name="create-action"></slot>`);
    }

    return html`
      <div class="table__header">
        ${actions}
      </div>
    `;
  }

  getTableFooter()
  {
    const optionsRowsPerPage = [10, 20, 30, 40, 50];

    return html`
      <div class="table__footer">
        <div class="table__footer__left">
          <p>${this.numberOfRowsSelected} of ${this._rows.length} rows selected</p>
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
    }

    this.selectedRows = checked ? this._rows : [];
    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }


  private updateActionKeys(slotName: string)
  {
    if(this.hasSlotController.test(slotName))
    {
      // we need to look into the slot controller for the keys input
      const slot = this.hasSlotController.getSlot(slotName);
      if(slot)
      {
        const input = slot.querySelector('input[name="keys"]');
        if(input && input instanceof HTMLInputElement)
        {
          input.value = this.getSelectedKeys().join(',');
        }
      }
    }
  }

  selectRow()
  {
    this.selectedRows = this._rows.filter((_, index) =>
    {
      return (this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')[index] as HTMLInputElement).checked;
    });

    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }

  clearSelectedRows()
  {
    (this.renderRoot.querySelectorAll('thead input[type="checkbox"]')[0] as HTMLInputElement).checked = false;
    for(const row of this.renderRoot.querySelectorAll('tbody input[type="checkbox"]'))
    {
      (row as HTMLInputElement).checked = false;
    }

    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
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
        if(value['target'])
        {
          content = html`
            <a href="${value['url']}" data-target="${value['target']}">${content}</a>`;
        }
        else
        {
          content = html`
            <a href="${value['url']}">${content}</a>`;
        }
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

  private renderCellHeader(key)
  {
    let headerKeys = Object.keys(this.headers);
    headerKeys = headerKeys.filter((key) => !Object.values(this.hiddenHeaders).includes(key));
    return html`
      <th
        class=${classMap({
          'table__head': true,
          'table__head--wide': key === this.wideColumn,
          'table__head--last': key === headerKeys[headerKeys.length - 1]
        })}
        @click="${this.updateSort(key)}">
        <div>
          ${this.headers[key]}
          <div class="table__head__sort">${this.getTableSortIcon(key)}</div>
        </div>
      </th>`;
  }

  private renderCellBody(index: number, value: any)
  {
    let headerKeys = Object.keys(this.headers);
    headerKeys = headerKeys.filter((key) => !Object.values(this.hiddenHeaders).includes(key));
    const header = headerKeys[index];
    return html`
      <td class=${classMap({
        'table__cell': true,
        'table__cell--wide': header === this.wideColumn,
        'table__cell--last': header === headerKeys[headerKeys.length - 1]
      })}>
        <div>${this.renderData(value)}</div>
      </td>`;
  }

  private getRows(keys: string[], data: TableData)
  {
    let rows = Object.values(data.data).map((row: any) =>
    {
      return keys.map((header: any) => row[header]);
    });

    // sort the rows by the key
    rows = rows.sort((a, b) =>
    {
      if(this.sortDirection === 'asc')
      {
        return a[keys.indexOf(this.sortColumn)] > b[keys.indexOf(this.sortColumn)] ? 1 : -1;
      }

      return a[keys.indexOf(this.sortColumn)] < b[keys.indexOf(this.sortColumn)] ? 1 : -1;
    });

    return rows;
  }

  private getSelectedKeys()
  {
    const headerKeys = Object.keys(this.headers);
    return this.selectedRows.map((row) => row[headerKeys.indexOf(this.key)]);
  }

  private updateKeys()
  {
    this.updateModifyKeys();
    this.updateDeleteKeys();
  }

  private updateModifyKeys()
  {
    this.updateActionKeys('modify-action');
  }

  private updateDeleteKeys()
  {
    this.updateActionKeys('delete-action');
  }
}


