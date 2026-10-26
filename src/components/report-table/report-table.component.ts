import {AnchoredPopoverController} from '../../internal/anchored-popover';
import {classMap} from 'lit/directives/class-map.js';
import {
  columnValue,
  computeTotals,
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
import {type DatePreset, todayIso} from '../date-range/date-range-math';
import {formatValue, toneClass} from './report-format';
import {HasSlotController} from '../../internal/slot';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, state} from 'lit/decorators.js';
import {ref} from 'lit/directives/ref.js';
import {renderSortIcon, sortKeyHandler, type SortState} from '../../internal/table-sort';
import {repeat} from 'lit/directives/repeat.js';
import {styleMap} from 'lit/directives/style-map.js';
import {TabRowController} from '../../internal/table-tabs';
import {Task} from '@lit/task';
import ZincElement from '../../internal/zinc-element';
import ZnAlert from '../alert';
import ZnButton from '../button';
import ZnCheckbox from '../checkbox';
import ZnDataTableFilter from '../data-table-filter';
import ZnDataTableSearch from '../data-table-search';
import ZnDateRange from '../date-range';
import ZnEmptyState from '../empty-state';
import ZnIcon from '../icon';
import ZnPanel from '../panel';
import ZnSkeleton from '../skeleton';

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
 * @dependency zn-checkbox
 * @dependency zn-data-table-filter
 * @dependency zn-data-table-search
 * @dependency zn-date-range
 * @dependency zn-empty-state
 * @dependency zn-icon
 * @dependency zn-panel
 * @dependency zn-skeleton
 *
 * @event zn-report-change - Emitted when the type, group by, date range or filter is changed, before the report is fetched again.
 *
 * @slot inputs - Inputs whose name and value are sent with every request (csrf tokens and similar).
 * @slot empty-state - Replaces the default empty state.
 */
export default class ZnReportTable extends ZincElement {
  static styles: CSSResultGroup = [unsafeCSS(styles), unsafeCSS(tableControlsStyles)];
  static dependencies = {
    'zn-alert': ZnAlert,
    'zn-button': ZnButton,
    'zn-checkbox': ZnCheckbox,
    'zn-date-range': ZnDateRange,
    'zn-empty-state': ZnEmptyState,
    'zn-icon': ZnIcon,
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

  @state() protected response: ReportResponse | null = null;
  @state() protected search = '';
  @state() private sortKey = '';
  @state() private sortDirection: 'asc' | 'desc' = 'desc';
  @state() private selected = new Set<string>();

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
    return this.sortRows(rows);
  }

  protected totalsFor(rows: ReportRow[]): Record<string, number | null> {
    const columns = this.columns();
    const server = this.response?.totals;
    if (server && !this.search.trim()) {
      return Object.fromEntries(columns.map(column => [column.key, typeof server[column.key] === 'number' ? server[column.key] : null]));
    }
    return computeTotals(columns, rows);
  }

  protected columns(): ReportColumn[] {
    return (this.response?.groups ?? []).flatMap(group => group.columns);
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
    return html`<a href="${link.uri}" data-target="${ifDefined(link.target || undefined)}">${content}</a>`;
  }

