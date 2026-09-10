import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type PropertyValues, type TemplateResult, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query, state} from 'lit/decorators.js';
import {ref} from "lit/directives/ref.js";
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {Task} from "@lit/task";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {type ZnFilterChangeEvent} from "../../events/zn-filter-change";
import {type ZnSearchChangeEvent} from "../../events/zn-search-change";
import ZincElement from '../../internal/zinc-element';
import ZnAlert from "../alert";
import ZnButton from "../button";
import ZnButtonGroup from "../button-group";
import ZnChip from "../chip";
import ZnConfirm from "../confirm";
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

// Tables load in such a way that the global sheet has to be re-applied inside the shadow root.
import bootStyles from '../../../scss/boot.scss';
import styles from './data-table.scss';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
// Numbered page buttons shown at once; the window slides so the control never grows
const PAGE_WINDOW = 3;
const SUGGESTION_LIMIT = 25;

interface Cell {
  text: string;
  subText?: string;
  column: string;
  color?: string;
  style?: string;
  iconSrc?: string;
  iconColor?: string;
  iconSize?: number;
  iconStyle?: string;
  hoverContent?: string;
  hoverPlacement?: string;
  chipColor?: string;
  gaid?: string;
  sortValue?: string;
  uri?: string;
  target?: string;
  copyable?: boolean;
  title?: string;
}

interface RowGroup {
  label: string;
  rows: Row[];
}

interface Row {
  id: string;
  uri?: string;
  target?: string;
  actions?: ActionConfig[];
  cells: Cell[];
}

interface ResponseError {
  text: string;
  icon?: string;
  level?: 'primary' | 'error' | 'info' | 'success' | 'warning' | 'note';
}

interface Response {
  rows: Row[];
  perPage: number;
  total: number;
  page: number;
  error?: ResponseError;
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
  required?: boolean;
  default?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  hideHeader?: boolean;
  hideColumn?: boolean;
  secondary?: boolean;
  type?: string;
  cellTemplate?: Cell;
  ifEmpty?: Cell;
}

type DisplayTemplate = (cell: Cell, row: Row, header: HeaderConfig) =>
  TemplateResult | string;


const defaultTemplates = {
  dateTime: ((cell) => {
    const t = cell.text || '';
    return html`
      <div class="table__collum--datetime" title="${ifDefined(cell.title)}">
        <span><strong>${t.slice(0, 10)}</strong></span>
        <zn-style size="s" muted>${t.slice(11)}</zn-style>
      </div>`
  }) satisfies DisplayTemplate
};


