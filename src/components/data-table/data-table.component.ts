import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type TemplateResult, unsafeCSS, PropertyValues} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property} from 'lit/decorators.js';
import {ref} from "lit/directives/ref.js";
import {Task} from "@lit/task";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {type ZnFilterChangeEvent} from "../../events/zn-filter-change";
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnButtonGroup from "../button-group";
import ZnChip from "../chip";
import ZnConfirm from "../confirm";
import ZnDataTableFilter from "../data-table-filter";
import ZnDropdown from "../dropdown";
import ZnEmptyState from "../empty-state";
import ZnHoverContainer from "../hover-container";
import ZnMenu from "../menu";
import ZnMenuItem from "../menu-item";
import ZnSkeleton from "../skeleton";
import type ZnSelect from "../select";

import styles from './data-table.scss';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

interface Cell {
  text: string;
  heading?: string;
  color?: string;
  style?: string;
  iconSrc?: string;
  iconColor?: string;
  hoverContent?: string;
  hoverPlacement?: string;
  chipColor?: string;
  gaid?: string;
  sortValue?: string;
  uri?: string;
  target?: string;
}

interface Row {
  id: string;
  uri?: string;
  target?: string;
  actions?: ActionConfig[];
  cells: Cell[];
}

interface Response {
  rows: Row[];
  perPage: number;
  total: number;
  page: number;
}

export enum ActionSlots {
  delete = 'delete-action',
  modify = 'modify-action',
  create = 'create-action',
  filter = 'filter',
  filter_top = 'filter-top',
  sort = 'sort',
}

interface ActionConfig {
  text: string;
  uri: string;
  target: string;
  gaid: string;
  confirmType: string;
  confirmTitle: string;
  confirmContent: string;
  icon: string;
  type: string;
}

interface HeaderConfig {
  key: string;
  label: string;
  required?: boolean;
  default?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataRequest {
  page: number;
  perPage: number;
  sortColumn: string;
  sortDirection: string;
  filter: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/data-table
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-empty-state
 * @dependency zn-chip
 * @dependency zn-hover-container
 * @dependency zn-dropdown
 * @dependency zn-menu
 * @dependency zn-menu-item
 * @dependency zn-button-group
 * @dependency zn-confirm
 * @dependency zn-skeleton
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
    'zn-empty-state': ZnEmptyState,
    'zn-chip': ZnChip,
    'zn-hover-container': ZnHoverContainer,
    'zn-dropdown': ZnDropdown,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
    'zn-button-group': ZnButtonGroup,
    'zn-confirm': ZnConfirm,
    'zn-skeleton': ZnSkeleton,
  };

  @property({attribute: 'data-uri'}) dataUri: string;
  @property({attribute: 'data', type: Object, reflect: true}) data: any;
  @property({attribute: 'sort-column'}) sortColumn: string;
  @property({attribute: 'sort-direction'}) sortDirection: string = "asc";
  @property({attribute: 'filter'}) filter: string = '';
  @property({attribute: 'wide-column'}) wideColumn: string;
  @property({attribute: 'key'}) key: string = 'id';
  @property({attribute: 'headers', type: Object}) headers: Record<string, HeaderConfig> = {};

  // Hide header text keeping the content - e.g. Action buttons without a header
  @property({attribute: 'hide-headers', type: Object}) hiddenHeaders = '{}';

  // Hide entire columns of data - e.g IDs
  @property({attribute: 'hide-columns', type: Object}) hiddenColumns = '{}';

  // Specify individual unsortable headers
  @property({attribute: 'unsortable-headers', type: Object}) unsortableHeaders = '{}';

  // Make table unsortable
  @property({attribute: 'unsortable', type: Boolean}) unsortable: boolean = false;

  // Hide pagination
  @property({attribute: 'hide-pagination', type: Boolean}) hidePagination: boolean;

  @property({type: Boolean}) standalone: boolean = false;

  @property() caption: string;

  @property({attribute: "empty-state-caption"}) emptyStateCaption: string;

  @property({attribute: "empty-state-icon"}) emptyStateIcon: string = "data_alert";

  // Hide the checkbox column
  @property({attribute: 'hide-checkboxes', type: Boolean}) hideCheckboxes: boolean;

  @property() filters: [] = [];

  @property() method: 'GET' | 'POST' = 'POST';

  @property({attribute: "no-initial-load", type: Boolean}) noInitialLoad: boolean = false;

  // Data Table Properties
  private _initialLoad = true;
  private _lastTableContent: TemplateResult = html``;

  private resizeObserver: ResizeObserver;

