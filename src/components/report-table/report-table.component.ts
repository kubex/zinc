import {AnchoredPopoverController} from '../../internal/anchored-popover';
import {chartPalette, formatValue, toneClass, unitLabel} from './report-format';
import {clampRange, type DatePreset, defaultPresets, rangeLabel, todayIso} from '../date-range/date-range-math';
import {classMap} from 'lit/directives/class-map.js';
import {
  type ColumnFilter,
  columnValue,
  computeTotals,
  filterRows,
  parseColumnFilter,
  type ReportChartResponse,
  type ReportColumn,
  type ReportFilterField,
  type ReportGroup,
  type ReportLink,
  type ReportOption,
  type ReportResponse,
  type ReportRow,
  type ReportValues
} from './report-math';
import {type CSSResultGroup, html, nothing, type PropertyValues, type TemplateResult, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {ifDefined} from 'lit/directives/if-defined.js';
import {OverlayScrollbarController} from '../../internal/overlay-scrollbar';
import {property, state} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import {renderSortIcon, sortKeyHandler, type SortState} from '../../internal/table-sort';
import {repeat} from 'lit/directives/repeat.js';
import {styleMap} from 'lit/directives/style-map.js';
import {TabRowController} from '../../internal/table-tabs';
import {Task, TaskStatus} from '@lit/task';
import ZincElement from '../../internal/zinc-element';
import ZnAlert from '../alert';
import ZnButton from '../button';
import ZnChart from '../chart';
import ZnCheckbox from '../checkbox';
import ZnDataTableFilter from '../data-table-filter';
import ZnDataTableSearch from '../data-table-search';
import ZnDateRange from '../date-range';
import ZnDropdown from '../dropdown';
import ZnEmptyState from '../empty-state';
import ZnIcon from '../icon';
import ZnMenu from '../menu';
import ZnMenuItem from '../menu-item';
import ZnPanel from '../panel';
import ZnSkeleton from '../skeleton';
import ZnTray from '../tray';

import menuTriggerStyles from '../../../scss/menu-trigger.scss';
import styles from './report-table.scss';
import tableControlsStyles from '../../../scss/table-controls.scss';

const DIMENSION = '__dim';
const SHARABLE_KEYS = ['type', 'groupBy', 'from', 'to', 'filter', 'search'] as const;
type SharableKey = typeof SHARABLE_KEYS[number];
type ReportArgs = readonly [string, string, string, string, string, string];

const INPUT_TAGS = ['zn-input', 'zn-select', 'zn-query-builder', 'zn-multiselect', 'zn-params-select', 'zn-datepicker', 'input', 'select', 'textarea'];

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);
const asRecord = <T>(value: unknown): T | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as T : undefined;

function normalize(raw: unknown): ReportResponse {
  const data = asRecord<ReportResponse>(raw);
  const response: ReportResponse = {
    ...data,
    groups: asArray<ReportGroup>(data?.groups).map(group => ({...group, columns: asArray<ReportColumn>(group?.columns)})),
    rows: asArray<ReportRow>(data?.rows).map(row => ({...row, values: asRecord<ReportValues>(row?.values) ?? {}})),
    totals: asRecord<Record<string, number>>(data?.totals),
  };
  return response;
}

function rawValue(values: ReportValues, path: string): unknown {
  let current: unknown = values;
  for (const part of path.split('.')) {
    const record = asRecord<ReportValues>(current);
    current = record && Object.prototype.hasOwnProperty.call(record, part) ? record[part] : undefined;
  }
  return current;
}

/**
 * @summary A grouped report: one row per value of a dimension, read column by column, with a total row.
 * @documentation https://zinc.style/components/report-table
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-alert
 * @dependency zn-button
 * @dependency zn-chart
 * @dependency zn-checkbox
 * @dependency zn-data-table-filter
 * @dependency zn-data-table-search
 * @dependency zn-date-range
 * @dependency zn-dropdown
 * @dependency zn-empty-state
 * @dependency zn-icon
 * @dependency zn-menu
 * @dependency zn-menu-item
 * @dependency zn-panel
 * @dependency zn-skeleton
 *
 * @event zn-report-change - Emitted when the type, group by, date range or filter is changed, before the report is fetched again.
 *
 * @slot inputs - Inputs whose name and value are sent with every request (csrf tokens and similar).
 * @slot empty-state - Replaces the default empty state.
 */
export default class ZnReportTable extends ZincElement {
  static styles: CSSResultGroup = [unsafeCSS(styles), unsafeCSS(tableControlsStyles), unsafeCSS(menuTriggerStyles)];

  protected readonly reportScrollbar = new OverlayScrollbarController(this, () => this.renderRoot.querySelector<HTMLElement>('.report__scroll'));
  static dependencies = {
    'zn-alert': ZnAlert,
    'zn-button': ZnButton,
    'zn-chart': ZnChart,
    'zn-checkbox': ZnCheckbox,
    'zn-date-range': ZnDateRange,
    'zn-dropdown': ZnDropdown,
    'zn-empty-state': ZnEmptyState,
    'zn-tray': ZnTray,
    'zn-icon': ZnIcon,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
    'zn-data-table-filter': ZnDataTableFilter,
    'zn-data-table-search': ZnDataTableSearch,
    'zn-panel': ZnPanel,
    'zn-skeleton': ZnSkeleton,
  };

  @property({attribute: 'data-uri'}) dataUri: string;
  @property() method: 'GET' | 'POST' = 'POST';
  @property() caption = '';
  @property({reflect: true}) type = '';
  @property({attribute: 'group-by', reflect: true}) groupBy = '';
  @property({reflect: true}) from = '';
  @property({reflect: true}) to = '';
  @property({reflect: true}) filter = '';
  @property() currency = 'USD';
  @property() locale: string;

  /** Report types, shown as tabs when there are two or more. `type` defaults to the first. */
  @property({type: Array}) types: ReportOption[] = [];

  /** Group by options; those with a `category` are listed under its heading. */
  @property({attribute: 'group-bys', type: Array}) groupBys: ReportOption[] = [];

  /** Fields for the funnel's filter builder. The funnel is hidden when there are none. */
  @property({attribute: 'filter-fields', type: Array}) filterFields: ReportFilterField[] = [];