interface DataRequest {
  page: number;
  perPage: number;
  sortColumn: string;
  sortDirection: string;
  filter: string;
  search: string;
  // Search-related fields (from the search component's `fields` slot) plus `q` (the search text),
  // wrapped so the backend can bind them to a single map instead of arbitrary root-level keys.
  searchFields?: Record<string, any> | null;
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
 * @dependency zn-alert
 * @dependency zn-button
 * @dependency zn-empty-state
 * @dependency zn-chip
 * @dependency zn-hover-container
 * @dependency zn-dropdown
 * @dependency zn-menu
 * @dependency zn-menu-item
 * @dependency zn-panel
 * @dependency zn-button-group
 * @dependency zn-confirm
 * @dependency zn-skeleton
 * @dependency zn-data-table-search
 *
 * @slot - The default slot.
 * @slot search - Slot for search component, in the header's right-hand group.
 * @slot sort - Slot for sort component, in the header's right-hand group.
 * @slot filter - Slot for filter component, in the header's right-hand group.
 * @slot filter-top - Slot for a top-level filter component, rendered above the table's panel.
 * @slot delete-action - Slot for delete action button, shown beside the caption once rows are selected.
 * @slot modify-action - Slot for modify action button, shown beside the caption once rows are selected.
 * @slot create-action - Slot for create action button, at the end of the header's right-hand group.
 * @slot inputs - Slot for additional input controls.
 * @slot empty-state - Slot for custom empty state.
 * @slot no-results - Slot for a custom no-results state, shown when a search on a no-initial-load table returns no rows.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnDataTable extends ZincElement {
  static styles: CSSResultGroup = [unsafeCSS(bootStyles), unsafeCSS(styles)];
  static dependencies = {
    'zn-alert': ZnAlert,
    'zn-button': ZnButton,
    'zn-empty-state': ZnEmptyState,
    'zn-chip': ZnChip,
    'zn-hover-container': ZnHoverContainer,
    'zn-dropdown': ZnDropdown,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
    'zn-panel': ZnPanel,
    'zn-button-group': ZnButtonGroup,
    'zn-confirm': ZnConfirm,
    'zn-skeleton': ZnSkeleton,
    'zn-style': ZnStyle,
    'zn-data-table-search': ZnDataTableSearch,
  };

  @property({attribute: 'data-uri'}) dataUri: string;
  @property({attribute: 'data', type: Object}) data: Row[] | Row = [];
  @property({attribute: 'sort-column'}) sortColumn: string;
  @property({attribute: 'sort-direction'}) sortDirection: string = "asc";
  @property({attribute: 'local-sort', type: Boolean}) localSort: boolean = false;
  @property({attribute: 'filter'}) filter: string = '';
  @property({attribute: 'search'}) search: string = '';
  @property({attribute: 'wide-column'}) wideColumn: string;
  @property({attribute: 'key'}) key: string = 'id';
  @property({attribute: 'headers', type: Object}) headers: Record<string, HeaderConfig> = {};

  @property({attribute: false}) displayTemplates: Record<string, DisplayTemplate> = {};

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

  // Hide the column select dropdown in the table header
  @property({attribute: 'hide-column-select', type: Boolean}) hideColumnSelect: boolean = false;

  // Hide the refresh button in the table header
  @property({attribute: 'hide-refresh', type: Boolean}) hideRefresh: boolean = false;

  // Wraps the caption, header controls, rows and pagination in a zn-panel
  @property({type: Boolean}) standalone: boolean = false;

  @property() caption: string;

  @property({attribute: "empty-state-caption"}) emptyStateCaption: string;

  @property({attribute: "empty-state-icon"}) emptyStateIcon: string = "data_alert";

  // Hide the checkbox column
  @property({attribute: 'hide-checkboxes', type: Boolean}) hideCheckboxes: boolean;

  @property() filters: [] = [];

  @property() method: 'GET' | 'POST' = 'POST';

  @property({attribute: "no-initial-load", type: Boolean}) noInitialLoad: boolean = false;

  /**
   * When set, the table's non-default state (search, filter, sort, page, per-page and field values)
   *is mirrored to the URL query string and restored from it on load, so the view is shareable.
   */
  @property({attribute: 'sharable', type: Boolean}) sharable: boolean = false;

  @property({attribute: 'group-by'}) groupBy = '';

  @property() groups = '';

  @property({attribute: 'per-page-size', type: Number}) itemsPerPage: number = DEFAULT_PER_PAGE;
  @query('#select-all-rows') selectAllButton: ZnButton;

  // Data Table Properties
  private _initialLoad = true;
  private _hasLoadedData = false;
  private _lastLoadHadRows = false;
  private _lastTableContent: TemplateResult = html``;

  // Sharable (URL <-> state) sync
  private _sharableInitialised = false;
  private _sharableDefaults: Record<string, string> | null = null;
  private readonly _urlManagedKeys = new Set<string>(['search', 'filter', 'sortColumn', 'sortDirection', 'page', 'perPage']);

  private readonly resizeObserver = new ResizeController(this, {
    target: null,
    callback: () => {
      if (this.tableContainer) {
        this.tableContainer.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    },
  });

  // private itemsPerPage: number = DEFAULT_PER_PAGE;
  private page: number = DEFAULT_PAGE;
  private totalPages: number;
  private _totalRows = 0;

  private _rows: Row[] = [];

  private _suggestionsKey = '';

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
    'empty-state',
    'no-results'
  );

  private _dataTask = new Task(this, {
    task: async ([dataUri, requestParams], {signal}) => {
      // Every request path funnels through the task, so this is the single place to mirror the
      // current (non-default) state to the URL when `sharable` is set.
      this._updateSharableUrl();

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

      // Inputs-slot values are context/system params (e.g. csrf token, package name) sent with
      // every request - they stay at the root of the payload.
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

      // Search-related fields (from <zn-data-table-search>'s `fields` slot, delivered via
      // requestParams) are wrapped under `searchFields` so the backend can bind them to a single
      // map rather than arbitrary root-level keys. `q` mirrors the search text; the root `search`
      // key is still sent for back-compatibility. Empty values are dropped, and `searchFields` is
      // null when nothing meaningful remains so the backend can treat it as "no search".
      const searchFields: Record<string, any> = {};
      if (requestParams && typeof requestParams === 'object') {
        for (const [key, value] of Object.entries(requestParams as Record<string, unknown>)) {
          if (value !== undefined && value !== null && value !== '') {
            searchFields[key] = value;
          }
        }
      }
      if (this.search || Object.keys(searchFields).length > 0) {
        searchFields.q = this.search;
      }

      requestData.searchFields = Object.keys(searchFields).length > 0 ? searchFields : null;

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

  private _expandedRows: Set<string> = new Set();
  private _hiddenCells: Map<string, Cell[]> = new Map();
  private _secondaryHeaders: HeaderConfig[];
  @state() private _deselectedColumns: Set<string> = new Set();
  @state() private _filtersOpen = false;
  private _columnDefaultsApplied = false;
  private _formatTemplates: Record<string, DisplayTemplate> = defaultTemplates;

  requestParams: Record<string, any> = {};

  refresh() {
    // Allow manual refresh to trigger the first data load when no-initial-load is set
    this._initialLoad = false;
    this._dataTask.run().then(r => r);
  }

  // Headers that make up the visible columns, in header order
  private visibleHeaders(): HeaderConfig[] {
    return this.selectableHeaders().filter((header: HeaderConfig) => this.isColumnVisible(header));
  }

  // Headers the column select can toggle - everything but the permanently hidden and secondary ones
  private selectableHeaders(): HeaderConfig[] {
    return (Object.values(this.headers) as HeaderConfig[]).filter((header: HeaderConfig) => {
      if (header.hideHeader || header.hideColumn || header.secondary) return false;

      return !Object.values(this.hiddenColumns).includes(header.key);
    });
  }

  private isColumnVisible(header: HeaderConfig): boolean {
    return header.required === true || !this._deselectedColumns.has(header.key);
  }

  private applyColumnDefaults() {
    if (this._columnDefaultsApplied) return;

    const headers = Object.values(this.headers) as HeaderConfig[];
    if (headers.length === 0) return;

    this._columnDefaultsApplied = true;
    const deselected = new Set(this._deselectedColumns);
    headers.forEach((header: HeaderConfig) => {
      if (header.default === false && header.required !== true) deselected.add(header.key);
    });
    this._deselectedColumns = deselected;
  }

  private toggleColumn(header: HeaderConfig) {
    if (header.required === true) return;

    const deselected = new Set(this._deselectedColumns);
    if (!deselected.delete(header.key)) {
      // Never let the last visible column be turned off
      if (this.visibleHeaders().length <= 1) return;
      deselected.add(header.key);
    }
    this._deselectedColumns = deselected;
  }

  // Reserved (non-field) URL param names that map onto dedicated table state.
  private static readonly _sharableKnownKeys = ['search', 'filter', 'sortColumn', 'sortDirection', 'page', 'perPage'];

  /**
   * Snapshot the initial (attribute-provided) value of every managed key, so the URL writer can
   * omit any key still holding its default - e.g. the table's default sort/direction, page 1 or the
   * default page size. Captured once, before the URL is read, so URL values are treated as deltas.
   */
  private _captureSharableDefaults() {
    if (this._sharableDefaults) return;
    this._sharableDefaults = {
      search: this.search || '',
      filter: this.filter || '',
      sortColumn: this.sortColumn || '',
      sortDirection: this.sortDirection || '',
      page: String(this.page),
      perPage: String(this.itemsPerPage),
    };
  }

  /**
   * Seed the table state from the URL query string (raw param names) when `sharable` is set. Runs
   * once, before the first render, so the initial data request already carries the shared state.
   */
  private _readSharableState() {
    if (!this.sharable || this._sharableInitialised) return;
    if (typeof window === 'undefined') return;
    this._sharableInitialised = true;

    const params = new URLSearchParams(window.location.search);
    let hasRelevant = false;

    if (params.has('search')) {
      this.search = params.get('search')!;
      hasRelevant = true;
    }
    if (params.has('filter')) {
      this.filter = params.get('filter')!;
      hasRelevant = true;
    }
    if (params.has('sortColumn')) {
      this.sortColumn = params.get('sortColumn')!;
      hasRelevant = true;
    }
    if (params.has('sortDirection')) {
      this.sortDirection = params.get('sortDirection')!;
      hasRelevant = true;
    }
    if (params.has('page')) {
      const page = parseInt(params.get('page')!, 10);
      if (!isNaN(page) && page > 0) this.page = page;
      hasRelevant = true;
    }
    if (params.has('perPage')) {
      const perPage = parseInt(params.get('perPage')!, 10);
      if (!isNaN(perPage) && perPage > 0) this.itemsPerPage = perPage;
      hasRelevant = true;
    }

    // Any remaining param is adopted as an extra field value only when it maps to an actual field in
    // the table. Unrelated params (e.g. utm_*) are left untouched so they survive the round-trip.
    const known = new Set(ZnDataTable._sharableKnownKeys);
    const extras: Record<string, any> = {};
    params.forEach((value, key) => {
      if (known.has(key) || !this._hasFieldNamed(key)) return;
      hasRelevant = true;
      this._urlManagedKeys.add(key);
      extras[key] = value;
    });
    if (Object.keys(extras).length > 0) {
      this.requestParams = {...this.requestParams, ...extras};
    }

    // A shared link must render results even when no-initial-load is set - otherwise the recipient
    // would land on an empty table. Force the first load when the URL carries relevant params.
    if (hasRelevant && this.noInitialLoad) {
      this._initialLoad = false;
    }
  }

  /**
   * Push the shared state back into the actual DOM fields so the UI reflects it. The search value
   * lives on the slotted <zn-data-table-search>, the filter on <zn-data-table-filter>, and extra
   * field params on the search/inputs fields (all light-DOM descendants).
   */
  private _populateSharableFields() {
    if (this.search) {
      const searchEl = this.querySelector('zn-data-table-search') as (Element & { value?: unknown }) | null;
      if (searchEl) searchEl.value = this.search;
    }

    if (this.filter) {
      const filterEl = this.querySelector('zn-data-table-filter') as (Element & { value?: unknown }) | null;
      if (filterEl) filterEl.value = this.filter;
    }

    const known = new Set(ZnDataTable._sharableKnownKeys);
    Object.entries(this.requestParams).forEach(([name, value]) => {
      if (known.has(name) || name === 'searchUri' || value === undefined || value === null) return;
      this._setSharableFieldValue(name, String(value));
    });
  }

  private _hasFieldNamed(name: string): boolean {
    try {
      const selector = `[name="${window.CSS && CSS.escape ? CSS.escape(name) : name}"]`;
      return this.querySelector(selector) !== null;
    } catch {
      return false;
    }
  }

  private _setSharableFieldValue(name: string, value: string) {
    let selector: string;
    try {
      selector = `[name="${window.CSS && CSS.escape ? CSS.escape(name) : name}"]`;
    } catch {
      selector = `[name="${name}"]`;
    }

    this.querySelectorAll(selector).forEach((field) => {
      (field as Element & { value?: unknown }).value = value;
      // Custom elements may read the value from the attribute (and it survives an upgrade).
      if (field.tagName.includes('-')) {
        field.setAttribute('value', value);
      }
    });
  }

  /**
   * Mirror the current table state to the URL query string (raw param names) via replaceState.
   * A key is written only when its value differs from the captured default, so the default sort,
   * page 1, the default page size and empty search/filter/fields never clutter the URL. Unrelated
   * params (e.g. utm_*) are preserved.
   */
  private _updateSharableUrl() {
    if (!this.sharable || !window?.history) return;
    const defaults: Record<string, string> = this._sharableDefaults ?? {};

    const params = new URLSearchParams(window.location.search);

    // Drop every key the table manages, then re-add only the ones that differ from their default.
    this._urlManagedKeys.forEach((key) => params.delete(key));

    const setParam = (key: string, value: unknown) => {
      this._urlManagedKeys.add(key);
      const str = value === undefined || value === null ? '' : String(value);
      if (str === '' || str === (defaults[key] || '')) return;
      params.set(key, str);
    };

    // Extra field values (searchFields) - their default is empty, so setParam writes them only when set.
    const known = new Set(ZnDataTable._sharableKnownKeys);
    Object.entries(this.requestParams).forEach(([key, value]) => {
      if (known.has(key) || key === 'searchUri') return;
      setParam(key, value);
    });

    setParam('search', this.search);
    setParam('filter', this.filter);
    setParam('sortColumn', this.sortColumn);
    setParam('sortDirection', this.sortDirection);
    setParam('page', this.page);
    setParam('perPage', this.itemsPerPage);


    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', newUrl);
  }

  render() {
    this.applyColumnDefaults();

    // If no-initial-load is set, do not invoke the Task on the first render
    let tableBody: TemplateResult = html``;
    let emptyBody = false;
    if (this.noInitialLoad && this._initialLoad) {
      tableBody = html`
        <slot name="empty-state"></slot>`;
      emptyBody = true;
    } else if (this.dataUri) {
      tableBody = this._dataTask.render({
        pending: () => {
          // Show the skeleton until data has rendered at least once, so the
          // first fetch on a no-initial-load table doesn't render blank space.
          // Also show it when the last load had no rows - a reduced-opacity
          // empty state gives no visible indication that a search is running
          if (this._initialLoad || !this._hasLoadedData || !this._lastLoadHadRows) {
            return html`
              <div>${this.loadingTable()}</div>`;
          }
          return html`
            <div class="reduced-opacity">${this._lastTableContent}</div>`;
        },
        complete: (data) => {
          this._initialLoad = false;
          this._hasLoadedData = true;
          this._lastLoadHadRows = ((data as Response)?.rows?.length ?? 0) > 0;
          emptyBody = !this._lastLoadHadRows;
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
    } else if (Array.isArray(this.data) ? this.data.length > 0 : !!this.data) {
      const rows: Row[] = Array.isArray(this.data) ? this.data : [this.data];
      const response: Response = {
        rows,
        perPage: rows.length,
        total: rows.length,
        page: 1,
      };
      this._initialLoad = false;
      this._hasLoadedData = true;
      this._lastLoadHadRows = rows.length > 0;
      this._lastTableContent = html`
        <div>${this.renderTable(response)}</div>`;
      tableBody = this._lastTableContent;
    }

    const hasActions = this.hasSlotController.test(ActionSlots.delete.valueOf())
      || this.hasSlotController.test(ActionSlots.modify.valueOf())
      || this.hasSlotController.test(ActionSlots.create.valueOf())
      || this.hasSlotController.test(ActionSlots.sort.valueOf())
      || this.hasSlotController.test(ActionSlots.search.valueOf());

    const hasInputs = this.hasSlotController.test(ActionSlots.inputs.valueOf());
    const hasControls = hasActions || this.hasColumnSelect() || this.hasRefresh();

    // An empty state with no header has nothing to hang off the panel, and consumers
    // often bring their own panel for it, so let it stand on its own
    const bareEmptyState = emptyBody && !hasControls && !this.caption;

    // The filter bar is inline, so it gets its own row rather than a slot in the header
    const filters = this.hasSlotController.test(ActionSlots.filter.valueOf())
      ? html`
        <div class="table__filters" ?hidden="${!this._filtersOpen}">
          <slot name="${ActionSlots.filter.valueOf()}"></slot>
        </div>`
      : nothing;

    // Headers do not need to be re-rendered with new data
    return html`
      <div class="table-container" ${ref((el) => (this.tableContainer = el))}>
        ${hasInputs ? html`
          <slot name="${ActionSlots.inputs.valueOf()}" style="display: none"></slot>` : null}
        <slot name="${ActionSlots.filter_top.valueOf()}"></slot>
        ${this.standalone && !bareEmptyState
          ? html`
            <zn-panel caption="${ifDefined(this.caption || undefined)}" flush>
              ${hasControls ? html`
                <div slot="actions" class="table__header__right">
                  ${this.getActions()}
                  ${this.getHeaderControls()}
                </div>` : nothing}
              ${filters}
              ${tableBody}
              ${this.getTableFooter('footer')}
            </zn-panel>`
          : html`
            ${hasControls || this.caption ? this.getTableHeader() : nothing}
            ${filters}
            ${tableBody}
            ${this.getTableFooter()}`}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('zn-filter-change', this.filterChangeListener);
    this.addEventListener('zn-clear', this.filterClearListener);
    this.addEventListener('zn-search-change', this.searchChangeListener);
    // Capture defaults before reading the URL so URL values are treated as deltas, then seed state.
    this._captureSharableDefaults();
    this._readSharableState();
  }

  protected firstUpdated() {
    // Push the shared state back into the slotted fields once they exist in the DOM.
    if (this.sharable) {
      this._populateSharableFields();
    }
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this.publishFilterSuggestions();
  }

  // The filter bar can't see the data, so hand it the values already on screen to type against
  private publishFilterSuggestions() {
    const bar = this.querySelector('zn-data-table-filter');
    if (!bar || this._rows.length === 0) return;

    const suggestions: Record<string, string[]> = {};

    this._rows.forEach((row: Row) => row.cells.forEach((cell: Cell) => {
      const text = cell.text?.trim();
      if (!text) return;

      const values = suggestions[cell.column] ?? (suggestions[cell.column] = []);
      if (values.length < SUGGESTION_LIMIT && !values.includes(text)) values.push(text);
    }));

    const key = JSON.stringify(suggestions);
    if (key === this._suggestionsKey) return;

    this._suggestionsKey = key;
    bar.suggestions = suggestions;
  }

  private getTemplate(name: string): DisplayTemplate | undefined {
    return this.displayTemplates[name] ?? this._formatTemplates[name];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('zn-filter-change', this.filterChangeListener);
    this.removeEventListener('zn-clear', this.filterClearListener);
    this.removeEventListener('zn-search-change', this.searchChangeListener);
  }

  // Clearing the filters leaves an empty row behind, so fold it away
  filterClearListener = (e: Event) => {
    if (e.target instanceof ZnDataTableFilter) {
      this._filtersOpen = false;
    }
  }

  filterChangeListener = (e: ZnFilterChangeEvent) => {
    if (e.target instanceof ZnDataTableFilter) {
      this.filter = (e.target as ZnDataTableFilter).value as string;
      this._dataTask.run().then(r => r);
    }
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

  // A table narrowed by a search or filter has rows, just none matching them, so
  // its empty state must not claim there is nothing to create
  private get isNarrowed(): boolean {
    return this.search.length > 0 || this.filter.length > 0;
  }

  emptyState() {
    if (this.isNarrowed || (this.noInitialLoad && !this._initialLoad)) {
      return html`
        <div class="table--empty">
          <slot name="no-results">
            <zn-empty-state caption="No Results Found" icon="search">
              <p>Nothing matched your search. Try adjusting your filters.</p>
            </zn-empty-state>
          </slot>
        </div>`;
    }

    return html`
      <div class="table--empty">
        <slot name="empty-state">
          <zn-empty-state
            caption="${this.emptyStateCaption ? this.emptyStateCaption : (this.caption ? "No " + this.caption.toLowerCase() + " found" : "No data found")}"
            icon="${this.emptyStateIcon}">
          </zn-empty-state>
        </slot>
      </div>`;
  }

  renderTable(data: Response) {
    this.itemsPerPage = Math.max(DEFAULT_PER_PAGE, data.perPage ?? DEFAULT_PER_PAGE);
    this.page = Math.max(1, data.page ?? DEFAULT_PAGE);
    this._totalRows = Math.max(0, data.total ?? 0);
    this.totalPages = Math.ceil(Math.max(1, data.total) / this.itemsPerPage);

    const error = data?.error?.text ? data.error : undefined;

    if (!data?.rows || data.rows.length === 0) {
      return html`${error ? html`
        <div class="table__error">${this.renderErrorAlert(error)}</div>` : nothing}${this.emptyState()}`;
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

      const groups: RowGroup[] = Object.keys(groupedRows).map((groupKey) => ({
        label: (groupKey === 'Ungrouped' || groupKey === '*') ? '' : groupKey,
        rows: groupedRows[groupKey],
      }));

      return this.renderTableData(groups, error);
    }

    return this.renderTableData([{label: '', rows: this._rows}], error);
  }

  private renderErrorAlert(error: ResponseError) {
    return html`
      <zn-alert level="${error.level ?? 'error'}"
                icon="${ifDefined(error.icon)}"
                size="small"
                center>${error.text}
      </zn-alert>`;
  }

  public humanize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public renderTableData(groups: RowGroup[], error?: ResponseError) {
    // Primary (visible) headers exclude those explicitly hidden, deselected and those marked as secondary
    const filteredHeaders = this.visibleHeaders();

    // Secondary headers (shown in expandable details)
    this._secondaryHeaders = Object.values(this.headers).filter((header: HeaderConfig) => {
      if (header.hideColumn) return false;

      if (Object.values(this.hiddenColumns).includes(header.key)) return false;

      return header.secondary === true;
    });

    this.rowHasActions = this._rows.some((row: Row) => row.actions && row.actions.length > 0);

    // Compute and store hidden cells per row (secondary items only), and reorder visible cells to match header order
    const secondaryKeys = new Set(this._secondaryHeaders.map(h => h.key));
    this._hiddenCells.clear();
    const visibleRowCells: Map<string, Cell[]> = new Map();

    this._rows.forEach((row: Row) => {
      const originalCells = Array.isArray(row.cells) ? row.cells : [];
      const orderedCells: Cell[] = [];

      const hiddenCells = originalCells.filter((c: Cell) => secondaryKeys.has(c.column));
      this._hiddenCells.set(row.id, hiddenCells);

      filteredHeaders.forEach((header: HeaderConfig) => {
        const cell = originalCells.find((c: Cell) => c.column === header.key);
        if (cell) {
          orderedCells.push(cell);
        } else {
          orderedCells.push({text: '', column: header.key});
        }
      });

      visibleRowCells.set(row.id, orderedCells);
    });

    const anyHidden = this.hasHiddenColumns();
    const colCount = filteredHeaders.length + (this.rowHasActions ? 1 : 0) + (anyHidden ? 1 : 0);

    return html`
      <div class="table__scroll">
        <table class="${classMap({
          'table': true,
          'with-hover': !this.unsortable && !this.hideCheckboxes,
        })}">
          <thead>
          <tr>
            ${anyHidden ? html`
              <th class="table__head table__head--expander"></th>` : nothing}
            ${filteredHeaders.map((header: HeaderConfig) => this.renderCellHeader(header))}
            ${this.rowHasActions ? html`
              <th></th>` : html``}
          </tr>
          </thead>
          <tbody>
          ${error ? html`
            <tr class="table__row--error">
              <td colspan="${colCount}">${this.renderErrorAlert(error)}</td>
            </tr>` : nothing}
          ${groups.map((group: RowGroup) => html`
            ${group.label ? html`
              <tr class="table__row--group">
                <th colspan="${colCount}" scope="colgroup">${group.label}</th>
              </tr>` : nothing}
            ${group.rows.map((row: Row) => html`
              <tr class="${classMap({
                'table__row--selected': this.isRowSelected(row),
                'table__row--data': true,
              })}" data-row-id="${row.id}">
                ${anyHidden ? this.renderExpanderCell(row) : nothing}
                ${(visibleRowCells.get(row.id) || row.cells).map((value: Cell, index: number) => this.renderCellBody(index, value, row))}
                ${this.rowHasActions ? this.renderActions(row) : nothing}
              </tr>
              ${this._expandedRows.has(row.id) ? this.renderDetailsRow(row, colCount) : nothing}
            `)}
          `)}
          </tbody>
        </table>
      </div>
    `;
  }

  getTableHeader() {
    return html`
      <div class="table__header">
        <div class="table__header__actions">
          ${this.caption ? html`
            <h3 class="table__header__caption">${this.caption}</h3>` : nothing}
          ${this.getActions()}
        </div>
        <div class="table__header__right">
          ${this.getHeaderControls()}
        </div>
      </div>
    `;
  }

  private getHeaderControls() {
    return html`
      ${this.getColumnSelect()}
      ${this.getFilterToggle()}
      ${this.getRefreshButton()}
      <slot name="${ActionSlots.sort.valueOf()}"></slot>
      <slot name="${ActionSlots.search.valueOf()}"></slot>
      <slot name="${ActionSlots.create.valueOf()}"></slot>`;
  }

  // Nothing to pick columns on or refresh into while the table has no rows
  private hasRows(): boolean {
    return this._hasLoadedData && this._lastLoadHadRows;
  }

  private getFilterToggle() {
    if (!this.hasSlotController.test(ActionSlots.filter.valueOf())) return nothing;

    const applied = this.appliedFilterCount();

    return html`
      <zn-button icon-button="small"
                 icon="funnel@lu"
                 icon-size="18"
                 tooltip="Filter"
                 aria-label="Filter"
                 muted-notifications
                 notification="${applied || nothing}"
                 aria-pressed="${this._filtersOpen}"
                 class="${classMap({'table__header__toggle--active': applied > 0})}"
                 @click="${this.toggleFilters}">
      </zn-button>`;
  }

  private toggleFilters = () => {
    this._filtersOpen = !this._filtersOpen;
  }

  private appliedFilterCount(): number {
    if (!this.filter) return 0;

    try {
      const applied: unknown = JSON.parse(atob(this.filter));
      return Array.isArray(applied) ? applied.length : 0;
    } catch {
      return 0;
    }
  }

  private hasColumnSelect(): boolean {
    return !this.hideColumnSelect && this.hasRows() && this.selectableHeaders().length > 1;
  }

  private hasRefresh(): boolean {
    return !this.hideRefresh && this.hasRows() && !!this.dataUri;
  }

  private getColumnSelect() {
    if (!this.hasColumnSelect()) return nothing;

    return html`
      <zn-dropdown placement="bottom-end" stay-open-on-select>
        <zn-button slot="trigger"
                   icon-button="small"
                   icon="columns-3@lu"
                   icon-size="18"
                   tooltip="Columns"
                   aria-label="Select columns">
        </zn-button>
        <zn-menu variant="shell" @zn-menu-select="${this.handleColumnSelect}">
          ${this.selectableHeaders().map((header: HeaderConfig) => html`
            <zn-menu-item type="checkbox"
                          value="${header.key}"
                          ?checked="${this.isColumnVisible(header)}"
                          ?disabled="${header.required === true}">${header.label}
            </zn-menu-item>`)}
        </zn-menu>
      </zn-dropdown>`;
  }

  private getRefreshButton() {
    if (!this.hasRefresh()) return nothing;

    return html`
      <zn-button icon-button="small"
                 icon="refresh-cw@lu"
                 icon-size="18"
                 tooltip="Refresh"
                 aria-label="Refresh data"
                 @click="${this.refresh}">
      </zn-button>`;
  }

  private handleColumnSelect = (event: CustomEvent<{ value: string }>) => {
    const header = (Object.values(this.headers) as HeaderConfig[])
      .find((h: HeaderConfig) => h.key === event.detail.value);

    if (header) this.toggleColumn(header);
  }

  // Returns null when there is nothing to show, so a panel footer is only slotted when it has content
  getTableFooter(slot?: string) {
    if (!this._hasLoadedData) return null;

    const rowSelected = this.getRowsSelected();
    const pagination = this.getPagination();
    const rowsPerPage = this.getRowsPerPage();

    if (rowSelected === null && pagination === null && rowsPerPage === null) return null;

    return html`
      <div class="${classMap({
        'table__footer': true,
        'table__footer--panel': !!slot,
      })}" slot="${ifDefined(slot)}">
        <div class="table__footer__left">
          ${pagination}
          ${rowSelected}
        </div>
        <div class="table__footer__right">
          ${rowsPerPage}
        </div>
      </div>`;
  }

  getRowsSelected() {
    if (this.selectedRows.length <= 0) return null;

    return html`
      <p>${this.numberOfRowsSelected} of ${this._rows.length} rows selected</p>`
  }

  getRowsPerPage() {
    if (this.hidePagination) return null;

    const optionsRowsPerPage = [10, 20, 30, 40, 50];

    // Keyed to the dataset, not the current page size - raising the size past the total
    // must not hide the only control that can lower it again
    if (this._totalRows <= optionsRowsPerPage[0]) return null;

    return html`
      <div class="table__footer__rows-per-page">
        <p>Rows</p>
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

  // A window of PAGE_WINDOW pages that slides with the current page and stays inside the page
  // count; the first/last buttons cover jumping to either end
  private getPageRange(): number[] {
    const size = Math.min(PAGE_WINDOW, this.totalPages);
    const start = Math.min(
      Math.max(1, this.page - Math.floor(size / 2)),
      this.totalPages - size + 1
    );

    return Array.from({length: size}, (_, i) => start + i);
  }

  getPagination() {
    if (this.hidePagination || this.totalPages <= 1) return null;

    return html`
      <zn-button-group>
        <zn-button @click="${this.page !== 1 ? this.goToFirstPage : undefined}"
                   ?disabled="${this.page === 1}"
                   icon="chevrons-left@lu"
                   icon-button="small"
                   label="First page">
        </zn-button>
        <zn-button @click="${this.page !== 1 ? this.goToPreviousPage : undefined}"
                   ?disabled="${this.page === 1}"
                   icon="chevron-left@lu"
                   icon-button="small"
                   label="Previous page">
        </zn-button>
        ${this.getPageRange().map((p: number) => html`
          <zn-button @click="${p !== this.page ? () => this.goToPage(p) : undefined}"
                     class="${classMap({
                       'table__footer__pagination-page': true,
                       'table__footer__pagination-page--active': p === this.page,
                     })}"
                     icon-button="small"
                     aria-current="${ifDefined(p === this.page ? 'page' : undefined)}">${p}
          </zn-button>`)}
        <zn-button @click="${this.page !== this.totalPages ? this.goToNextPage : undefined}"
                   ?disabled="${this.page === this.totalPages}"
                   icon="chevron-right@lu"
                   icon-button="small"
                   label="Next page">
        </zn-button>
        <zn-button @click="${this.page !== this.totalPages ? this.goToLastPage : undefined}"
                   ?disabled="${this.page === this.totalPages}"
                   icon="chevrons-right@lu"
                   icon-button="small"
                   label="Last page">
        </zn-button>
      </zn-button-group>`;
  }

  getActions() {
    const actions = [];

    // Select-all only earns its place alongside the bulk actions it feeds
    const hasBulkActions = this.hasSlotController.test(ActionSlots.delete.valueOf())
      || this.hasSlotController.test(ActionSlots.modify.valueOf());

    if (!hasBulkActions) {
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

    const rows = Array.from(this.renderRoot.querySelectorAll('tbody tr.table__row--data'));
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
        // Local sort never runs the data task (our URL-sync choke point), so mirror it here.
        this._updateSharableUrl();
        this.requestUpdate();
      } else {
        this._dataTask.run().then(r => r);
      }
    };
  }

  renderCell(data: Cell, row?: Row, header?: HeaderConfig): TemplateResult | ZincElement {
    const fn = (header?.type ? this.getTemplate(header.type) : undefined);

    if ((!data.text && !data.iconSrc) && header?.ifEmpty !== undefined) {
      const header2 = {...header, type: undefined, render: undefined, renderTemplate: undefined};
      return this.renderCell({...data, ...header.ifEmpty}, row, header2)
    }

    if (fn && row && header) {
      const out = fn(data, row, header);
      return typeof out === 'string' ? html`${unsafeHTML(out)}` : out;
    }

    if (!data || typeof data !== 'object') {
      return data;
    }

    if (header?.cellTemplate !== undefined) {
      data = {...header.cellTemplate, ...data}
    }

    let content: TemplateResult | ZincElement = html`${data.text}`;

    if (data.style || data.color) {
      const styleStr = typeof data.style === 'string' ? data.style : '';
      const tokens = new Set(styleStr.split(',').filter(Boolean));

      const isMono = tokens.has('mono') || tokens.has('code');
      const isBorder = tokens.has('border');
      const isCenter = tokens.has('center');
      const isMuted = tokens.has('muted');

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
          muted="${isMuted || nothing}"
          color="${ifDefined(data.color)}"
          title="${ifDefined(data.title)}"
        >${content}
        </zn-style>`;
    }

    if (data.uri) {
      content = html`
        <a href="${data.uri}"
           title="${ifDefined(data.title)}"
           data-target="${ifDefined(data.target || nothing)}"
           gaid="${ifDefined(data.gaid || nothing)}">${content}</a>`;
    }

    if (data.chipColor) {
      content = html`
        <zn-chip type="${data.chipColor}" title="${ifDefined(data.title)}">${content}</zn-chip>`;
    }


    if (data.iconSrc) {
      const src = data.iconSrc;
      const color = data.iconColor;
      const size = data.iconSize;
      const tokens = (data.iconStyle ?? '').split(',').map(s => s.trim()).filter(Boolean);

      content = html`
        <zn-icon
          src="${src}"
          size="${ifDefined(size)}"
          color="${ifDefined(color)}"
          ${ref(el => {
            if (!el) return;
            tokens.forEach(t => el.setAttribute(t, ''));
          })}
          title="${ifDefined(data.title)}"
        ></zn-icon> ${content}`;
    }

    if (data.hoverContent) {
      const placement = data.hoverPlacement ?? 'top';
      if (data.iconSrc) {
        content = html`
          <zn-hover-container placement="${placement}" flip>
            ${content}
            <div slot="content">
              ${unsafeHTML(data.hoverContent)}
            </div>
          </zn-hover-container>`;
      } else {
        content = html`
          <zn-hover-container placement="${placement}" flip>
            ${content}
            <div slot="content">
              ${unsafeHTML(data.hoverContent)}
            </div>
          </zn-hover-container>`;
      }
    }

    if (data.copyable) {
      content = html`
        ${content}
        <zn-copy-button value="${data.text}"></zn-copy-button>`;
    }


    if (data.subText) {
      content = html`
        <div>
          <div>${content}</div>
          <span class="table__cell--subtext">${data.subText}</span>
        </div>
      `
    }


    return content;

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

  private renderCellBody(index: number, value: Cell, row: Row) {
    const filteredHeaders = this.visibleHeaders();
    const header: HeaderConfig | undefined = filteredHeaders[index];
    const headerKey: string | undefined = header?.key;

    return html`
      <td
        @click="${this.hideCheckboxes ? undefined : this.selectRow}"
        class="${classMap({
          'table__cell': true,
          'table__cell--wide': headerKey === this.wideColumn,
          'table__cell--last': index === filteredHeaders.length - 1,
        })}">
        <div>${this.renderCell(value, row, header)}</div>
      </td>`;
  }

  private hasHiddenColumns(): boolean {
    return this._secondaryHeaders.length > 0;
  }

  private renderExpanderCell(row: Row) {
    const hasHidden = (this._hiddenCells.get(row.id) || []).length > 0;
    if (!hasHidden) return html`
      <td class="table__cell table__cell--expander"></td>`;

    const expanded = this._expandedRows.has(row.id);
    const icon = expanded ? 'chevron_down@lu' : 'chevron_right@lu';

    return html`
      <td class="table__cell table__cell--expander">
        <zn-button
          icon-button="small"
          plain
          icon="${icon}"
          icon-size="20"
          aria-label="${expanded ? 'Collapse row' : 'Expand row'}"
          @click="${(e: Event) => this.toggleRowExpansion(e, row)}">
        </zn-button>
      </td>`;
  }

  private renderDetailsRow(row: Row, colSpan: number) {
    const hiddenCells = this._hiddenCells.get(row.id) || [];
    if (hiddenCells.length === 0) return html``;

    return html`
      <tr class="table__row--details" data-details="true">
        <td colspan="${colSpan}">
          <div class="table__details">
            ${hiddenCells.map((cell: Cell) => {
              const header = Object.values(this.headers).find((h: HeaderConfig) => h.key === cell.column);
              const label = header?.label || this.humanize(cell.column);
              return html`
                <div class="table__details__item">
                  <div class="table__details__label">${label}</div>
                  <div class="table__details__value">${this.renderCell(cell, row, header)}</div>
                </div>`;
            })}
          </div>
        </td>
      </tr>`;
  }

  private toggleRowExpansion(e: Event, row: Row) {
    e.stopPropagation();

    if (this._expandedRows.has(row.id)) {
      this._expandedRows.delete(row.id);
    } else {
      this._expandedRows.add(row.id);
    }

    this.requestUpdate();
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
      <div class="table__scroll">
        <table class="table">
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
                     icon-button="small"
                     icon="ellipsis@lu"
                     plain
                     aria-label="Row actions">
          </zn-button>
          <zn-menu variant="shell">
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