  private cellClasses(column: ReportColumn, value: number | string | null, first: boolean) {
    const tone = typeof value === 'number' ? toneClass(column, value) : '';
    return {
      report__num: column.format !== 'text',
      report__sep: first,
      report__bold: column.style === 'bold',
      report__pos: tone === 'report__pos',
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
        <table class="report">
          <thead>
          <tr class="report__groups">
            <th class="report__dim" ${ref(this.observeDim)}></th>
            ${groups.map(group => html`
              <th class="report__sep" colspan="${group.columns.length}"><span class="report__glabel">${group.label}</span></th>`)}
          </tr>
          <tr>
            ${this.renderHeading(DIMENSION, dimension, {report__dim: true}, this.selectable ? this.renderSelectAll(rows) : nothing)}
            ${groups.map(group => group.columns.map((column, index) => this.renderHeading(
              column.key,
              group.columns.length === 1 && column.label === group.label ? '' : column.label,
              {report__num: column.format !== 'text', report__sep: index === 0},
            )))}
          </tr>
          </thead>
          <tbody>
          ${repeat(rows, row => row.id, row => html`
            <tr aria-selected="${ifDefined(this.selectable ? String(this.selected.has(row.id)) : undefined)}">
              <td class="report__dim">
                <span class="report__head">
                  ${this.selectable ? html`
                    <zn-checkbox class="report__check" size="small" aria-label="Select ${row.label}"
                                 .checked="${this.selected.has(row.id)}"
                                 @zn-change="${() => this.toggleRow(row.id)}"></zn-checkbox>` : nothing}
                  ${row.uri ? this.renderLink({uri: row.uri, target: row.target}, row.label) : row.label}
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
          <tfoot>
          <tr class="report__total">
            <td class="report__dim">Total</td>
            ${groups.map(group => group.columns.map((column, index) => {
              const value = totals[column.key] ?? null;
              return html`
                <td class=${classMap(this.cellClasses(column, value, index === 0))}>${this.format(column, value)}</td>`;
            }))}
          </tr>
          </tfoot>
        </table>
      </div>
      </div>`;
  }

  private renderHeading(key: string, label: string, classes: Record<string, boolean>, prefix: TemplateResult | typeof nothing = nothing): TemplateResult {
    const sort = () => this.cycleSort(key);
    return html`
      <th class=${classMap(classes)} tabindex="0" aria-sort="${this.sortState(key)}"
          @click="${sort}" @keydown="${sortKeyHandler(sort)}">
        <span class="report__head">${prefix}${label}${renderSortIcon(this.sortState(key))}</span>
      </th>`;
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

  private toggleRow(id: string) {
    const selected = new Set(this.selected);
    if (!selected.delete(id)) selected.add(id);
    this.selected = selected;
  }

  private toggleAll(rows: ReportRow[], select: boolean) {
    const selected = new Set(this.selected);
    rows.forEach(row => select ? selected.add(row.id) : selected.delete(row.id));
    this.selected = selected;
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

    if (rows.length === 0) {
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

  private renderGroupBy(): TemplateResult | typeof nothing {
    const options = this.activeGroupBys();
    if (options.length === 0) return nothing;
    const current = options.find(option => option.value === this.groupBy)?.label || this.dimensionLabel() || this.groupBy;

    return html`
      <zn-button class="report__groupby" panel-bg size="small" aria-haspopup="dialog"
                 aria-expanded="${this.groupByPopover.open}" @click="${this.toggleGroupBy}">
        Group by: <strong>${current}</strong>
        <zn-icon src="chevron-down@lu" size="14"></zn-icon>
      </zn-button>`;
  }

  private renderGroupByPopover(): TemplateResult | typeof nothing {
    if (!this.groupByPopover.open) return nothing;
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

    return html`
      <div class="${classMap({report__gpop: true, 'report__gpop--categories': this.hasCategories()})}" role="dialog"
           aria-label="Group by" style="${this.groupByPopover.style}">
        ${body}
      </div>`;
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
  }

  private handleFilter = (e: Event) => {
    e.stopPropagation();
    this.change({filter: this.filterEl.value});
  };

  private handleRange = (e: Event) => {
    const range = e.target as ZnDateRange;
    if (range.from === this.from && range.to === this.to) return;
    this.change({from: range.from, to: range.to});
  };

  private renderActions(): TemplateResult {
    const dimension = this.dimensionLabel();
    const placeholder = this.searchPlaceholder || (dimension ? `Search ${dimension.toLowerCase()}...` : 'Search...');

    return html`
      <div slot="actions" class="report__actions">
        <zn-data-table-search class="report__search" placeholder="${placeholder}" value="${this.search}"
                              @zn-search-change="${this.handleSearch}"></zn-data-table-search>
        ${this.activeFilterFields().length > 0 ? this.filterEl : nothing}
        <zn-date-range from="${this.from}" to="${this.to}" max="${this.maxDate || todayIso()}"
                       .presets="${this.presets}" note="${this.dateNote}"
                       @zn-change="${this.handleRange}"></zn-date-range>
        ${this.renderGroupBy()}
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
        ${this.renderActions()}
        ${this.types.length > 1 ? this.tabRow.render(this.types, this.type, false) : nothing}
        ${this.activeFilterFields().length > 0 ? html`
          <zn-data-table-filter class="table__chips" .source="${this.filterEl}"></zn-data-table-filter>` : nothing}
        ${body}
      </zn-panel>
      ${this.renderGroupByPopover()}`;
  }
}
