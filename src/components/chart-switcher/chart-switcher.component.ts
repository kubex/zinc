import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, state} from 'lit/decorators.js';
import {Store} from '../../internal/storage';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnDropdown from '../dropdown';
import ZnMenu from '../menu';
import ZnMenuItem from '../menu-item';
import ZnNavbar from '../navbar';
import ZnPanel from '../panel';

import styles from './chart-switcher.scss';

/**
 * @summary Shows one chart at a time from a set, picked by metric and by what the metric is broken down by.
 * @documentation https://zinc.style/components/chart-switcher
 * @status experimental
 * @since 1.0
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

  private store?: Store;

  private readonly observer = new MutationController(this, {
    config: {childList: true, subtree: true, attributes: true, attributeFilter: ['metric', 'by']},
    callback: () => this.collectCharts(),
  });

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
    this.charts.forEach(chart => chart.inert = chart !== shown);
  }

  render() {
    const {metrics, metric, breakdowns, by} = this.current();

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
        </div>
        <div class="charts">
          <slot></slot>
        </div>
      </zn-panel>`;
  }
}