  private itemsPerPage: number = DEFAULT_PER_PAGE;
  private page: number = DEFAULT_PAGE;
  private totalPages: number;

  private _rows: any[] = [];

  private numberOfRowsSelected: number = 0;
  private selectedRows: any[] = [];
  private tableContainer: Element | undefined;


  private hasSlotController = new HasSlotController(
    this,
    '[default]',
    'search-action',
    ActionSlots.delete.valueOf(),
    ActionSlots.modify.valueOf(),
    ActionSlots.create.valueOf(),
    ActionSlots.filter.valueOf(),
    ActionSlots.sort.valueOf()
  );

  private _dataTask = new Task(this, {
    task: async ([dataUri, requestParams], {signal}) => {
      const requestData: DataRequest = {
        page: this.page,
        perPage: this.itemsPerPage,
        sortColumn: this.sortColumn,
        sortDirection: this.sortDirection,
        filter: this.filter,
      };

      // Add any extra request params
      if (requestParams && typeof requestParams === 'object') {
        Object.assign(requestData, requestParams);
      }

      // This is also used for Rubix, so it may not work for your application.
      const response = await fetch(dataUri, {
        method: this.method,
        headers: {
          'x-kx-fetch-style': 'zn-data-table',
        },
        signal,
        credentials: 'same-origin',
        body: this.method === 'POST' ? JSON.stringify(requestData) : undefined
      });

      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    },
    args: () => [this.dataUri, this.requestParams]
  });

  private rowHasActions: boolean = false;

  requestParams: Record<string, any> = {};

  refresh() {
    // Allow manual refresh to trigger the first data load when no-initial-load is set
    this._initialLoad = false;
    this._dataTask.run().then(r => r);
  }

