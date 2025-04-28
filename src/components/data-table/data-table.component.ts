import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type TemplateResult, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {property} from 'lit/decorators.js';
import {ref} from "lit/directives/ref.js";
import {Task} from "@lit/task";
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnQueryBuilder from "../query-builder";
import type {ZnSubmitEvent} from "../../events/zn-submit";

import styles from './data-table.scss';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const DEFAULT_TOTAL_PAGES = 10;

interface TableData {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: any[];
}

export enum ActionSlots {
  delete = 'delete-action',
  modify = 'modify-action',
  create = 'create-action',
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/data-table
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-query-builder
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
export default class ZnDataTable extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-query-builder': ZnQueryBuilder,
  };

  @property({attribute: 'data-uri'}) dataUri: string;
  @property({attribute: 'data', type: Object, reflect: true}) data: any;
  @property({attribute: 'sort-column'}) sortColumn: string = 'id';
  @property({attribute: 'sort-direction'}) sortDirection: string = 'asc';
  @property({attribute: 'filter'}) filter: string = '';

  @property({attribute: 'wide-column'}) wideColumn: string;
  @property({attribute: 'key'}) key: string = 'id';

  @property({attribute: 'headers', type: Object}) headers = '{}';
  @property({attribute: 'hide-headers', type: Object}) hiddenHeaders = '{}';
  @property({attribute: 'unsortable-headers', type: Object}) unsortableHeaders = '{}';

  @property({attribute: 'hide-pagination', type: Boolean}) hidePagination: boolean;
  @property({attribute: 'hide-checkboxes', type: Boolean}) hideCheckboxes: boolean;
  @property() filters: [] = [];

  // Data Table Properties
  private resizeObserver: ResizeObserver;

  private itemsPerPage: number = DEFAULT_PER_PAGE;
  private page: number = DEFAULT_PAGE;
  private totalPages: number;

  private _rows: any[] = [];
  private _filteredRows: any[] = [];

  private numberOfRowsSelected: number = 0;
  private selectedRows: any[] = [];
  private tableContainer: Element | undefined;

  private hasSlotController = new HasSlotController(
    this,
    '[default]',
    ActionSlots.delete.valueOf(),
    ActionSlots.modify.valueOf(),
    ActionSlots.create.valueOf(),
  );

  // Horrible, don't like it, burn it, throw it in the garbage. Take the garbage out. Step on it. Burn it again.
  private _uacTask = new Task(this, {
    task: async () => {
      const response = await fetch('/_/workspace', {
        credentials: 'same-origin',
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'x-rubix': 'startup'
        }
      });

      if (!response.ok) throw new Error(response.statusText);
      const json = await response.json();
      return json.uac;
    },
    args: () => []
  });

  private _dataTask = new Task(this, {
    task: async ([dataUri, uac], {signal}) => {
      let url = dataUri;

      const params = new URLSearchParams();
      params.append('page', this.page.toString());
      params.append('per_page', this.itemsPerPage.toString());
      params.append('sort_column', this.sortColumn);
      params.append('sort_direction', this.sortDirection);
      if (this.filter) {
        params.append('filter', this.filter);
      }
      url += '?' + params.toString();

      if (!this.dataUri) {
        return new Promise<TableData>((resolve) => {
          if (!this.data) throw new Error('No data provided, please provide data or dataUri');
          let localData = this.data.data as any[];
          const totalPages = Math.ceil(Object.keys(localData).length / this.itemsPerPage);

          localData.sort((a, b) => {
            return this.sortData(a[this.sortColumn], b[this.sortColumn]);
          });

          const start = (this.page - 1) * this.itemsPerPage;
          const end = start + this.itemsPerPage;
          localData = localData.slice(start, end);

          resolve({
            page: this.page,
            per_page: this.itemsPerPage,
            total: this.totalPages,
            total_pages: totalPages,
            data: localData,
          } satisfies TableData);
        });
      }

      const response = await fetch(url, {
        signal,
        credentials: 'same-origin',
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'x-kx-uac': uac
        },
      });

      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    },
    args: () => [this.dataUri, this._uacTask.value]
  });

  render() {
    const tableBody =
      this._dataTask.render({
        pending: () => html`
          <div>Loading...</div>`,
        complete: (data) => html`
          <div>${this.renderTable(data as TableData)}</div>`,
        error: (error) => html`
          <div>${error}</div>`
      });

    // Headers do not need to be re-rendered with new data
    return html`
      <div class="table-container" ${ref((el) => (this.tableContainer = el))}>
        ${this.getTableHeader()}
        ${tableBody}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => {
      if (this.tableContainer) {
        this.tableContainer.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  renderTable(data: TableData) {
    this.itemsPerPage = data.per_page ?? DEFAULT_PER_PAGE;
    this.page = data.page ?? DEFAULT_PAGE;
    this.totalPages = data.total_pages ?? DEFAULT_TOTAL_PAGES;

    if (!data?.data || data.data.length === 0) {
      return html`
        <div class="table--empty">No data available</div>`;
    }

    const keys = Object.entries(this.headers).map(([key, _]) => key);
    const filteredKeys = keys.filter((key) => !Object.values(this.hiddenHeaders).includes(key));

    this._filteredRows = this.getRows(filteredKeys, data);
    this._rows = this.getRows(keys, data);

    return html`
      <table class=${classMap({'table': true})}>
        <thead>
        <tr>
          ${this.hideCheckboxes ? html`` : html`
            <th>
              <div><input type="checkbox" @change=${this.selectAll}></div>
            </th>`}
          ${filteredKeys.map((key: any) => this.renderCellHeader(key))}
        </tr>
        </thead>
        <tbody>
        ${this._filteredRows.map((row: any) => html`
          <tr>
            ${this.hideCheckboxes ? html`` : html`
              <td>
                <div><input type="checkbox" @change=${this.selectRow}></div>
              </td>`}
            ${row.map((value: any, index: number) => this.renderCellBody(index, value))}
          </tr>`)}
        </tbody>
      </table>

      ${this.getTableFooter()}
    `;
  }

  getTableHeader() {
    return html`
      <div class="table__header">
        <div class="table__header__actions">
          ${this.getActions()}
        </div>
        <div class="table__header__query-builder">
          ${this.getQueryBuilder()}
          <slot name="search-action"></slot>
        </div>
      </div>
    `;
  }

  getTableFooter() {
    return html`
      <div class="table__footer">
        <div class="table__footer__left">
          <p>${this.numberOfRowsSelected} of ${this._rows.length} rows selected</p>
        </div>

        <div class="table__footer__right">
          ${this.getPagination()}
        </div>
      </div>`;
  }

  getPagination() {
    if (this.hidePagination) return html``;

    const optionsRowsPerPage = [10, 20, 30, 40, 50];

    return html`
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
        <zn-button @click="${this.page !== 1 ? this.goToFirstPage : undefined}"
                   ?disabled=${this.page === 1}
                   icon-size="16"
                   size="small"
                   icon="keyboard_double_arrow_left"
                   outline>
        </zn-button>
        <zn-button @click="${this.page !== 1 ? this.goToPreviousPage : undefined}"
                   ?disabled=${this.page === 1}
                   icon-size="16"
                   size="small"
                   icon="chevron_left"
                   outline>
        </zn-button>
        <zn-button @click="${this.page !== this.totalPages ? this.goToNextPage : undefined}"
                   ?disabled=${this.page === this.totalPages}
                   icon-size="16"
                   size="small"
                   icon="chevron_right"
                   outline>
        </zn-button>
        <zn-button @click="${this.page !== this.totalPages ? this.goToLastPage : undefined}"
                   ?disabled=${this.page === this.totalPages}
                   icon-size="16"
                   size="small"
                   icon="keyboard_double_arrow_right"
                   outline>
        </zn-button>
      </div>
    `
  }

  getQueryBuilder() {
    if (this.filters.length === 0) return html``;

    return html`
      <zn-dropdown>
        <div class="dropdown__query-builder">
          <zn-query-builder filters="${this.filters}" size="small" dropdown outline>
          </zn-query-builder>
          <zn-button @click=${this.queryData}
                     color="primary"
                     type="submit">
            Search
          </zn-button>
        </div>
        <zn-button slot="trigger" size="small" icon="filter_alt" icon-size="16" color="secondary">
          Filter
        </zn-button>
      </zn-dropdown>
    `;
  }

  queryData(event: ZnSubmitEvent) {
    const submit = event.target as ZnButton;
    const parent: HTMLElement = submit.parentElement!;
    const queryBuilder: ZnQueryBuilder = parent.querySelector('zn-query-builder')!;
    const queryString = queryBuilder.value as string;

    if (queryString) {
      this.filter = queryString;
      this.selectedRows = [];
      this._dataTask.run().then(r => r);
    }
  }

  getActions() {
    const actions = [];

    if (this.selectedRows.length > 0) {
      actions.push(html`
        <zn-button @click=${this.clearSelectedRows} size="small" outline>
          Clear Selection
        </zn-button>`);

      if (this.hasSlotController.test(ActionSlots.delete.valueOf())) {
        actions.push(html`
          <slot name="${ActionSlots.delete.valueOf()}"></slot>`);
      }

      if (this.hasSlotController.test(ActionSlots.modify.valueOf())) {
        actions.push(html`
          <slot name="${ActionSlots.modify.valueOf()}"></slot>`);
      }
    }

    if (this.hasSlotController.test(ActionSlots.create.valueOf())) {
      actions.push(html`
        <slot name="${ActionSlots.create.valueOf()}"></slot>`);
    }

    return actions;
  }

  goToPage(page: number) {
    this.page = page;
    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this._dataTask.run().then(r => r);

    if (this.resizeObserver) {
      this.resizeObserver.observe(this);
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToPreviousPage() {
    this.goToPage(Math.max(this.page - 1, 1));
  }

  goToNextPage() {
    this.goToPage(Math.min(this.page + 1, this.totalPages));
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  updateRowsPerPage(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(select.value);
    this.page = 1; // reset the page to 1 when changing the number of rows per page
    this.requestUpdate();
    this._dataTask.run().then(r => r);
  }

  selectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const checked = checkbox.checked;

    // go through all the checkboxes and check them
    for (const row of this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')) {
      (row as HTMLInputElement).checked = checked;
    }

    this.selectedRows = checked ? this._rows : [];
    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }


  private updateActionKeys(slotName: string) {
    if (this.hasSlotController.test(slotName)) {
      // we need to look into the slot controller for the keys input
      const slots = this.hasSlotController.getSlots(slotName);
      if (slots) {
        slots.forEach((slot) => {
          const input = slot.querySelector('input[name="keys"]');
          if (input && input instanceof HTMLInputElement) {
            input.value = this.getSelectedKeys().join(',');
          }
        });
      }
    }
  }

  selectRow() {
    this.selectedRows = this._rows.filter((_, index) => {
      return (this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')[index] as HTMLInputElement)?.checked;
    });

    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }

  clearSelectedRows(event: Event) {
    const button = event.target as ZnButton;
    if (button.disabled) return;

    (this.renderRoot.querySelectorAll('thead input[type="checkbox"]')[0] as HTMLInputElement).checked = false;
    for (const row of this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')) {
      (row as HTMLInputElement).checked = false;
    }

    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this.requestUpdate();
  }

  updateSort(key: string) {
    // Rerun the render task with the extra params
    return () => {
      this.sortColumn = key;
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this._dataTask.run().then(r => r);
    };
  }

  renderData(value: any) {
    if (value && typeof value === 'object') {
      let content: TemplateResult = html`${value['value']}`;

      if (value['type'] === 'timestamp') {
        value = parseInt(value['value']);
        content = html`${new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          hourCycle: 'h12',
          timeZone: 'UTC'
        }).format(new Date(value < 10000000000 ? value * 1000 : value))}`;
      }

      if (value['tag'] === 'zn-chip') {
        const type = value['type'];
        content = html`
          <zn-chip type="${type}">${content}</zn-chip>`;
      }

      if (value['tag'] === 'code') {
        content = html`
          <code>${content}</code>`;
      }

      if (value['url']) {
        if (value['target']) {
          content = html`
            <a href="${value['url']}" data-target="${value['target']}">${content}</a>`;
        } else {
          content = html`
            <a href="${value['url']}">${content}</a>`;
        }
      }

      if (value['icon']) {
        const icon = value['icon']?.['src'] ?? value['icon'];
        const size = value['icon']?.['size'] ?? 16;
        const color = value['icon']?.['color'] ?? '';

        content = html`
          <zn-icon src="${icon}" size="${size}" color="${color}"></zn-icon> ${content}`;
      }

      return content;
    }

    return value;
  }

  private getTableSortIcon(key: any) {
    if (this.sortColumn !== key) {
      return html`
        <zn-icon src="unfold_more" size="14"></zn-icon>`;
    }

    if (this.sortDirection === 'asc') {
      return html`
        <zn-icon src="arrow_downward_alt" size="16"></zn-icon>`;
    }

    return html`
      <zn-icon src="arrow_upward_alt" size="16"></zn-icon>`;
  }

  private renderCellHeader(key: any) {
    const sortable = !Object.values(this.unsortableHeaders).includes(key);
    let headerKeys = Object.keys(this.headers);
    headerKeys = headerKeys.filter((key) => !Object.values(this.hiddenHeaders).includes(key));
    return html`
      <th
        class=${classMap({
          'table__head': true,
          'table__head--wide': key === this.wideColumn,
          'table__head--last': key === headerKeys[headerKeys.length - 1]
        })}
        @click="${sortable ? this.updateSort(key) : undefined}">
        <div>
          ${this.headers[key]}
          ${sortable ?
            html`
              <div class="table__head__sort">${this.getTableSortIcon(key)}</div>` :
            html``}
        </div>
      </th>`;
  }

  private renderCellBody(index: number, value: any) {
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

  private getRows(keys: string[], data: TableData) {
    let rows = Object.values(data.data).map((row: any) => {
      return keys.map((header: any) => row[header]);
    });

    if (this.dataUri) {
      // sort the rows by the key
      rows = rows.sort((a, b) => {
        return this.sortData(a[keys.indexOf(this.sortColumn)], b[keys.indexOf(this.sortColumn)]);
      });
    }

    return rows;
  }

  private getSelectedKeys() {
    const headerKeys = Object.keys(this.headers);
    return this.selectedRows.map((row) => row[headerKeys.indexOf(this.key)]);
  }

  private updateKeys() {
    this.updateModifyKeys();
    this.updateDeleteKeys();
  }

  private updateModifyKeys() {
    this.updateActionKeys('modify-action');
  }

  private updateDeleteKeys() {
    this.updateActionKeys('delete-action');
  }

  private sortData(a: string | number | object, b: string | number | object) {
    if (typeof a === 'object' && 'value' in a) {
      a = a.value as string | number;
    }

    if (typeof b === 'object' && 'value' in b) {
      b = b.value as string | number;
    }

    if (typeof a === 'string') {
      a = a.toLowerCase();
    }

    if (typeof b === 'string') {
      b = b.toLowerCase();
    }

    if (this.sortDirection === 'asc') {
      return a > b ? 1 : -1;
    }

    return a < b ? 1 : -1;
  }
}
