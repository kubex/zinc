import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {formatValue} from '../chart/builders';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {OverlayScrollbarController} from '../../internal/overlay-scrollbar';
import {property, state} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {Store} from '../../internal/storage';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnDropdown from '../dropdown';
import ZnMenu from '../menu';
import ZnMenuItem from '../menu-item';
import ZnNavbar from '../navbar';
import ZnPanel from '../panel';
import type ZnChart from '../chart/chart.component';

import styles from './chart-switcher.scss';

/**
 * @summary Shows one chart at a time from a set, picked by metric and by what the metric is broken down by, or the
 * chart's data as a table.
 * @documentation https://zinc.style/components/chart-switcher
 * @status experimental
 * @since 2.0
 *
 * @dependency zn-button
 * @dependency zn-dropdown
 * @dependency zn-menu
 * @dependency zn-menu-item
 * @dependency zn-navbar
 * @dependency zn-panel
 *
 * @slot - The charts. Each sets a `metric`, plus `by` when its metric is offered with more than one breakdown.
 *
 * @csspart base - The panel holding the controls and charts.
 */
export default class ZnChartSwitcher extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  protected readonly tableScrollbar = new OverlayScrollbarController(this, () => this.renderRoot.querySelector<HTMLElement>('.table-wrap'));
  static dependencies = {
    'zn-button': ZnButton,
    'zn-dropdown': ZnDropdown,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
    'zn-navbar': ZnNavbar,
    'zn-panel': ZnPanel,
  };

  @property() caption = '';

  /** Muted text beside the caption, such as the period the charts cover. */
  @property() description = '';

  /** The metric shown, and the default before a stored choice exists. Falls back to the first chart's metric. */
  @property({reflect: true}) metric = '';

  /** The breakdown shown, kept across metrics that offer it. Falls back to the metric's first breakdown. */
  @property({reflect: true}) by = '';

  /** Remembers the chosen metric and breakdown under this key, so they survive the switcher being re-rendered. */
  @property({attribute: 'store-key'}) storeKey = '';

  @property({attribute: 'local-storage', type: Boolean}) localStorage = false;

  @state() private charts: HTMLElement[] = [];

  /** Shows the chart on show as a table of its values, for reading exact figures without hovering. */
  @state() private asTable = false;

  private store?: Store;

  constructor() {
    super();
    // eslint-disable-next-line no-new
    new MutationController(this, {
      config: {childList: true, subtree: true, attributes: true, attributeFilter: ['metric', 'by']},
      callback: () => this.collectCharts(),
    });
    this.addEventListener('zn-load', () => {
      if (this.asTable) this.requestUpdate();
    });
    // eslint-disable-next-line no-new
    new ResizeController(this, {callback: () => this.alignHeader()});
  }

  // The body's scrollbar only appears when its rows overflow, so the header makes room for it only then
  private alignHeader() {
    const tbody = this.renderRoot.querySelector<HTMLElement>('.table tbody');
    const thead = tbody?.previousElementSibling as HTMLElement | undefined;
    if (thead) thead.style.paddingRight = `${tbody!.offsetWidth - tbody!.clientWidth}px`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.collectCharts();
    if (this.storeKey) {
      this.store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, 'zncsw:');
      const [metric, by] = (this.store.get(this.storeKey) ?? '').split('\n');
      this.metric = metric || this.metric;
      this.by = by || this.by;
    }
  }

  private collectCharts() {
    this.charts = Array.from(this.children).filter(el => el.hasAttribute('metric')) as HTMLElement[];
  }

  private metrics(): string[] {
    return [...new Set(this.charts.map(chart => chart.getAttribute('metric')!))];
  }

  private breakdowns(metric: string): string[] {
    return [...new Set(this.charts
      .filter(chart => chart.getAttribute('metric') === metric)
      .map(chart => chart.getAttribute('by') ?? '')
      .filter(Boolean))];
  }

  private select(metric: string, by: string) {
    this.metric = metric;
    this.by = by;
    this.store?.set(this.storeKey, `${metric}\n${by}`);
  }

  /** The metric and breakdown on show, after falling back from choices no chart offers. */
  private current() {
    const metrics = this.metrics();
    const metric = metrics.includes(this.metric) ? this.metric : metrics[0] ?? '';
    const breakdowns = this.breakdowns(metric);
    const by = breakdowns.includes(this.by) ? this.by : breakdowns[0] ?? '';
    const shown = this.charts.find(chart => chart.getAttribute('metric') === metric && (chart.getAttribute('by') ?? '') === by);
    return {metrics, metric, breakdowns, by, shown};
  }

  protected updated() {
    const {shown} = this.current();
    // Hidden charts keep their size, so ECharts never lays out at zero width; inert keeps their tooltips away
    this.charts.forEach(chart => chart.inert = this.asTable || chart !== shown);
    this.alignHeader();
  }

  private renderTable(element: HTMLElement | undefined) {
    const chart = element as Partial<ZnChart> | undefined;
    const series = (chart?.data ?? []).filter(s => !s.name.startsWith('_'));
    const append = chart?.yAxisAppend ?? element?.getAttribute('y-axis-append') ?? '';
    const currency = chart?.currency ?? element?.getAttribute('currency') ?? undefined;
    const value = (v: unknown) => typeof v === 'number' ? formatValue(v, append, currency) : '';
    const flows = series.flatMap(s => s.data as unknown[]).filter((d): d is {source: string; target: string; value: number} =>
      !!d && typeof d === 'object' && 'source' in d);
    if (flows.length) {
      return html`
        <table class="table" role="table" style="--columns: 2">
          <thead>
            <tr role="row"><th role="columnheader" scope="col">From</th><th role="columnheader" scope="col">To</th><th role="columnheader" scope="col">Value</th></tr>
          </thead>
          <tbody>${flows.map(f => html`
            <tr role="row"><td role="cell">${f.source}</td><td role="cell">${f.target}</td><td role="cell">${value(f.value)}</td></tr>`)}
          </tbody>
        </table>`;
    }

    // Time series key their points by time, newest first; others by position, labelled by the chart's categories
    const timed = series.some(s => s.data.some(Array.isArray));
    const categories = chart?.categories ?? [];
    const lookup = series.map(s => new Map<number, unknown>(timed
      ? s.data.filter(Array.isArray).map(p => [p[0] as number, p[1] as unknown])
      : s.data.map((v, i) => [i, v as unknown])));
    const keys = [...new Set(lookup.flatMap(values => [...values.keys()]))].sort((a, b) => timed ? b - a : a - b);
    const time = new Intl.DateTimeFormat(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
    const label = (key: number) => timed ? time.format(key) : categories[key] ?? `${key + 1}`;
    // A column with any fractions shows every value to one place, so its digits line up; money always has its cents
    const fixed = lookup.map(values => [...values.values()].some(v => typeof v === 'number' && !Number.isInteger(v)));
    const cell = (v: unknown, column: number) =>
      typeof v === 'number' && fixed[column] && !currency ? `${v.toFixed(1)}${append}` : value(v);
    return html`
      <table class="table" role="table" style="--columns: ${series.length}">
        <thead>
        <tr role="row">
          <th role="columnheader" scope="col">${timed ? 'Time' : 'Category'}</th>
          ${series.map(s => html`
            <th role="columnheader" scope="col">${s.name}</th>`)}
        </tr>
        </thead>
        <tbody>${keys.map(key => html`
          <tr role="row">
            <th role="rowheader" scope="row">${label(key)}</th>
            ${lookup.map((values, i) => html`
              <td role="cell">${cell(values.get(key), i)}</td>`)}
          </tr>`)}
        </tbody>
      </table>`;
  }

  render() {
    const {metrics, metric, breakdowns, by, shown} = this.current();

    // slot="actions" is the navbar's header-actions mode, which drops the inset it keeps inside a panel body
    return html`
      <zn-panel part="base" caption=${this.caption} description=${this.description} inline-description>
        <div slot="actions" class="controls">
          ${breakdowns.length > 1 ? html`
            <zn-dropdown class="breakdowns" placement="bottom-end">
              <zn-button slot="trigger" color="secondary" caret>
                <span><span class="muted">By</span> <strong>${by}</strong></span>
              </zn-button>
              <zn-menu>
                ${breakdowns.map(option => html`
                  <zn-menu-item type="checkbox"
                                checked-position="right"
                                ?checked=${option === by}
                                @click=${() => this.select(metric, option)}>${option}</zn-menu-item>`)}
              </zn-menu>
            </zn-dropdown>` : ''}
          ${metrics.length > 1 ? html`
            <zn-navbar slot="actions" pill aria-label="Metric">
              ${metrics.map(option => html`
                <li class=${option === metric ? 'active' : ''} @click=${() => this.select(option, this.by)}>${option}</li>`)}
            </zn-navbar>` : ''}
          ${breakdowns.length > 1 || metrics.length > 1 ? html`<span class="divider" aria-hidden="true"></span>` : ''}
          <zn-button icon=${this.asTable ? 'chart-line@lu' : 'table@lu'}
                     icon-size="18"
                     icon-button="small"
                     label=${this.asTable ? 'Show as chart' : 'Show as table'}
                     tooltip=${this.asTable ? 'Show as chart' : 'Show as table'}
                     @click=${() => this.asTable = !this.asTable}
                     plain></zn-button>
        </div>
        <div class="charts">
          <slot></slot>
          ${this.asTable ? html`<div class="table-wrap">${this.renderTable(shown)}</div>` : ''}
        </div>
      </zn-panel>`;
  }
}