  render() {
    // If no-initial-load is set, do not invoke the Task on the first render
    let tableBody: TemplateResult;
    if (this.noInitialLoad && this._initialLoad) {
      tableBody = html`
        <slot name="empty-state"></slot>`;
    } else {
      tableBody = this._dataTask.render({
        pending: () => {
          if (this._initialLoad) {
            return html`
              <div>${this.loadingTable()}</div>`;
          }
          return html`
            <div class="reduced-opacity">${this._lastTableContent}</div>`;
        },
        complete: (data) => {
          this._initialLoad = false;
          this._lastTableContent = html`
            <div>${this.renderTable(data as Response)}</div>`;
          return this._lastTableContent;
        },
        error: (error) => {
          if (error instanceof Error) {
            if (error.name === "SyntaxError") {
              console.debug(error.message)
              return html`
                <zn-sp>
                  <zn-alert level="error">Unable to load data</zn-alert>
                </zn-sp>`;
            } else if (error.message === "Not Found") {
              return this.emptyState();
            }
          }
          return html`
            <div>${error}</div>`
        }
      }) as TemplateResult;
    }

    const hasActions = this.hasSlotController.test(ActionSlots.delete.valueOf())
      || this.hasSlotController.test(ActionSlots.modify.valueOf())
      || this.hasSlotController.test(ActionSlots.create.valueOf())
      || this.hasSlotController.test(ActionSlots.sort.valueOf())
      || this.hasSlotController.test(ActionSlots.filter.valueOf())
      || this.hasSlotController.test(ActionSlots.filter_top.valueOf());

    // Headers do not need to be re-rendered with new data
    return html`
      <div class="table-container" ${ref((el) => (this.tableContainer = el))}>
        ${hasActions ? this.getTableHeader() : html``}
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

    this.addEventListener('zn-filter-change', this.changeEventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.removeEventListener('zn-filter-change', this.changeEventListener);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    // do some magic shit to do some shit that probably doesn't need doing
  }

  changeEventListener = (e: ZnFilterChangeEvent) => {
    if (e.target instanceof ZnDataTableFilter) {
      this.filter = (e.target as ZnDataTableFilter).value as string;
      this._dataTask.run().then(r => r);
    }
  }

  emptyState() {
    return html`
      <div class="table--empty">
        <zn-empty-state
          caption="${this.emptyStateCaption ? this.emptyStateCaption : (this.caption ? "No " + this.caption.toLowerCase() + " found" : "No data found")}"
          icon="${this.emptyStateIcon}">
        </zn-empty-state>
      </div>`;
  }

  renderTable(data: Response) {
    this.itemsPerPage = Math.max(1, data.perPage ?? DEFAULT_PER_PAGE);
    this.page = Math.max(1, data.page ?? DEFAULT_PAGE);
    this.totalPages = Math.ceil(Math.max(1, data.total) / this.itemsPerPage);

    if (!data?.rows || data.rows.length === 0) {
      return this.emptyState();
    }

    const filteredHeaders = Object.values(this.headers).filter((header) => {
      return !Object.values(this.hiddenColumns).includes(header.key);
    });

    this._rows = this.getRows(data);

    const hasSelectedRows = this.selectedRows.length > 0;

    this.rowHasActions = this._rows.some((row: Row) => row.actions && row.actions.length > 0);

    return html`
      <div style="overflow-x: auto">
        <table class="${classMap({
          'table': true,
          'table--standalone': this.standalone,
          'with-hover': !this.unsortable,
          'table-with--checkboxes': !this.hideCheckboxes,
        })}">
          <thead>
          <tr>
            ${this.hideCheckboxes || !hasSelectedRows ? html`` : html`
              <th>
                <div><input type="checkbox" @change="${this.selectAll}"></div>
              </th>`}
            ${filteredHeaders.map((header: HeaderConfig) => this.renderCellHeader(header))}
            ${this.rowHasActions ? html`
              <th></th>` : html``}
          </tr>
          </thead>
          <tbody>
          ${this._rows.map((row: Row) => html`
            <tr>
              ${this.hideCheckboxes ? html`` : html`
                <td class="${classMap({'hidden': !hasSelectedRows})}">
                  <div><input type="checkbox" @change="${this.selectRow}"></div>
                </td>`}
              ${row.cells.map((value: Cell, index: number) => this.renderCellBody(index, value))}
              ${this.rowHasActions ? this.renderActions(row) : null}
            </tr>`)}
          </tbody>
        </table>
      </div>

      ${this.getTableFooter()}
    `;
  }

  getTableHeader() {
    return html`
      <slot name="${ActionSlots.filter_top.valueOf()}"></slot>
      <div class="table__header">
        <div class="table__header__actions">
          ${this.getActions()}
        </div>
        <div class="table__header__right">
          <slot name="${ActionSlots.sort.valueOf()}"></slot>
          <slot name="${ActionSlots.filter.valueOf()}"></slot>
        </div>
      </div>
    `;
  }

  getTableFooter() {
    const rowSelected = this.getRowsSelected();
    const pagination = this.getPagination();

    if (rowSelected !== null || pagination !== null) {
      return html`
        <div class="table__footer">
          <div class="table__footer__left">
            ${rowSelected}
          </div>
          <div class="table__footer__right">
            ${pagination}
          </div>
        </div>`;
    }

    return html``;
  }

  getRowsSelected() {
    if (this.hideCheckboxes || this.selectedRows.length <= 0) return null;

    return html`
      <p>${this.numberOfRowsSelected} of ${this._rows.length} rows selected</p>`
  }

  getPagination() {
    if (this.hidePagination || (this.totalPages <= 1 && this._rows.length <= this.itemsPerPage)) return null;

    const optionsRowsPerPage = [10, 20, 30, 40, 50];
    optionsRowsPerPage.filter((option) => option <= this._rows.length);

    return html`
      <div class="table__footer__rows-per-page">
        <p>Rows per page</p>
        <zn-select name="rowPerPage"
                   size="small"
                   value="${this.itemsPerPage}"
                   @zn-change="${this.updateRowsPerPage}">
          ${optionsRowsPerPage.map((option) => html`
            <zn-option value="${option}"
                       selected="${option === this.itemsPerPage || nothing}">${option}
            </zn-option>`
          )}
        </zn-select>
      </div>

      ${this.totalPages <= 1
        ? html``
        : html`
          <div class="table__footer__pagination-count">
            <p>Page ${this.page} of ${this.totalPages}</p>
          </div>

          <div class="table__footer__pagination-buttons">
            <zn-button @click="${this.page !== 1 ? this.goToFirstPage : undefined}"
                       ?disabled="${this.page === 1}"
                       icon-size="16"
                       size="small"
                       icon="keyboard_double_arrow_left"
                       outline>
            </zn-button>
            <zn-button @click="${this.page !== 1 ? this.goToPreviousPage : undefined}"
                       ?disabled="${this.page === 1}"
                       icon-size="16"
                       size="small"
                       icon="chevron_left"
                       outline>
            </zn-button>
            <zn-button @click="${this.page !== this.totalPages ? this.goToNextPage : undefined}"
                       ?disabled="${this.page === this.totalPages}"
                       icon-size="16"
                       size="small"
                       icon="chevron_right"
                       outline>
            </zn-button>
            <zn-button @click="${this.page !== this.totalPages ? this.goToLastPage : undefined}"
                       ?disabled="${this.page === this.totalPages}"
                       icon-size="16"
                       size="small"
                       icon="keyboard_double_arrow_right"
                       outline>
            </zn-button>
          </div>`}`;
  }

  getActions() {
    const actions = [];

    if (this.selectedRows.length > 0) {
      actions.push(html`
        <zn-button @click="${this.clearSelectedRows}" size="small" outline>
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
    const select = event.target as ZnSelect;
    this.itemsPerPage = parseInt(select.value as string);
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

  selectRow(e: PointerEvent) {
    if (!(e.target && (e.target instanceof Element))) {
      return;
    }

    let target: HTMLElement = e.target as HTMLElement;
    // if is a button or a link continue
    if (target.tagName === 'ZN-BUTTON' || target.tagName === 'A' || target.tagName === 'BUTTON') {
      return
    }

    // traverse parent until we reach a tr
    while (target && target.tagName !== 'TR') {
      target = target.parentElement as HTMLElement;
    }

    if (target === null) {
      return;
    }

    const checkbox = target.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }

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

  renderCell(data: Cell) {
    if (data && typeof data === 'object') {
      let content: TemplateResult = html`${data.text}`;

      if (data.style || data.color) {
        content = html`
          <zn-style ${ifDefined(data.style || nothing)}
                    color="${ifDefined(data.color || nothing)}">${content}
          </zn-style>`;
      }

      if (data.uri) {
        content = html`
          <a href="${data.uri}"
             data-target="${ifDefined(data.target || nothing)}"
             gaid="${ifDefined(data.gaid || nothing)}">${content}</a>`;
      }

      if (data.chipColor) {
        return html`
          <zn-chip type="${data.chipColor}">${content}</zn-chip>`;
      }

      if (data.hoverContent) {
        const placement = data.hoverPlacement ?? 'top';

        if (data.iconSrc) {
          const src = data.iconSrc;
          const color = data.iconColor ?? '';

          return html`
            ${content}
            <zn-hover-container placement="${placement}"
                                flip>
              <zn-icon src="${src}" color="${color}"></zn-icon>
              <div slot="content">
                ${unsafeHTML(data.hoverContent)}
              </div>
            </zn-hover-container>`;
        }

        return html`
          <zn-hover-container placement="${placement}"
                              flip>
            <div slot="anchor">${content}</div>
            ${unsafeHTML(data.hoverContent)}
          </zn-hover-container>`;
      }

      if (data.iconSrc) {
        const src = data.iconSrc;
        const color = data.iconColor ?? '';

        return html`
          <zn-icon src="${src}" color="${color}"></zn-icon> ${content}`;
      }

      return content;
    }

    return data;
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

  private getTableSortIcon(key: any) {
    if (this.sortColumn !== key) {
      return html`
        <div class="table__head__sort">
          <zn-icon src="unfold_more" size="14"></zn-icon>
        </div>`;
    }

    if (this.sortDirection === 'asc') {
      return html`
        <div class="table__head__sort table__head__sort--active">
          <zn-icon src="arrow_downward_alt" size="16"></zn-icon>
        </div>`;
    }

    return html`
      <div class="table__head__sort table__head__sort--active">
        <zn-icon src="arrow_upward_alt" size="16"></zn-icon>
      </div>`;
  }

  private renderCellHeader(header: HeaderConfig) {

    const sortable = !Object.values(this.unsortableHeaders).includes(header.key) && !Object.values(this.hiddenHeaders).includes(header.key) && !this.unsortable;
    const lastHeader = Object.keys(this.headers).filter((key) => !Object.values(this.hiddenColumns).includes(key)).slice(-1)[0];
    const lastHeaderKey = lastHeader ? this.headers[lastHeader].key : '';

    return html`
      <th
        class="${classMap({
          'table__head': true,
          'table__head--wide': header.key === this.wideColumn,
          'table__head--last': header.key === lastHeaderKey,
          'table__head--hidden': Object.values(this.hiddenHeaders).includes(header.key),
        })}"
        @click="${sortable ? this.updateSort(header.key) : undefined}">
        <div>
          ${header.label}
          ${sortable ? this.getTableSortIcon(header.key) : nothing}
        </div>
      </th>
    `;
  }

  private renderCellBody(index: number, value: Cell) {
    const headerKeys: string[] = Object.keys(this.headers).filter(
      (key) => !Object.values(this.hiddenColumns).includes(key)
    );
    const headerKey: string = headerKeys[index];

    return html`
      <td
        @click="${this.selectRow}"
        class="${classMap({
          'table__cell': true,
          'table__cell--wide': headerKey === this.wideColumn,
          'table__cell--last': headerKey === headerKeys[headerKeys.length - 1],
        })}">
        <div>${this.renderCell(value)}</div>
      </td>`;
  }

  private getRows(data: Response): Row[] {
    const sourceRows = data.rows;

    if (this.sortColumn) {
      const headerKeys = Object.keys(this.headers);
      const sortIndex = headerKeys.indexOf(this.sortColumn);

      sourceRows.sort((rowA: Row, rowB: Row) => {
        const getCellForSort = (row: Row): Cell => {
          const byHeading = row.cells.find((cell: Cell) => cell.heading === this.sortColumn);
          if (byHeading !== undefined) return byHeading as unknown as Cell;
          return row.cells[sortIndex];
        };

        const aVal = getCellForSort(rowA);
        const bVal = getCellForSort(rowB);
        return this.sortData(aVal, bVal);
      });
    }

    return sourceRows;
  }

  private getSelectedKeys(): (string)[] {
    const headerKeys = Object.keys(this.headers);
    const keyIndex = headerKeys.indexOf(this.key);

    return this.selectedRows
      .map((row: Row) => {
        if (this.key === 'id' || keyIndex === -1) {
          return row.id;
        }
        const cell = row.cells?.[keyIndex] as Cell;
        if (cell.sortValue) {
          return cell.sortValue;
        }
        return cell.text as string;
      })
      .filter((v): v is string => v !== undefined && v !== null);
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

  private extractComparable(cell: Cell): string {
    const sortValue = cell.sortValue;
    if (sortValue) {
      return sortValue;
    }

    return cell.text;
  }

  private sortData(a: Cell, b: Cell) {
    const aCompare = this.extractComparable(a);
    const bCompare = this.extractComparable(b);

    const aNormal = aCompare.toLowerCase();
    const bNormal = bCompare.toLowerCase();

    if (this.sortDirection === 'asc') {
      return aNormal > bNormal ? 1 : aNormal < bNormal ? -1 : 0;
    }

    return aNormal < bNormal ? 1 : aNormal > bNormal ? -1 : 0;
  }

  private loadingTable() {
    return html`
      <div class="table-container">
        <table class="${classMap({
          'table': true,
          'table--standalone': this.standalone,
        })}">
          <thead>
          <tr>
            <th colspan="30%"></th>
            <th colspan="25%"></th>
            <th colspan="20%"></th>
            <th colspan="15%"></th>
            <th colspan="10%"></th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td colspan="30%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="25%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="20%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="15%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="10%">
              <zn-skeleton></zn-skeleton>
            </td>
          </tr>
          <tr>
            <td colspan="30%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="25%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="20%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="15%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="10%">
              <zn-skeleton></zn-skeleton>
            </td>
          </tr>
          <tr>
            <td colspan="30%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="25%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="20%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="15%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="10%">
              <zn-skeleton></zn-skeleton>
            </td>
          </tr>
          </tbody>
        </table>
      </div>`;
  }

  private renderActions(row: Row) {
    if ((row.actions === null || row.actions === undefined) && this.rowHasActions) {
      // return an empty cell to keep the table structure
      return html`
        <td></td>`;
    }

    if (!row.actions || row.actions.length === 0) {
      return html``;
    }

    return html`
      <td class="table__cell table__cell--actions">
        <zn-dropdown placement="bottom-end">
          <zn-button slot="trigger"
                     icon="more_vert"
                     size="small"
                     color="transparent"
                     icon-size="24"
                     aria-label="Row actions">
          </zn-button>
          <zn-menu>
            ${row.actions?.map((action: ActionConfig) => {
              if (action.confirmContent) {
                const triggerId = 'confirm-action-' + Math.random().toString(36).substring(2, 15);
                return html`
                  <zn-confirm trigger="${triggerId}"
                              type="${ifDefined(action.confirmType)}"
                              caption="${action.confirmTitle}"
                              content="${action.confirmContent}"
                              action="${action.uri}"></zn-confirm>
                  <zn-menu-item id="${triggerId}">
                    ${(action.icon) ? html`
                      <zn-icon src="${action.icon}" size="20" slot="prefix"></zn-icon>` : html``}
                    ${action.text}
                  </zn-menu-item>`;
              } else {
                return html`
                  <zn-menu-item value="${action.text}"
                                href="${action.uri}"
                                gaid="${ifDefined(action.gaid || nothing)}"
                                data-target="${ifDefined(action.target || nothing)}">
                    ${(action.icon) ? html`
                      <zn-icon src="${action.icon}" size="20" slot="prefix"></zn-icon>` : html``}
                    ${action.text}
                  </zn-menu-item>`;
              }
            })}
          </zn-menu>
        </zn-dropdown>
      </td>`;
  }
}