  /** Quick ranges for the date range, replacing the default ones. */
  @property({type: Array}) presets: DatePreset[] | undefined;

  /** The latest day that can be picked. Defaults to today. */
  @property({attribute: 'max-date'}) maxDate = '';

  /** A short line shown under the date range's calendar. */
  @property({attribute: 'date-note'}) dateNote = '';

  @property({attribute: 'search-placeholder'}) searchPlaceholder = '';

  /** Mirrors the type, group by, dates, filter and search to the URL query string, and reads them back on load. */
  @property({type: Boolean}) sharable = false;

  /** Leaves out columns that are zero or empty in every row, and groups left without columns. */
  @property({attribute: 'hide-empty-columns', type: Boolean}) hideEmptyColumns = false;

  /** Gives each row a tick box that highlights it, with one in the heading for every row shown. */
  @property({type: Boolean}) selectable = false;

  /** Shades number cells by their size against the largest in their column. */
  @property({type: Boolean}) heatmap = false;

  /**
   * Where ticked rows are charted from. Adds a Chart button and a column picker to the bar shown while rows are ticked,
   * and implies `selectable`.
   */
  @property({attribute: 'chart-uri'}) chartUri = '';

  /** Adds a row under the headings for filtering the rows shown by each column's values, without fetching again. */
  @property({attribute: 'column-filters', type: Boolean}) columnFilters = false;

  @state() protected response: ReportResponse | null = null;
  @state() protected search = '';
  @state() private sortKey = '';
  @state() private trayCollapsed = false;
  @state() private sortDirection: 'asc' | 'desc' = 'desc';
  @state() private selected = new Set<string>();
  @state() private filterText: Record<string, string> = {};
  @state() private focusedFilter = '';
  @state() private filterAnchor: DOMRect | null = null;
  @state() private chartOpen = false;
  @state() private filtersOpen = false;
  @state() private chartMetric = '';

  private sharableDefaults: Record<SharableKey, string> | null = null;
  private adoption: {from: string; to: string} | null = null;
  private dimObserver: ResizeObserver | null = null;

  private readonly groupByPopover = new AnchoredPopoverController(this, {
    trigger: '.report__groupby',
    popover: '.report__gpop',
    width: () => Math.min(this.hasCategories() ? 560 : 506, window.innerWidth * 0.94),
    align: 'end',
    focus: ['.report__gopt[aria-current="true"]', '.report__gopt'],
  });

  private readonly filterEl = document.createElement('zn-data-table-filter');

  private readonly tabRow = new TabRowController(this, {onSelect: (value: string) => {
    if (value !== this.type) this.change({type: value});
  }});

  private readonly hasSlotController = new HasSlotController(this, 'inputs', 'empty-state');

