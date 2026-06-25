import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type PropertyValues, type TemplateResult, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query} from 'lit/decorators.js';
import {ref} from "lit/directives/ref.js";
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {Task} from "@lit/task";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {type ZnColumnsChangeEvent} from "../../events/zn-columns-change";
import {type ZnFilterChangeEvent} from "../../events/zn-filter-change";
import {type ZnSearchChangeEvent} from "../../events/zn-search-change";
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnButtonGroup from "../button-group";
import ZnChip from "../chip";
import ZnConfirm from "../confirm";
import ZnDataTableColumns from "../data-table-columns";
import ZnDataTableFilter from "../data-table-filter";
import ZnDataTableSearch from "../data-table-search";
import ZnDropdown from "../dropdown";
import ZnEmptyState from "../empty-state";
import ZnHoverContainer from "../hover-container";
import ZnMenu from "../menu";
import ZnMenuItem from "../menu-item";
import ZnPanel from "../panel";
import ZnSkeleton from "../skeleton";
import ZnStyle from "../style";
import type ZnDataSelect from "../data-select";
import type ZnInput from "../input";
import type ZnQueryBuilder from "../query-builder";
import type ZnSelect from "../select";

import styles from './data-table.scss';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

interface Cell {
  text: string;
  column: string;
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
  copyable?: boolean;
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
  search = 'search',
  inputs = 'inputs'
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
  iconSrc?: string;
  color?: string;
  type: string;
}

interface HeaderConfig {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  hideHeader?: boolean;
}

interface DataRequest {
  page: number;
  perPage: number;
  sortColumn: string;
  sortDirection: string;
  filter: string;
  search: string;
}

type AllowedInputElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | ZnInput
  | ZnSelect
  | ZnDataSelect
  | ZnQueryBuilder

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
 * @dependency zn-panel
 * @dependency zn-skeleton
 * @dependency zn-data-table-columns
 * @dependency zn-data-table-search
 *
 * @slot - The default slot.
 * @slot search - Slot for search component.
 * @slot sort - Slot for sort component.
 * @slot filter - Slot for filter component.
 * @slot filter-top - Slot for top-level filter component.
 * @slot delete-action - Slot for delete action button.
 * @slot modify-action - Slot for modify action button.
 * @slot create-action - Slot for create action button.
 * @slot inputs - Slot for additional input controls.
 * @slot empty-state - Slot for custom empty state.
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
    'zn-panel': ZnPanel,
    'zn-skeleton': ZnSkeleton,
    'zn-style': ZnStyle,
    'zn-data-table-columns': ZnDataTableColumns,
    'zn-data-table-search': ZnDataTableSearch,
  };

  @property({attribute: 'data-uri'}) dataUri: string;
  @property({attribute: 'data', type: Object, reflect: true}) data: any;
  @property({attribute: 'sort-column'}) sortColumn: string;
  @property({attribute: 'sort-direction'}) sortDirection: string = "asc";
  @property({attribute: 'local-sort', type: Boolean}) localSort: boolean = false;
  @property({attribute: 'filter'}) filter: string = '';
  @property({attribute: 'search'}) search: string = '';
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

  // Render without the default zn-panel wrapper (for embedding in an existing panel/pane)
  @property({type: Boolean}) flush: boolean = false;

  @property() caption: string;

  @property({attribute: "empty-state-caption"}) emptyStateCaption: string;

  @property({attribute: "empty-state-icon"}) emptyStateIcon: string = "data_alert";

  // Hide the checkbox column
  @property({attribute: 'hide-checkboxes', type: Boolean}) hideCheckboxes: boolean;

  @property() filters: [] = [];

  @property() method: 'GET' | 'POST' = 'POST';

  @property({attribute: "no-initial-load", type: Boolean}) noInitialLoad: boolean = false;

  @property({attribute: 'storage-key'}) storageKey: string;

  @property({attribute: 'group-by'}) groupBy = '';

  @property() groups = '';

  @query('#select-all-rows') selectAllButton: ZnButton;

  // Data Table Properties
  private _initialLoad = true;
  private _lastTableContent: TemplateResult = html``;

  private readonly resizeObserver = new ResizeController(this, {
    target: null,
    callback: () => {
      if (this.tableContainer) {
        this.tableContainer.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    },
  });

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
    ActionSlots.search.valueOf(),
    ActionSlots.delete.valueOf(),
    ActionSlots.modify.valueOf(),
    ActionSlots.create.valueOf(),
    ActionSlots.filter.valueOf(),
    ActionSlots.sort.valueOf(),
    ActionSlots.inputs.valueOf(),
    'empty-state'
  );

  private _dataTask = new Task(this, {
    task: async ([dataUri, requestParams], {signal}) => {
      if (dataUri === undefined || this.noInitialLoad && this._initialLoad) {
        return {rows: [], page: 1, perPage: this.itemsPerPage, total: 0};
      }

      if (this.groupBy) {
        // we want to load all the data possible so we can group and show multiple tables
        this.itemsPerPage = 1000;
      }

      const requestData: DataRequest = {
        page: this.page,
        perPage: this.itemsPerPage,
        sortColumn: this.sortColumn,
        sortDirection: this.sortDirection,
        filter: this.filter,
        search: this.search,
      };

      // get all inputs that are in the inputs slot and add them to the
      const inputs = this.hasSlotController.getSlots(ActionSlots.inputs.valueOf());
      const params: Record<string, any> = {};
      if (inputs) {
        inputs.forEach((input) => {
          const allowedInputs = ['zn-input', 'zn-select', 'zn-query-builder', 'zn-multiselect', 'zn-params-select', 'zn-datepicker', 'input', 'select', 'textarea'];
          if (allowedInputs.includes(input.tagName.toLowerCase())) {
            const value = (input as AllowedInputElement).value as string || input.getAttribute('value');
            const name = (input as AllowedInputElement).name || input.getAttribute('name');
            if (name) {
              params[name] = value;
            }
          }
        });
        Object.assign(requestData, params);
      }


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

  private _visibleColumns: string[] = [];

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
      || this.hasSlotController.test(ActionSlots.filter_top.valueOf())
      || this.hasSlotController.test(ActionSlots.search.valueOf());

    const hasInputs = this.hasSlotController.test(ActionSlots.inputs.valueOf());

    // Headers do not need to be re-rendered with new data
    const content = html`
      <div class="table-container" ${ref((el) => (this.tableContainer = el))}>
        ${hasInputs ? html`
          <slot name="${ActionSlots.inputs.valueOf()}" style="display: none"></slot>` : null}
        ${hasActions ? this.getTableHeader() : html``}
        ${tableBody}
      </div>
    `;

    if (this.flush || this.groupBy) {
      return content;
    }

    return html`
      <zn-panel caption=${ifDefined(this.caption)} flush>
        ${this.renderColumnControl()}
        ${content}
      </zn-panel>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadColumnState();
    this.addEventListener('zn-columns-change', this.columnsChangeListener);
    this.addEventListener('zn-filter-change', this.filterChangeListener);
    this.addEventListener('zn-search-change', this.searchChangeListener);
  }

  protected willUpdate(changed: PropertyValues) {
    if ((changed.has('headers') || changed.has('storageKey') || changed.has('dataUri'))
        && this._visibleColumns.length === 0) {
      this.loadColumnState();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('zn-columns-change', this.columnsChangeListener);
    this.removeEventListener('zn-filter-change', this.filterChangeListener);
    this.removeEventListener('zn-search-change', this.searchChangeListener);
  }

  filterChangeListener = (e: ZnFilterChangeEvent) => {
    if (e.target instanceof ZnDataTableFilter) {
      this.filter = (e.target as ZnDataTableFilter).value as string;
      this._dataTask.run().then(r => r);
    }
  }

  columnsChangeListener = (e: ZnColumnsChangeEvent) => {
    const detail = e.detail;
    if (!detail || !Array.isArray(detail.columns) || detail.columns.length === 0) return;
    this._visibleColumns = [...detail.columns];
    this.persistColumnState();
    this.requestUpdate();
  }

  searchChangeListener = (e: ZnSearchChangeEvent) => {
    const target = e.target as ZnDataTableSearch | null;
    if (target && target.tagName === 'ZN-DATA-TABLE-SEARCH') {
      this.search = target.value as string;

      // Get form data and search URI from event detail if available
      if (e.detail) {
        const {formData, searchUri} = e.detail as { formData?: Record<string, unknown>; searchUri?: string };

        // Merge form data into request params
        if (formData && typeof formData === 'object') {
          this.requestParams = {...this.requestParams, ...formData};
        }

        // Temporarily override dataUri for this search if searchUri is provided
        if (searchUri) {
          const originalUri = this.dataUri;
          this.dataUri = searchUri;
          this._dataTask.run().then(() => {
            // Restore original URI after search
            this.dataUri = originalUri;
          });
          return;
        }
      }

      this._dataTask.run().then(r => r);
    }
  }

  emptyState() {
    if (this.hasSlotController.test('empty-state')) {
      return html`
        <div class="table--empty">
          <slot name="empty-state"></slot>
        </div>`;
    }

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

    this._rows = this.getRows(data);

    if (this.groupBy) {
      // we need to group the rows by the group column
      const groupedRows: Record<string, Row[]> = {};

      // add groups to the current rows
      const toAdd = this.groups.split(',').map(g => g.trim()).filter(g => g.length > 0);

      const hasWildcard = toAdd.includes('*');
      const explicitGroups = new Set(
        toAdd
          .filter(g => g !== '*')
          .map(g => this.humanize(g))
      );

      // pre-create explicit groups
      explicitGroups.forEach((group) => {
        if (!groupedRows[group]) {
          groupedRows[group] = [];
        }
      });

      // pre-create wildcard grouping if requested
      if (hasWildcard) {
        groupedRows['*'] = [];
      }

      this._rows.forEach((row: Row) => {
        const groupCell = row.cells.find((cell: Cell) => cell.column === this.groupBy);
        const rawGroupValue = groupCell ? groupCell.text : 'Ungrouped';
        const groupValue = this.humanize(rawGroupValue);

        if (explicitGroups.has(groupValue)) {
          groupedRows[groupValue].push(row);
          return;
        }

        if (hasWildcard) {
          groupedRows['*'].push(row);
          return;
        }

        // If no groups specified, or handling ungrouped fallback, create groups dynamically
        if (!this.groups || groupValue === 'Ungrouped') {
          if (!groupedRows[groupValue]) {
            groupedRows[groupValue] = [];
          }
          groupedRows[groupValue].push(row);
        }
      });

      // remove empty groups
      Object.keys(groupedRows).forEach((groupKey) => {
        if (groupedRows[groupKey].length === 0) {
          delete groupedRows[groupKey];
        }
      });

      // Fixed group order so sorting rows never reorders the tables:
      // explicit groups keep their declared order, then the wildcard, then any
      // dynamically discovered groups alphabetically ("Ungrouped" always last).
      const orderedKeys: string[] = [];
      explicitGroups.forEach((group) => {
        if (groupedRows[group]) orderedKeys.push(group);
      });
      if (hasWildcard && groupedRows['*']) orderedKeys.push('*');
      Object.keys(groupedRows)
        .filter((key) => !orderedKeys.includes(key))
        .sort((a, b) => {
          if (a === 'Ungrouped') return 1;
          if (b === 'Ungrouped') return -1;
          return a.localeCompare(b);
        })
        .forEach((key) => orderedKeys.push(key));

      // render a table for each group, each wrapped in its own panel whose
      // caption is the group value.
      return html`
        <zn-sp flush>
          ${orderedKeys.map((groupKey, index) => html`
            <zn-panel caption="${(groupKey === "Ungrouped" || groupKey === "*") ? "" : groupKey}" flush>
              ${index === 0 ? this.renderColumnControl() : nothing}
              ${this.renderTableData(groupedRows[groupKey], true)}
            </zn-panel>`
          )}
        </zn-sp>
      `;
    }


    return this.renderTableData(this._rows);
  }

  public humanize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public renderTableData(data: any, grouped: boolean = false) {
    const filteredHeaders = this.visibleHeaders();

    this.rowHasActions = this._rows.some((row: Row) => row.actions && row.actions.length > 0);

    const visibleRowCells: Map<string, Cell[]> = new Map();
    this._rows.forEach((row: Row) => {
      const originalCells = Array.isArray(row.cells) ? row.cells : [];
      const orderedCells: Cell[] = filteredHeaders.map((header: HeaderConfig) => {
        const cell = originalCells.find((c: Cell) => c.column === header.key);
        return cell ?? {text: '', column: header.key};
      });
      visibleRowCells.set(row.id, orderedCells);
    });

    return html`
      <div style="overflow-x: auto">
        <table class="${classMap({
          'table': true,
          'table--grouped': grouped,
          'with-hover': !this.unsortable && !this.hideCheckboxes,
        })}">
          <thead>
          <tr>
            ${filteredHeaders.map((header: HeaderConfig) => this.renderCellHeader(header))}
            ${this.rowHasActions ? html`<th></th>` : html``}
          </tr>
          </thead>
          <tbody>
          ${(data as Row[]).map((row: Row) => html`
            <tr class="${classMap({
              'table__row--selected': this.isRowSelected(row),
              'table__row--data': true,
            })}" data-row-id="${row.id}">
              ${(visibleRowCells.get(row.id) || row.cells).map((value: Cell, index: number) => this.renderCellBody(index, value))}
              ${this.rowHasActions ? this.renderActions(row) : nothing}
            </tr>
          `)}
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
          <slot name="${ActionSlots.search.valueOf()}"></slot>
          <slot name="${ActionSlots.sort.valueOf()}"></slot>
          <slot name="${ActionSlots.filter.valueOf()}"></slot>
        </div>
      </div>
    `;
  }

  getTableFooter() {
    const rowSelected = this.getRowsSelected();
    const pagination = this.getPagination();
    const rowsPerPage = this.getRowsPerPage();

    if (rowSelected !== null || pagination !== null || rowsPerPage !== null) {
      return html`
        <div class="table__footer">
          <div class="table__footer__left">
            ${pagination}
            ${rowSelected}
          </div>
          <div class="table__footer__right">
            ${rowsPerPage}
          </div>
        </div>`;
    }

    return html``;
  }

  getRowsSelected() {
    if (this.selectedRows.length <= 0) return null;

    return html`
      <p>${this.numberOfRowsSelected} of ${this._rows.length} rows selected</p>`
  }

  getRowsPerPage() {
    if (this.hidePagination || (this.totalPages <= 1 && this._rows.length <= this.itemsPerPage)) return null;

    // Always include the current page size so it stays selectable/displayed,
    // even when the server returns a non-standard perPage value.
    const optionsRowsPerPage = [...new Set([10, 20, 30, 40, 50, this.itemsPerPage])].sort((a, b) => a - b);

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
      </div>`;
  }

  private getPageRange(): (number | 'ellipsis')[] {
    const total = this.totalPages;
    const current = this.page;

    if (total <= 7) {
      return Array.from({length: total}, (_, i) => i + 1);
    }

    const showLeftEllipsis = current > 4;
    const showRightEllipsis = current < total - 3;

    if (!showLeftEllipsis && showRightEllipsis) {
      return [1, 2, 3, 4, 5, 'ellipsis', total];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
  }

  getPagination() {
    if (this.hidePagination || this.totalPages <= 1) return null;

    return html`
      <div class="table__footer__pagination-buttons">
        <zn-button @click="${this.page !== 1 ? this.goToFirstPage : undefined}"
                   ?disabled="${this.page === 1}"
                   icon="arrow_left@lu">First
        </zn-button>
        <zn-button @click="${this.page !== 1 ? this.goToPreviousPage : undefined}"
                   ?disabled="${this.page === 1}">Back
        </zn-button>
        ${this.getPageRange().map((p) => p === 'ellipsis'
          ? html`<span class="table__footer__pagination-ellipsis">…</span>`
          : html`
            <zn-button @click="${p !== this.page ? () => this.goToPage(p) : undefined}"
                       icon-button="small"
                       class="${p === this.page ? 'table__footer__pagination-page--active' : ''}">${p}
            </zn-button>`
        )}
        <zn-button @click="${this.page !== this.totalPages ? this.goToNextPage : undefined}"
                   ?disabled="${this.page === this.totalPages}">Next
        </zn-button>
        <zn-button @click="${this.page !== this.totalPages ? this.goToLastPage : undefined}"
                   ?disabled="${this.page === this.totalPages}"
                   icon="arrow_right@lu"
                   icon-position="right">Last
        </zn-button>
      </div>`;
  }

  getActions() {
    const actions = [];

    const hasSlots = this.hasSlotController.test(ActionSlots.delete.valueOf())
      || this.hasSlotController.test(ActionSlots.modify.valueOf())
      || this.hasSlotController.test(ActionSlots.create.valueOf());

    if (!hasSlots) {
      return [];
    }

    if (!this.hideCheckboxes && this._rows.length > 0) {
      actions.push(html`
        <zn-button @click="${this.selectAll}"
                   id="select-all-rows"
                   color="transparent"
                   icon="indeterminate_check_box"
                   icon-size="22"
                   icon-color="primary"
                   tooltip="Select All"
                   slot="trigger">
        </zn-button>`);
    }

    if (this.selectedRows.length > 0) {
      actions.push(html`
        <zn-button @click="${this.clearSelectedRows}"
                   color="transparent"
                   icon="disabled_by_default"
                   icon-size="22"
                   tooltip="Clear Selection"
                   slot="trigger">
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

    this.resizeObserver.observe(this);
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
    const button = event.target as ZnButton;
    if (button.disabled) return;

    if (this.numberOfRowsSelected === this._rows.length) {
      this.clearSelectedRows(event);
      return;
    }

    this.selectedRows = this._rows;
    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }

  selectRow(e: Event) {
    if (this.hideCheckboxes) {
      return;
    }

    if (!(e.target && (e.target instanceof Element))) {
      return;
    }

    const target: Element | null = e.target;
    // if is a button or a link continue
    if (target?.tagName === 'ZN-BUTTON' || target?.tagName === 'A' || target?.tagName === 'BUTTON') {
      return;
    }

    // Find the parent row
    let parent: Element | null = target.closest ? target.closest('tr') : target.parentElement;
    while (parent && parent.tagName !== 'TR') {
      parent = parent.parentElement;
    }

    if (parent === null) {
      return;
    }

    const rows = Array.from(this.renderRoot.querySelectorAll('tbody tr:not([data-details="true"])'));
    const index = rows.indexOf(parent as HTMLTableRowElement);
    if (index === -1) return;

    const row = this._rows[index] as Row;
    if (!row) return;

    const alreadySelected = this.selectedRows.some((r: Row) => r.id === row.id);
    if (alreadySelected) {
      this.selectedRows = this.selectedRows.filter((r: Row) => r.id !== row.id);
    } else {
      this.selectedRows = [...(this.selectedRows as Row[]), row];
    }

    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }

  clearSelectedRows(event: Event) {
    const button = event.target as ZnButton;
    if (button.disabled) return;

    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this.updateKeys();
    this.requestUpdate();
  }

  updateSort(key: string) {
    // Rerun the render task with the extra params
    return () => {
      this.sortColumn = key;
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

      if (this.localSort) {
        this._rows = this.sortLocalData(this._rows as Row[]);
        this.requestUpdate();
      } else {
        this._dataTask.run().then(r => r);
      }
    };
  }

  renderCell(data: Cell) {
    if (data && typeof data === 'object') {
      // Wrap text in a span so it's an element the cell can truncate with an ellipsis
      let content: TemplateResult | ZincElement = html`<span>${data.text}</span>`;

      if (data.style || data.color) {
        const styleStr = typeof data.style === 'string' ? data.style : '';
        const tokens = new Set(styleStr.split(',').filter(Boolean));

        const isMono = tokens.has('mono') || tokens.has('code');
        const isBorder = tokens.has('border');
        const isCenter = tokens.has('center');

        if (tokens.has('bold') || tokens.has('strong')) {
          content = html`<strong>${content}</strong>`;
        }

        if (tokens.has('italic')) {
          content = html`<em>${content}</em>`;
        }

        content = html`
          <zn-style
            font="${isMono ? 'mono' : nothing}"
            border="${isBorder || nothing}"
            center="${isCenter || nothing}"
            color="${ifDefined(data.color)}">${content}
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

      if (data.copyable) {
        return html`
          ${content}
          <zn-copy-button value="${data.text}"></zn-copy-button>`;
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
          <zn-icon src="chevrons_up_down@lu" size="14"></zn-icon>
        </div>`;
    }

    if (this.sortDirection === 'asc') {
      return html`
        <div class="table__head__sort table__head__sort--active">
          <zn-icon src="chevron_down@lu" size="16"></zn-icon>
        </div>`;
    }

    return html`
      <div class="table__head__sort table__head__sort--active">
        <zn-icon src="chevron_up@lu" size="16"></zn-icon>
      </div>`;
  }

  private renderCellHeader(header: HeaderConfig) {
    const sortable = !Object.values(this.unsortableHeaders).includes(header.key) && !Object.values(this.hiddenHeaders).includes(header.key) && !this.unsortable && header.sortable !== false;

    const lastVisibleHeaderKey = this.visibleHeaders().slice(-1)[0]?.key;

    return html`
      <th
        class="${classMap({
          'table__head': true,
          'table__head--wide': header.key === this.wideColumn,
          'table__head--last': header.key === lastVisibleHeaderKey,
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
    const filteredHeaders = this.visibleHeaders();
    const headerKey: string = filteredHeaders[index]?.key;

    return html`
      <td
        @click="${this.hideCheckboxes ? undefined : this.selectRow}"
        class="${classMap({
          'table__cell': true,
          'table__cell--wide': headerKey === this.wideColumn,
          'table__cell--last': index === filteredHeaders.length - 1,
        })}">
        <div>${this.renderCell(value)}</div>
      </td>`;
  }

  private columnStorageKey(): string | null {
    const id = this.storageKey || this.dataUri;
    return id ? `zn-data-table-columns:${id}` : null;
  }

  private persistColumnState() {
    const key = this.columnStorageKey();
    if (!key) return;
    try {
      const payload = {visible: this._visibleColumns, known: this.defaultColumnKeys()};
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // storage unavailable — keep in-memory state
    }
  }

  private loadColumnState() {
    const all = this.defaultColumnKeys();
    const key = this.columnStorageKey();
    const applyDefault = () => { if (this._visibleColumns.length === 0) this._visibleColumns = all; };
    if (!key) { applyDefault(); return; }
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) { applyDefault(); return; }
      const parsed = JSON.parse(raw) as string[] | {visible?: string[]; known?: string[]};
      let storedVisible: string[];
      let storedKnown: string[];
      if (Array.isArray(parsed)) {
        // legacy visible-only format: treat all current headers as known so none are force-appended
        storedVisible = parsed;
        storedKnown = all;
      } else {
        storedVisible = Array.isArray(parsed.visible) ? parsed.visible : [];
        storedKnown = Array.isArray(parsed.known) ? parsed.known : [];
      }
      const visible = storedVisible.filter((k) => all.includes(k));
      // Truly-new columns: in current headers, never seen at save time, not already visible. Declared order preserved.
      const newKeys = all.filter((k) => !storedKnown.includes(k) && !visible.includes(k));
      const next = [...visible, ...newKeys];
      this._visibleColumns = next.length > 0 ? next : all;
    } catch {
      applyDefault();
    }
  }

  private renderColumnControl() {
    return html`
      <zn-data-table-columns
        slot="actions"
        .columns=${Object.values(this.headers).map((h: HeaderConfig) => ({key: h.key, label: h.label}))}
        .value=${this._visibleColumns}>
      </zn-data-table-columns>`;
  }

  private defaultColumnKeys(): string[] {
    const hidden = Object.values(this.hiddenColumns);
    return Object.values(this.headers)
      .map((h: HeaderConfig) => h.key)
      .filter((k) => !hidden.includes(k));
  }

  private visibleHeaders(): HeaderConfig[] {
    const hidden = Object.values(this.hiddenColumns);
    const byKey = new Map(Object.values(this.headers).map((h: HeaderConfig) => [h.key, h]));
    return this._visibleColumns
      .map((k) => byKey.get(k))
      .filter((h): h is HeaderConfig => !!h && !hidden.includes(h.key));
  }

  private isRowSelected(row: Row): boolean {
    return this.selectedRows.some((r: Row) => r.id === row.id);
  }

  private getRows(data: Response): Row[] {
    // Copy rows to avoid mutating original data
    const sourceRows = Array.isArray(data.rows) ? data.rows.slice() : [];

    if (this.localSort && this.sortColumn) {
      return this.sortLocalData(sourceRows);
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
    this.updateSelectAll();
    this.updateModifyKeys();
    this.updateDeleteKeys();
  }

  private updateSelectAll() {
    if (!this.selectAllButton) {
      return;
    }

    if (this.numberOfRowsSelected === this._rows.length) {
      this.selectAllButton.icon = 'check_box';
    } else {
      this.selectAllButton.icon = 'indeterminate_check_box';
    }
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

  private sortLocalData(rows: Row[]): Row[] {
    if (!this.sortColumn) return rows;

    const headerKeys = Object.keys(this.headers);
    const sortIndex = headerKeys.indexOf(this.sortColumn);

    const getCellForSort = (row: Row): Cell => {
      const byHeading = row.cells.find((cell: Cell) => cell.column === this.sortColumn);
      if (byHeading !== undefined) return byHeading as unknown as Cell;
      return row.cells[sortIndex];
    };

    return rows.slice().sort((rowA: Row, rowB: Row) => {
      const aVal = getCellForSort(rowA);
      const bVal = getCellForSort(rowB);
      return this.sortData(aVal, bVal);
    });
  }

  private loadingTable() {
    return html`
      <div class="table-container">
        <table class="${classMap({
          'table': true,
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
    if (!row.actions || row.actions.length === 0) {
      if (this.rowHasActions) {
        return html`
          <td></td>`;
      }
      return nothing;
    }

    return html`
      <td class="table__cell table__cell--actions">
        <zn-dropdown placement="bottom-end">
          <zn-button slot="trigger"
                     icon-button
                     plain
                     icon="ellipsis@lu"
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
                              action="${action.uri}"
                              show-loading></zn-confirm>
                  <zn-menu-item id="${triggerId}"
                                color="${ifDefined(action.color || nothing)}"
                                confirm>
                    ${(action.icon || action.iconSrc) ? html`
                      <zn-icon src="${action.iconSrc || action.icon}" size="20" slot="prefix"></zn-icon>` : html``}
                    ${action.text}
                  </zn-menu-item>`;
              } else {
                return html`
                  <zn-menu-item value="${action.text}"
                                href="${action.uri}"
                                gaid="${ifDefined(action.gaid || nothing)}"
                                data-target="${ifDefined(action.target || nothing)}"
                                color="${ifDefined(action.color || nothing)}">
                    ${(action.icon || action.iconSrc) ? html`
                      <zn-icon src="${action.iconSrc || action.icon}" size="20" slot="prefix"></zn-icon>` : html``}
                    ${action.text}
                  </zn-menu-item>`;
              }
            })}
          </zn-menu>
        </zn-dropdown>
      </td>`;
  }
}