  private readonly _task = new Task(this, {
    task: async ([dataUri], {signal}) => {
      if (!dataUri) {
        return null;
      }
      const body = {type: this.type, groupBy: this.groupBy, from: this.from, to: this.to, filter: this.filter, ...this.inputParams()};
      const response = await fetch(dataUri, {
        method: this.method,
        headers: {'x-kx-fetch-style': 'zn-report-table'},
        signal,
        credentials: 'same-origin',
        body: this.method === 'POST' ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return normalize(await response.json());
    },
    args: (): ReportArgs => [this.dataUri, this.type, this.groupBy, this.from, this.to, this.filter],
    // A group by adopted from the response is what was just fetched, so it doesn't fetch again
    argsEqual: (previous: ReportArgs, next: ReportArgs) => {
      const adoption = this.adoption;
      this.adoption = null;
      return previous.every((value, index) => value === next[index]
        || (index === 2 && adoption?.from === value && adoption.to === next[index]));
    },
    onComplete: (result) => {
      this.response = result;
      if (result?.groupBy && result.groupBy !== this.groupBy) {
        this.adoption = {from: this.groupBy, to: result.groupBy};
        this.groupBy = result.groupBy;
      }
    },
  });

  private readonly chartTask = new Task(this, {
    task: async ([chartUri, open, metric, ids], {signal}) => {
      if (!chartUri || !open || !metric || !ids) return null;
      const body = {
        type: this.type, groupBy: this.groupBy, from: this.from, to: this.to, filter: this.filter,
        metric, rows: ids.split('\n'), ...this.inputParams(),
      };
      const response = await fetch(chartUri, {
        method: this.method,
        headers: {'x-kx-fetch-style': 'zn-report-table-chart'},
        signal,
        credentials: 'same-origin',
        body: this.method === 'POST' ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = asRecord<ReportChartResponse>(await response.json());
      return {labels: asArray<string>(data?.labels), series: asArray<ReportChartResponse['series'][number]>(data?.series)};
    },
    args: () => [
      this.chartUri, this.chartOpen, this.chartColumn()?.key ?? '', this.chartRows().map(row => row.id).join('\n'),
      this.type, this.groupBy, this.from, this.to, this.filter,
    ] as const,
  });

  connectedCallback() {
    super.connectedCallback();
    this.filterEl.addEventListener('zn-filter-change', this.handleFilter);
    this.readSharableState();
  }

  protected willUpdate() {
    if (!this.type && this.types.length > 0) {
      this.type = this.types[0].value;
    }
    this.filterEl.filters = this.activeFilterFields();
    this.filterEl.value = this.filter;
  }

  protected updated(changed: PropertyValues) {
    const help = this.shadowRoot?.querySelector<HTMLElement>('.report__fhelp');
    if (help && !help.matches(':popover-open')) help.showPopover();
    if (this.sharable && SHARABLE_KEYS.some(key => changed.has(key))) {
      this.writeSharableState();
    }
  }

  refresh(): Promise<void> {
    return this._task.run();
  }

  protected visibleRows(): ReportRow[] {
    const query = this.search.trim().toLowerCase();
    const rows = (this.response?.rows ?? []).filter(row => !query || String(row.label ?? '').toLowerCase().includes(query));
    const filters = this.activeColumnFilters().map(({column, filter}) => ({filter, value: (row: ReportRow) => this.filterValue(column, row)}));
    return this.sortRows(filters.length > 0 ? filterRows(rows, filters) : rows);
  }

  protected totalsFor(rows: ReportRow[]): Record<string, number | null> {
    const columns = this.columns();
    const server = this.response?.totals;
    if (server && !this.search.trim() && this.activeColumnFilters().length === 0) {
      return Object.fromEntries(columns.map(column => [column.key, typeof server[column.key] === 'number' ? server[column.key] : null]));
    }
    return computeTotals(columns, rows);
  }

  protected columns(): ReportColumn[] {
    return (this.response?.groups ?? []).flatMap(group => group.columns);
  }

  private activeColumnFilters(): {column: ReportColumn; filter: ColumnFilter}[] {
    if (!this.columnFilters) return [];
    return [this.dimensionColumn(), ...this.columns()].flatMap(column => {
      const filter = parseColumnFilter(this.filterText[column.key] ?? '', column.format === 'text');
      return filter ? [{column, filter}] : [];
    });
  }

  private dimensionColumn(): ReportColumn {
    return {key: DIMENSION, label: this.dimensionLabel() || 'Name', format: 'text'};
  }

  // Percentages are typed as shown, so 5 means 5%
  private filterValue(column: ReportColumn, row: ReportRow): number | string {
    if (column.key === DIMENSION) return String(row.label ?? '');
    const value = this.cellValue(column, row) ?? '';
    return typeof value === 'number' && column.format === 'percent' ? value * 100 : value;
  }

  private sortRows(rows: ReportRow[]): ReportRow[] {
    if (!this.sortKey) return rows;
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    const column = this.columns().find(c => c.key === this.sortKey);
    if (this.sortKey !== DIMENSION && !column) return rows;

    const textOf = (row: ReportRow) => this.sortKey === DIMENSION ? String(row.label ?? '') : String(this.cellValue(column!, row) ?? '');
    const compare = this.sortKey === DIMENSION || column!.format === 'text'
      ? (a: ReportRow, b: ReportRow) => textOf(a).localeCompare(textOf(b), undefined, {numeric: true})
      : (a: ReportRow, b: ReportRow) => columnValue(column!, a.values) - columnValue(column!, b.values);
    return [...rows].sort((a, b) => compare(a, b) * direction);
  }

  private sortState(key: string): SortState {
    if (this.sortKey !== key) return 'none';
    return this.sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  private cycleSort(key: string) {
    if (this.sortKey !== key) {
      this.sortKey = key;
      this.sortDirection = 'desc';
    } else if (this.sortDirection === 'desc') {
      this.sortDirection = 'asc';
    } else {
      this.sortKey = '';
    }
  }

  private change(patch: Partial<Pick<ZnReportTable, 'type' | 'groupBy' | 'from' | 'to' | 'filter'>>) {
    if (patch.groupBy !== undefined && patch.groupBy !== this.groupBy) {
      this.selected = new Set();
      this.chartOpen = false;
    }
    Object.assign(this, patch);
    this.emit('zn-report-change', {
      detail: {type: this.type, groupBy: this.groupBy, from: this.from, to: this.to, filter: this.filter},
    });
  }

  private activeGroupBys(): ReportOption[] {
    return this.response?.groupBys ?? this.groupBys;
  }

  private activeFilterFields(): ReportFilterField[] {
    return this.response?.filterFields ?? this.filterFields;
  }

  private hasCategories(): boolean {
    return this.activeGroupBys().some(option => !!option.category);
  }

  private dimensionLabel(): string {
    return this.response?.dimension?.label ?? '';
  }

  private readSharableState() {
    if (!this.sharable || this.sharableDefaults) return;
    this.sharableDefaults = {type: this.type, groupBy: this.groupBy, from: this.from, to: this.to, filter: this.filter, search: this.search};
    const params = new URLSearchParams(window.location.search);
    SHARABLE_KEYS.forEach(key => {
      const value = params.get(key);
      if (value !== null) this[key] = value;
    });
  }

  private writeSharableState() {
    const defaults = this.sharableDefaults;
    if (!defaults) return;
    const params = new URLSearchParams(window.location.search);
    SHARABLE_KEYS.forEach(key => {
      const fallback = key === 'type' ? defaults.type || this.types[0]?.value || '' : defaults[key];
      const value = this[key];
      if (value && value !== fallback) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }

  private inputParams(): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    this.hasSlotController.getSlots('inputs').forEach(input => {
      if (!INPUT_TAGS.includes(input.tagName.toLowerCase())) {
        return;
      }
      const field = input as HTMLInputElement;
      const raw = field.value || input.getAttribute('value');
      const name = field.name || input.getAttribute('name');
      if (name) {
        params[name] = typeof raw === 'string' ? raw.trim() : raw;
      }
    });
    return params;
  }

  private format(column: ReportColumn, value: number | string | null): string {
    return formatValue(column, value, {currency: this.response?.currency ?? this.currency ?? 'USD', locale: this.locale});
  }

  private cellValue(column: ReportColumn, row: ReportRow): number | string | null {
    if (column.format === 'text') {
      const raw = rawValue(row.values, column.value ?? column.key);
      return raw === undefined || raw === null || typeof raw === 'object' ? '' : String(raw);
    }
    return columnValue(column, row.values);
  }

  // The console only routes links without a native target, so the target is passed as data-target
  private renderLink(link: ReportLink, content: string): TemplateResult {
    return html`<a href="${link.uri}" data-target="${ifDefined(link.target || undefined)}"
                   gaid="${ifDefined(link.gaid || undefined)}">${content}</a>`;
  }

  private cellClasses(column: ReportColumn, value: number | string | null, first: boolean) {
    const tone = typeof value === 'number' ? toneClass(column, value) : '';
    return {
      report__num: column.format !== 'text',
      report__sep: first,
      report__bold: column.style === 'bold',
      report__pos: tone === 'report__pos',
      report__warn: tone === 'report__warn',
      report__neg: tone === 'report__neg',
    };
  }

  private displayGroups(response: ReportResponse): ReportGroup[] {
    if (!this.hideEmptyColumns) return response.groups;
    const filled = (column: ReportColumn) => response.rows.some(row => {
      const value = this.cellValue(column, row);
      return typeof value === 'number' ? value !== 0 : value !== null && value !== '';
    });
    return response.groups
      .map(group => ({...group, columns: group.columns.filter(filled)}))
      .filter(group => group.columns.length > 0);
  }

  private heatScales(groups: ReportGroup[], rows: ReportRow[]): Map<string, number> {
    const scales = new Map<string, number>();
    if (!this.heatmap) return scales;
    groups.flatMap(group => group.columns).filter(column => column.format !== 'text').forEach(column => {
      const max = Math.max(0, ...rows.map(row => Math.abs(Number(this.cellValue(column, row)) || 0)));
      if (max > 0) scales.set(column.key, max);
    });
    return scales;
  }

  private renderTable(response: ReportResponse, rows: ReportRow[], busy: boolean): TemplateResult {
    const groups = this.displayGroups(response);
    const scales = this.heatScales(groups, rows);
    const totals = this.totalsFor(rows);
    const dimension = response.dimension?.label ?? '';

    return html`
      <div class="table__frame">
      ${busy ? html`<div class="table__loader" aria-hidden="true"></div>` : nothing}
      <div class="report__scroll table__enter ${busy ? 'report__scroll--busy' : ''}" aria-busy="${busy ? 'true' : 'false'}">
        <table class="${classMap({report: true, 'report--selectable': this.isSelectable()})}">
          <thead>
          <tr class="report__groups">
            <th class="report__dim" ${ref(this.observeDim)}></th>
            ${groups.map(group => html`
              <th class="report__sep" colspan="${group.columns.length}"><span class="report__glabel">${group.label}</span></th>`)}
          </tr>
          <tr>
            ${this.renderHeading(
              DIMENSION, dimension, {report__dim: true, report__filtered: this.isFiltered(this.dimensionColumn())},
              html`${this.isSelectable() ? this.renderSelectAll(rows) : nothing}${this.columnFilters ? this.renderFilterToggle() : nothing}`,
            )}
            ${groups.map(group => group.columns.map((column, index) => this.renderHeading(
              column.key,
              group.columns.length === 1 && column.label === group.label ? '' : column.label,
              {report__num: column.format !== 'text', report__sep: index === 0, report__filtered: this.isFiltered(column)},
              nothing,
              unitLabel(column, this.response?.currency ?? this.currency ?? 'USD'),
            )))}
          </tr>
          ${this.columnFilters && this.filterRowShown() ? this.renderFilterRow(groups) : nothing}
          </thead>
          <tbody>
          ${rows.length === 0 ? this.renderNoMatches(groups) : nothing}
          ${repeat(rows, row => row.id, row => html`
            <tr aria-selected="${ifDefined(this.isSelectable() ? String(this.selected.has(row.id)) : undefined)}">
              <td class="report__dim">
                <span class="report__head">
                  ${this.isSelectable() ? html`
                    <zn-checkbox class="report__check" size="small" aria-label="Select ${row.label}"
                                 .checked="${this.selected.has(row.id)}"
                                 @zn-change="${() => this.toggleRow(row.id)}"></zn-checkbox>` : nothing}
                  ${row.uri ? this.renderLink({uri: row.uri, target: row.target, gaid: row.gaid}, row.label) : row.label}
                </span>
              </td>
              ${groups.map(group => group.columns.map((column, index) => {
                const value = this.cellValue(column, row);
                const link = row.links?.[column.key];
                const text = this.format(column, value);
                const scale = scales.get(column.key);
                const heat = scale && typeof value === 'number' && value !== 0 ? Math.abs(value) / scale : 0;
                return html`
                  <td class=${classMap({...this.cellClasses(column, value, index === 0), report__heat: heat > 0, 'report__heat--neg': heat > 0 && (value as number) < 0})}
                      style=${styleMap({'--_heat': heat > 0 ? heat.toFixed(3) : undefined})}>${link ? this.renderLink(link, text) : text}</td>`;
              }))}
            </tr>`)}
          </tbody>
          ${rows.length === 0 ? nothing : html`
            <tfoot>
            <tr class="report__total">
              <td class="report__dim">Total</td>
              ${groups.map(group => group.columns.map((column, index) => {
                const value = totals[column.key] ?? null;
                return html`
                  <td class=${classMap(this.cellClasses(column, value, index === 0))}>${this.format(column, value)}</td>`;
              }))}
            </tr>
            </tfoot>`}
        </table>
      </div>
      </div>`;
  }

  private isFiltered(column: ReportColumn): boolean {
    return this.columnFilters && !!parseColumnFilter(this.filterText[column.key] ?? '', column.format === 'text');
  }

  private renderFilterRow(groups: ReportGroup[]): TemplateResult {
    return html`
      <tr class="report__filters">
        ${this.renderFilterCell(this.dimensionColumn(), {report__dim: true})}
        ${groups.map(group => group.columns.map((column, index) => this.renderFilterCell(column, {report__sep: index === 0})))}
      </tr>`;
  }

  private renderFilterCell(column: ReportColumn, classes: Record<string, boolean>): TemplateResult {
    const raw = this.filterText[column.key] ?? '';
    const text = column.format === 'text';
    const filter = parseColumnFilter(raw, text);
    const focused = this.focusedFilter === column.key;
    const value = focused || !filter ? raw : this.describeFilter(column, filter);
    return html`
      <th class="${classMap(classes)}">
        <span class="${classMap({
          report__filter: true,
          'report__filter--num': !text,
          'report__filter--active': !!filter,
          'report__filter--invalid': !filter && raw.trim() !== '',
        })}">
          ${filter && !focused ? html`
            <button type="button" class="report__filter__clear" aria-label="Clear the ${column.label} filter"
                    @click="${() => this.setFilterText(column.key, '')}">
              <zn-icon src="x@lu" size="12"></zn-icon>
            </button>` : nothing}
          <input class="report__filter__input" .value="${value}" placeholder="Any" spellcheck="false" autocomplete="off"
                 aria-label="Filter ${column.label}" aria-invalid="${!filter && raw.trim() !== '' ? 'true' : 'false'}"
                 @focus="${(e: FocusEvent) => this.focusFilter(column.key, e.target as HTMLInputElement)}"
                 @blur="${this.blurFilter}"
                 @input="${(e: InputEvent) => this.setFilterText(column.key, (e.target as HTMLInputElement).value)}"
                 @keydown="${(e: KeyboardEvent) => this.filterKeydown(column.key, e)}">
        </span>
      </th>`;
  }

  private describeFilter(column: ReportColumn, filter: ColumnFilter): string {
    const value = (n: number) => this.format(column, column.format === 'percent' ? n / 100 : n);
    switch (filter.op) {
      case 'gt': return `> ${value(filter.value)}`;
      case 'gte': return `≥ ${value(filter.value)}`;
      case 'lt': return `< ${value(filter.value)}`;
      case 'lte': return `≤ ${value(filter.value)}`;
      case 'eq': return `= ${value(filter.value)}`;
      case 'between': return `${value(filter.min)} – ${value(filter.max)}`;
      case 'nonzero': return '≠ 0';
      case 'top': return `Top ${filter.count}`;
      case 'bottom': return `Bottom ${filter.count}`;
      default: return this.filterText[column.key] ?? '';
    }
  }

  private renderFilterHelp(): TemplateResult | typeof nothing {
    const column = this.columns().find(c => c.key === this.focusedFilter);
    if (!column || column.format === 'text' || !this.filterAnchor) return nothing;
    const percent = column.format === 'percent';
    const examples = [
      [percent ? '>1.5' : '>1000', 'More than'],
      ['<0', 'Below zero'],
      [percent ? '0.5..2' : '100..500', 'Between'],
      ['!0', 'Not zero'],
      ['top 5', 'Highest 5'],
    ];
    const width = 232;
    const left = Math.max(8, Math.min(this.filterAnchor.right - width, window.innerWidth - width - 8));
    return html`
      <div class="report__fhelp" popover="manual" aria-hidden="true"
           style="top: ${this.filterAnchor.bottom + 6}px; left: ${left}px; width: ${width}px">
        <div class="report__fhelp__title">${column.label}</div>
        ${examples.map(([example, meaning]) => html`
          <button type="button" tabindex="-1" @mousedown="${(e: MouseEvent) => {
            e.preventDefault();
            this.setFilterText(column.key, example);
          }}"><code>${example}</code><span>${meaning}</span></button>`)}
      </div>`;
  }

  private renderNoMatches(groups: ReportGroup[]): TemplateResult {
    const span = 1 + groups.reduce((count, group) => count + group.columns.length, 0);
    const several = this.activeColumnFilters().length > 1;
    return html`
      <tr class="report__nomatch">
        <td colspan="${span}">
          <div class="report__nomatch__body">
            <span class="report__nomatch__icon"><zn-icon src="funnel@lu" size="16"></zn-icon></span>
            <span class="report__nomatch__text">
              <strong>No rows match ${several ? 'these filters' : 'this filter'}</strong>
              <span>All ${this.response?.rows.length ?? 0} rows are hidden. Change a filter above or clear ${several ? 'them' : 'it'}.</span>
            </span>
            <zn-button size="x-small" color="secondary" @click="${this.clearColumnFilters}">
              Clear ${several ? 'filters' : 'filter'}
            </zn-button>
          </div>
        </td>
      </tr>`;
  }

  private setFilterText(key: string, value: string) {
    const next = {...this.filterText};
    if (value) next[key] = value; else delete next[key];
    this.filterText = next;
  }

  private clearColumnFilters = () => {
    this.filterText = {};
  };

  private focusFilter(key: string, input: HTMLInputElement) {
    this.focusedFilter = key;
    this.filterAnchor = input.getBoundingClientRect();
    window.addEventListener('scroll', this.trackFilterAnchor, true);
  }

  private blurFilter = () => {
    this.focusedFilter = '';
    window.removeEventListener('scroll', this.trackFilterAnchor, true);
  };

  private trackFilterAnchor = () => {
    const input = this.shadowRoot?.activeElement;
    if (input instanceof HTMLInputElement) this.filterAnchor = input.getBoundingClientRect();
  };

  private filterKeydown(key: string, e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.setFilterText(key, '');
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }

  private renderHeading(key: string, label: string, classes: Record<string, boolean>, prefix: TemplateResult | typeof nothing = nothing, unit = ''): TemplateResult {
    const sort = () => this.cycleSort(key);
    return html`
      <th class=${classMap(classes)} tabindex="0" aria-sort="${this.sortState(key)}"
          @click="${sort}" @keydown="${sortKeyHandler(sort)}">
        <span class="report__head">${prefix}${label}${unit ? html`<span class="report__unit">${unit}</span>` : nothing}${renderSortIcon(this.sortState(key))}</span>
      </th>`;
  }

  private filterRowShown(): boolean {
    return this.filtersOpen || this.hasFilterText();
  }

  private hasFilterText(): boolean {
    return Object.values(this.filterText).some(text => text.trim() !== '');
  }

  // Inside a sortable heading, so its clicks and keys must not reach the heading's sort handlers
  private renderFilterToggle(): TemplateResult {
    const shown = this.filterRowShown();
    return html`
      <button type="button" class="report__filtertoggle" aria-pressed="${shown}"
              aria-label="${shown ? 'Hide filters' : 'Filter rows'}" title="${shown ? 'Hide filters' : 'Filter rows'}"
              @click="${(e: Event) => {
                e.stopPropagation();
                this.toggleFilterRow();
              }}"
              @keydown="${(e: Event) => e.stopPropagation()}">
        <zn-icon src="funnel@lu" size="14"></zn-icon>
      </button>`;
  }

  private async toggleFilterRow() {
    this.filtersOpen = this.hasFilterText() || !this.filtersOpen;
    if (!this.filtersOpen) return;
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLInputElement>('.report__filter__input')?.focus();
  }

  // Inside a sortable heading, so its clicks and keys must not reach the heading's sort handlers
  private renderSelectAll(rows: ReportRow[]): TemplateResult {
    const count = rows.filter(row => this.selected.has(row.id)).length;
    return html`
      <zn-checkbox class="report__check" size="small" aria-label="Select all shown"
                   .checked="${count > 0 && count === rows.length}"
                   .indeterminate="${count > 0 && count < rows.length}"
                   @click="${(e: Event) => e.stopPropagation()}"
                   @keydown="${(e: Event) => e.stopPropagation()}"
                   @zn-change="${() => this.toggleAll(rows, count < rows.length)}"></zn-checkbox>`;
  }

  private isSelectable(): boolean {
    return this.selectable || (!!this.chartUri && this.chartOpen);
  }

  private toggleRow(id: string) {
    const selected = new Set(this.selected);
    if (!selected.delete(id)) selected.add(id);
    this.setSelected(selected);
  }

  private toggleAll(rows: ReportRow[], select: boolean) {
    const selected = new Set(this.selected);
    rows.forEach(row => select ? selected.add(row.id) : selected.delete(row.id));
    this.setSelected(selected);
  }

  private setSelected(selected: Set<string>) {
    this.selected = selected;
  }

  private selectedRows(): ReportRow[] {
    return (this.response?.rows ?? []).filter(row => this.selected.has(row.id));
  }

  private chartRows(): ReportRow[] {
    return this.chartOpen ? this.selectedRows() : [];
  }

  // A label repeated across groups, such as each day's Leads, is one metric over time
  private chartColumns(): ReportColumn[] {
    const seen = new Set<string>();
    const shown = this.response ? this.displayGroups(this.response).flatMap(group => group.columns) : [];
    return shown.filter(column => {
      if (column.format === 'text' || seen.has(column.label)) return false;
      seen.add(column.label);
      return true;
    });
  }

  private chartColumn(): ReportColumn | undefined {
    const columns = this.chartColumns();
    return columns.find(column => column.key === this.chartMetric) ?? columns[0];
  }

  private renderSelectionBar(): TemplateResult | typeof nothing {
    const count = this.selectedRows().length;
    const charting = !!this.chartUri && this.chartOpen;
    if (count === 0 && !charting) return nothing;
    const column = this.chartColumn();
    return html`
      <div class="report__bulk">
        ${charting && column ? this.renderMetricPicker(column) : nothing}
        ${count > 0 ? html`
          <button type="button" class="report__bulk__clear"
                  @click="${() => (charting ? this.closeChart() : this.setSelected(new Set()))}">Clear selection</button>` : nothing}
      </div>`;
  }

  private toggleChartAll = () => {
    if (this.chartOpen) {
      this.closeChart();
      return;
    }
    this.setSelected(new Set(this.visibleRows().map(row => row.id)));
    this.chartOpen = true;
  };

  // Leaving charting hides the tick boxes, so it drops the ticks too
  private closeChart = () => {
    this.chartOpen = false;
    if (!this.selectable) this.setSelected(new Set());
  };

  private renderMetricPicker(column: ReportColumn): TemplateResult {
    return html`
      <zn-dropdown class="report__metric" placement="bottom-start">
        <zn-button slot="trigger" class="menu-trigger" panel-bg size="small">
          Chart by: <strong>${column.label}</strong>
          <zn-icon class="menu-trigger__chevron" src="chevron-down@lu" size="16"></zn-icon>
        </zn-button>
        <zn-menu>
          ${this.chartColumns().map(option => html`
            <zn-menu-item type="checkbox" checked-position="right" ?checked="${option.key === column.key}"
                          @click="${() => (this.chartMetric = option.key)}">${option.label}</zn-menu-item>`)}
        </zn-menu>
      </zn-dropdown>`;
  }

  // As #rrggbb whatever colour syntax the theme uses, so further rounds can be mixed from them
  private themeChartColors(): string[] {
    const computed = getComputedStyle(this);
    const context = document.createElement('canvas').getContext('2d');
    return [1, 2, 3, 4, 5, 6]
      .map(index => computed.getPropertyValue(`--zn-chart-color-${index}`).trim())
      .filter(Boolean)
      .map(color => {
        if (!context) return color;
        context.fillStyle = '#000';
        context.fillStyle = color;
        return String(context.fillStyle);
      });
  }

  private renderChart(): TemplateResult | typeof nothing {
    const column = this.chartColumn();
    if (!this.chartUri || !this.chartOpen || !column) return nothing;
    const rows = this.chartRows();
    const total = this.selectedRows().length;
    const counted = `${total} selected`;
    const colors = chartPalette(this.themeChartColors(), rows.length);
    const percent = column.format === 'percent';
    const currency = column.format === 'currency' ? column.currency ?? this.response?.currency ?? this.currency : undefined;

    const data = this.chartTask.value;
    const pending = this.chartTask.status === TaskStatus.PENDING;
    const lines = rows
      .map((row, index) => ({row, color: colors[index], values: data?.series.find(item => item.id === row.id)?.data}))
      .filter(line => !data || line.values);
    let body: TemplateResult;
    if (rows.length === 0) {
      body = html`<div class="report__chart__empty">Tick rows in the table to chart them.</div>`;
    } else if (this.chartTask.status === TaskStatus.ERROR) {
      body = html`<zn-alert level="error" size="small">Unable to load the chart</zn-alert>`;
    } else {
      const series = lines.map(line => ({
        name: line.row.label,
        data: (line.values ?? []).map(value => typeof value === 'number' && percent ? value * 100 : value),
      }));
      body = html`
        <zn-chart class="report__chart__plot" type="line" height="220" hide-legend ?pending="${pending}"
                  .categories="${data?.labels ?? []}" .data="${series}" .colors="${lines.map(line => line.color)}"
                  currency="${ifDefined(currency)}" y-axis-append="${ifDefined(percent ? '%' : undefined)}"></zn-chart>
        ${data && !pending ? html`
          <div class="report__legend">
            ${lines.map(line => html`
              <span class="report__legend__item" style="--_swatch: ${line.color}">${line.row.label}</span>`)}
          </div>` : nothing}`;
    }

    const labels = this.chartTask.value?.labels ?? [];
    const range = labels.length > 0 ? `${labels[0]} to ${labels[labels.length - 1]} · ` : '';
    return html`
      <div class="report__chart">
        <div class="report__chart__inner">
          <div class="report__chart__head">
            <span class="report__chart__heading">
              <span class="report__chart__title">${column.label} over time</span>
              <span class="report__chart__sub">${range}${counted}</span>
            </span>
            <zn-button icon="x@lu" color="transparent" size="x-small" aria-label="Close chart"
                       @click="${this.closeChart}"></zn-button>
          </div>
          ${body}
        </div>
      </div>`;
  }

  private renderBody(rows: ReportRow[], busy: boolean): TemplateResult {
    const response = this.response;
    if (!response) {
      return busy ? this.renderSkeleton() : html``;
    }

    const alert = response.error
      ? html`
        <zn-alert class="report__alert" level="${response.error.level ?? 'error'}" icon="${ifDefined(response.error.icon)}" size="small">
          ${response.error.text}
        </zn-alert>`
      : nothing;

    if (rows.length === 0 && response.rows.length > 0 && this.activeColumnFilters().length > 0) {
      return html`${alert}${this.renderTable(response, rows, busy)}`;
    }

    if (rows.length === 0) {
      if (busy) return this.renderSkeleton();
      return html`${alert}
        <div class="table__enter">
          <slot name="empty-state">
            <zn-empty-state caption="No results found" icon="search"
                            description="Nothing matched this report. Try another date range or filter."></zn-empty-state>
          </slot>
        </div>`;
    }

    return html`${alert}${this.renderTable(response, rows, busy)}`;
  }

  private renderSkeleton(): TemplateResult {
    return html`
      <div class="report__skeleton table__enter">
        ${[0, 1, 2, 3, 4].map(() => html`<zn-skeleton></zn-skeleton>`)}
      </div>`;
  }

  private renderRowCount(rows: ReportRow[]): string | undefined {
    const total = this.response?.rows?.length;
    if (total === undefined) return undefined;
    const shown = rows.length;
    const noun = total === 1 ? 'row' : 'rows';
    return shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`;
  }

  private groupByLabel(): string {
    return this.activeGroupBys().find(option => option.value === this.groupBy)?.label || this.dimensionLabel() || this.groupBy;
  }

  private renderGroupBy(): TemplateResult | typeof nothing {
    if (this.activeGroupBys().length === 0) return nothing;
    const current = this.groupByLabel();

    return html`
      <zn-button class="report__groupby menu-trigger" panel-bg size="small" aria-haspopup="dialog"
                 aria-expanded="${this.groupByPopover.open}" @click="${this.toggleGroupBy}">
        By: <strong>${current}</strong>
        <zn-icon class="menu-trigger__chevron" src="chevron-down@lu" size="16"></zn-icon>
      </zn-button>`;
  }

  private renderGroupByOptions(): TemplateResult {
    const options = this.activeGroupBys();
    const option = (item: ReportOption) => html`
      <button type="button" class="report__gopt" aria-current="${item.value === this.groupBy ? 'true' : 'false'}"
              @click="${() => this.selectGroupBy(item.value)}">${item.label}</button>`;

    let body: TemplateResult;
    if (this.hasCategories()) {
      const categories = new Map<string, ReportOption[]>();
      options.forEach(item => {
        const name = item.category ?? '';
        categories.set(name, [...(categories.get(name) ?? []), item]);
      });
      body = html`
        <div class="report__ggrid">
          ${[...categories].map(([name, items]) => html`
            <div class="report__gcat" role="group" aria-label="${name}">
              ${name ? html`<div class="report__gcat__head">${name}</div>` : nothing}
              ${items.map(option)}
            </div>`)}
        </div>`;
    } else {
      body = html`<div class="report__ggrid report__ggrid--flow">${options.map(option)}</div>`;
    }
    return body;
  }

  private renderGroupByPopover(): TemplateResult | typeof nothing {
    if (!this.groupByPopover.open) return nothing;
    return html`
      <div class="${classMap({report__gpop: true, 'report__gpop--categories': this.hasCategories()})}" role="dialog"
           aria-label="Group by" style="${this.groupByPopover.style}">
        ${this.renderGroupByOptions()}
      </div>`;
  }

  private renderChip(label: string, active: boolean, pick: () => void): TemplateResult {
    return html`
      <button type="button" class="${classMap({report__chip: true, 'is-active': active})}" aria-pressed="${active}"
              @click="${pick}">${label}</button>`;
  }

  private renderSheetDates(): TemplateResult {
    const max = this.maxDate || todayIso();
    const presets = (this.presets ?? defaultPresets(todayIso()))
      .map(preset => ({label: preset.label, range: clampRange(preset, '', max)}))
      .filter((preset): preset is {label: string; range: {from: string; to: string}} => !!preset.range);
    const isCurrent = (range: {from: string; to: string}) => range.from === this.from && range.to === this.to;
    const custom = !presets.some(preset => isCurrent(preset.range));

    return html`
      <div class="report__sfield" role="group" aria-label="Date range">
        <span class="report__slabel">Date range</span>
        <div class="report__chips">
          ${presets.map(({label, range}) => this.renderChip(label, isCurrent(range), () => {
            if (!isCurrent(range)) this.change({from: range.from, to: range.to});
          }))}
          <zn-date-range class="report__custom" from="${this.from}" to="${this.to}" max="${max}"
                         .presets="${this.presets}" note="${this.dateNote}" @zn-change="${this.handleRange}">
            <span slot="trigger" class="${classMap({report__chip: true, 'is-active': custom})}">
              ${custom && this.from && this.to ? rangeLabel(this.from, this.to) : 'Custom…'}
            </span>
          </zn-date-range>
        </div>
      </div>`;
  }

  private renderSheetGroupBy(): TemplateResult | typeof nothing {
    const options = this.activeGroupBys();
    if (options.length === 0) return nothing;
    return html`
      <div class="report__sfield" role="group" aria-label="Group by">
        <span class="report__slabel">Group by</span>
        <div class="${options.length <= 3 ? 'report__segment' : 'report__chips'}">
          ${options.map(option => this.renderChip(option.label, option.value === this.groupBy,
            () => this.selectGroupBy(option.value)))}
        </div>
      </div>`;
  }

  // The filter's own toggle stays in the row so its popover has something to hang from
  private renderSheetFilter(): TemplateResult {
    const applied = this.filterEl.activeCount;
    return html`
      <div class="report__srow">
        <button type="button" class="report__srow__btn" @click="${this.openFilter}">
          <span>Filters</span>
          <span class="report__srow__value">${applied ? `${applied} applied` : 'None'}</span>
        </button>
        ${this.filterEl}
      </div>`;
  }

  // Kept from the document, where the filter's outside-click check would close it straight away
  private openFilter = (e: Event) => {
    e.stopPropagation();
    this.filterEl.show();
  };

  private resetFilters = () => {
    this.search = '';
    if (this.activeFilterFields().length > 0) this.filterEl.clear();
  };

  private traySummary(): string {
    const parts = [];
    if (this.from && this.to) parts.push(rangeLabel(this.from, this.to));
    if (this.activeGroupBys().length > 0) parts.push(this.groupByLabel());
    return parts.join(' · ');
  }

  private toggleGroupBy = () => {
    if (this.groupByPopover.open) {
      this.groupByPopover.hide();
    } else {
      this.groupByPopover.show();
    }
  };

  private selectGroupBy(value: string) {
    this.groupByPopover.hide();
    if (value !== this.groupBy) {
      this.change({groupBy: value});
    }
  }

  private handleSearch = (e: CustomEvent<{value: string}>) => {
    e.stopPropagation();
    this.search = e.detail.value;
  };

  // Lets the sticky group labels clear the frozen first column, and the loader sit under the header
  private observeDim = (el: Element | undefined) => {
    this.dimObserver?.disconnect();
    this.dimObserver = null;
    if (!el) return;
    const head = el.closest('thead')!;
    this.dimObserver = new ResizeObserver(() => {
      this.style.setProperty('--_dim-width', `${(el as HTMLElement).offsetWidth}px`);
      this.style.setProperty('--_head-height', `${head.offsetHeight}px`);
    });
    this.dimObserver.observe(el);
    this.dimObserver.observe(head);
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.filterEl.removeEventListener('zn-filter-change', this.handleFilter);
    this.dimObserver?.disconnect();
    this.dimObserver = null;
    window.removeEventListener('scroll', this.trackFilterAnchor, true);
  }

  private handleFilter = (e: Event) => {
    e.stopPropagation();
    this.change({filter: this.filterEl.value});
  };

  private handleTrayFold = (e: Event) => {
    e.stopPropagation();
    this.trayCollapsed = e.type === 'zn-collapse';
    this.groupByPopover.hide();
  };

  private handleRange = (e: Event) => {
    const range = e.target as ZnDateRange;
    if (range.from === this.from && range.to === this.to) return;
    this.change({from: range.from, to: range.to});
  };

  private renderActions(rows: ReportRow[]): TemplateResult {
    const dimension = this.dimensionLabel();
    const placeholder = this.searchPlaceholder || (dimension ? `Search ${dimension.toLowerCase()}...` : 'Search...');
    const hasFilter = this.activeFilterFields().length > 0;
    const count = (hasFilter ? this.filterEl.activeCount : 0) + (this.search ? 1 : 0);
    const shown = this.renderRowCount(rows);
    const search = this.columnFilters ? nothing : html`
      <zn-data-table-search class="report__search" placeholder="${placeholder}" value="${this.search}"
                            @zn-search-change="${this.handleSearch}"></zn-data-table-search>`;

    return html`
      <div slot="actions" class="report__actions">
        <zn-tray class="report__tray" label="Report options" summary="${this.traySummary()}" count="${count}"
                        done-label="${shown ? `Show ${shown}` : 'Done'}"
                        @zn-collapse="${this.handleTrayFold}" @zn-expand="${this.handleTrayFold}">
          ${this.trayCollapsed ? html`
            <button slot="header-actions" type="button" class="report__reset"
                    @click="${this.resetFilters}">Reset</button>
            ${search === nothing ? nothing : html`
              <div class="report__sfield">
                <span class="report__slabel">Search</span>
                ${search}
              </div>`}
            ${this.renderSheetDates()}
            ${this.renderSheetGroupBy()}
            ${hasFilter ? this.renderSheetFilter() : nothing}` : html`
            ${search}
            ${hasFilter ? this.filterEl : nothing}
            <zn-date-range from="${this.from}" to="${this.to}" max="${this.maxDate || todayIso()}"
                           .presets="${this.presets}" note="${this.dateNote}"
                           @zn-change="${this.handleRange}"></zn-date-range>
            ${this.renderGroupBy()}`}
        </zn-tray>
        ${this.chartUri ? html`
          <zn-button class="${classMap({report__charttoggle: true, 'report__charttoggle--active': this.chartOpen})}"
                     icon="chart-line@lu" icon-size="18" icon-button="small" aria-pressed="${this.chartOpen}"
                     label="${this.chartOpen ? 'Hide chart' : 'Chart the rows shown'}"
                     tooltip="${this.chartOpen ? 'Hide chart' : 'Chart the rows shown'}"
                     @click="${this.toggleChartAll}"></zn-button>` : nothing}
      </div>`;
  }

  render() {
    const rows = this.visibleRows();
    const body = this._task.render({
      initial: () => this.renderBody(rows, false),
      pending: () => this.renderBody(rows, true),
      complete: () => this.renderBody(rows, false),
      error: () => html`
        <zn-alert class="report__alert" level="error" size="small">Unable to load the report</zn-alert>`,
    });

    return html`
      <zn-panel caption="${ifDefined(this.caption || undefined)}" description="${ifDefined(this.renderRowCount(rows))}"
                inline-description flush>
        ${this.renderActions(rows)}
        ${this.types.length > 1 ? this.tabRow.render(this.types, this.type, false) : nothing}
        ${this.activeFilterFields().length > 0 ? html`
          <zn-data-table-filter class="table__chips" .source="${this.filterEl}"></zn-data-table-filter>` : nothing}
        ${this.isSelectable() ? this.renderSelectionBar() : nothing}
        ${this.renderChart()}
        ${body}
      </zn-panel>
      ${this.renderGroupByPopover()}
      ${this.renderFilterHelp()}`;
  }
}
