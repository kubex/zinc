import {
  addDays,
  clampRange,
  type DatePreset,
  daysBetween,
  defaultPresets,
  formatDate,
  isIso,
  type Iso,
  monthGrid,
  pick,
  rangeLabel,
  todayIso,
  toUtc
} from './date-range-math';
import {AnchoredPopoverController} from '../../internal/anchored-popover';
import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnIcon from '../icon';
import ZnInput from '../input';

import styles from './date-range.scss';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const POP_WIDTH = 736;
const NARROW = '(max-width: 560px)';
const KEY_STEPS: Record<string, number> = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7};

const presetsConverter = {
  fromAttribute: (value: string | null): DatePreset[] | undefined => {
    try {
      const parsed: unknown = value ? JSON.parse(value) : undefined;
      return Array.isArray(parsed) ? parsed as DatePreset[] : undefined;
    } catch {
      return undefined;
    }
  },
  toAttribute: (value: DatePreset[] | undefined) => value ? JSON.stringify(value) : null,
};

/**
 * @summary A button showing a date range that opens a two-month calendar with quick ranges.
 * @documentation https://zinc.style/components/date-range
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 * @dependency zn-input
 *
 * @event zn-change - Emitted when a range is applied, with `{from, to}` as its detail.
 *
 * @csspart trigger - The button that opens the picker.
 * @csspart popover - The picker popover.
 */
export default class ZnDateRange extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static formAssociated = true;
  static dependencies = {
    'zn-button': ZnButton,
    'zn-icon': ZnIcon,
    'zn-input': ZnInput,
  };

  /** The first day of the range, `YYYY-MM-DD`. Defaults to today. */
  @property({reflect: true}) from = '';

  /** The last day of the range, `YYYY-MM-DD`. Defaults to today. */
  @property({reflect: true}) to = '';

  /** The earliest day that can be picked. */
  @property() min = '';

  /** The latest day that can be picked. */
  @property() max = '';

  /** Quick ranges as a JSON array of `{label, from, to}`, replacing the default ones. */
  @property({converter: presetsConverter}) presets: DatePreset[] | undefined;

  /** A short line shown under the calendar, such as how the range is used. */
  @property() note = '';

  /** Submits `name[from]` and `name[to]` with the form. */
  @property() name = '';

  @state() private draft: {from: Iso | ''; to: Iso | ''} = {from: '', to: ''};
  @state() private view = {year: 0, month0: 0};
  @state() private focusDay: Iso = '';
  private readonly internals: ElementInternals | null;
  // Not `popover`: that is the native Popover API attribute on every HTMLElement
  private readonly anchor = new AnchoredPopoverController(this, {
    trigger: '.date-range__trigger',
    popover: '.date-range__pop',
    width: () => Math.min(POP_WIDTH, window.innerWidth * 0.94),
    align: 'start',
    onHide: reason => {
      if (reason === 'escape') this.focusTrigger();
    },
  });

  constructor() {
    super();
    this.internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('from') || changed.has('to') || changed.has('name')) {
      this.syncFormValue();
    }
  }

  private get rangeFrom(): Iso {
    return isIso(this.from) ? this.from : todayIso();
  }

  private get rangeTo(): Iso {
    return isIso(this.to) ? this.to : this.rangeFrom;
  }

  // A class rather than a media query: WebKit doesn't re-evaluate media queries in adopted sheets on resize
  private get narrow(): boolean {
    return window.matchMedia(NARROW).matches;
  }

  private get bounds(): [Iso | '', Iso | ''] {
    return [isIso(this.min) ? this.min : '', isIso(this.max) ? this.max : ''];
  }

  private syncFormValue() {
    if (!this.internals) return;
    if (!this.name) {
      this.internals.setFormValue(null);
      return;
    }
    const data = new FormData();
    data.append(`${this.name}[from]`, this.rangeFrom);
    data.append(`${this.name}[to]`, this.rangeTo);
    this.internals.setFormValue(data);
  }

  /** Opens the picker. */
  async show() {
    this.draft = {from: this.rangeFrom, to: this.rangeTo};
    this.showMonth(this.draft.from);
    this.focusDay = this.draft.from;
    this.anchor.show();
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLElement>('.date-range__day[tabindex="0"]')?.focus();
  }

  /** Closes the picker without applying. */
  hide() {
    this.anchor.hide();
  }

  private close() {
    this.hide();
    this.focusTrigger();
  }

  private toggle = () => {
    if (this.anchor.open) {
      this.hide();
    } else {
      void this.show();
    }
  };

  private presetRange(preset: DatePreset) {
    return clampRange(preset, ...this.bounds);
  }

  private focusTrigger() {
    const trigger = this.anchor.trigger();
    (trigger?.shadowRoot?.querySelector<HTMLElement>('button, a') ?? trigger)?.focus();
  }

  private applyRange(range: {from: Iso | ''; to: Iso | ''}) {
    if (!range.from || !range.to || this.isDisabled(range.from) || this.isDisabled(range.to)) return;
    this.from = range.from;
    this.to = range.to;
    this.close();
    // Dispatched directly: zn-change's registered type carries no detail
    this.dispatchEvent(new CustomEvent('zn-change', {
      bubbles: true,
      composed: true,
      detail: {from: this.from, to: this.to}
    }));
  }

  private showMonth(iso: Iso) {
    const [y, m] = iso.split('-').map(Number);
    this.view = {year: y, month0: m - 1};
  }

  private shiftMonth(by: number) {
    const date = new Date(Date.UTC(this.view.year, this.view.month0 + by, 1));
    this.view = {year: date.getUTCFullYear(), month0: date.getUTCMonth()};
  }

  private isDisabled(iso: Iso): boolean {
    const [min, max] = this.bounds;
    return (!!min && iso < min) || (!!max && iso > max);
  }

  private choose(iso: Iso) {
    if (this.isDisabled(iso)) return;
    this.draft = pick(this.draft, iso);
    this.focusDay = iso;
  }

  private visible(iso: Iso): boolean {
    const months = this.narrow ? 1 : 2;
    const first = Date.UTC(this.view.year, this.view.month0, 1);
    const end = Date.UTC(this.view.year, this.view.month0 + months, 1);
    const at = toUtc(iso).getTime();
    return at >= first && at < end;
  }

  private dayKeydown = async (e: KeyboardEvent) => {
    const step = KEY_STEPS[e.key];
    const current = (e.target as HTMLElement).dataset.date;
    if (!step || !current) return;
    e.preventDefault();
    const next = addDays(current, step);
    if (!this.visible(next)) {
      this.shiftMonth(step < 0 ? -1 : 1);
    }
    this.focusDay = next;
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLElement>(`[data-date="${next}"]`)?.focus();
  };

  // On commit (blur or Enter), not per keystroke: a date input reports each segment edit as a new valid value
  private typed(end: 'from' | 'to', e: Event) {
    const value = (e.target as ZnInput).value as string;
    if (!isIso(value) || this.isDisabled(value)) return;

    if (end === 'from') {
      this.draft = this.draft.to && value <= this.draft.to ? {from: value, to: this.draft.to} : {from: value, to: ''};
    } else {
      this.draft = this.draft.from && value >= this.draft.from ? {from: this.draft.from, to: value} : {from: value, to: ''};
    }
    this.focusDay = value;
    this.showMonth(value);
  }

  private stop = (e: Event) => e.stopPropagation();

  render() {
    return html`
      <zn-button class="date-range__trigger" part="trigger" panel-bg size="small" icon="calendar@lu"
                 icon-size="16" aria-haspopup="dialog" aria-expanded="${this.anchor.open}" @click="${this.toggle}">
        ${rangeLabel(this.rangeFrom, this.rangeTo)}
        <zn-icon class="date-range__chevron" src="chevron-down@lu" size="14"></zn-icon>
      </zn-button>
      ${this.anchor.open ? this.renderPopover() : nothing}`;
  }

  private renderPopover() {
    const presets = this.presets ?? defaultPresets(todayIso());
    const {from, to} = this.draft;
    const next = new Date(Date.UTC(this.view.year, this.view.month0 + 1, 1));

    return html`
      <div class="${classMap({'date-range__pop': true, 'is-narrow': this.narrow})}" part="popover" role="dialog" aria-label="Date range"
           style="${this.anchor.style}" @zn-change="${this.stop}" @zn-input="${this.stop}"
           @zn-focus="${this.stop}" @zn-blur="${this.stop}">
        <div class="date-range__presets" role="group" aria-label="Quick ranges">
          ${presets.map(preset => {
            const range = this.presetRange(preset);
            const active = !!range && range.from === from && range.to === to;
            return html`
              <button type="button" class="${classMap({'date-range__preset': true, 'is-active': active})}"
                      aria-pressed="${active}" aria-disabled="${!range}"
                      @click="${() => range && this.applyRange(range)}">${preset.label}</button>`;
          })}
        </div>
        <div class="date-range__main">
          <div class="date-range__inputs">
            <zn-input class="date-range__from" type="date" label="From" .value="${from}"
                      min="${this.min || nothing}" max="${this.max || nothing}"
                      @zn-blur="${(e: Event) => this.typed('from', e)}"
                      @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.typed('from', e)}"></zn-input>
            <span class="date-range__dash">to</span>
            <zn-input class="date-range__to" type="date" label="To" .value="${to}"
                      min="${this.min || nothing}" max="${this.max || nothing}"
                      @zn-blur="${(e: Event) => this.typed('to', e)}"
                      @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.typed('to', e)}"></zn-input>
          </div>
          <div class="date-range__months">
            <zn-button class="date-range__nav date-range__nav--prev" icon="chevron-left@lu" icon-size="16"
                       icon-button plain aria-label="Previous month"
                       @click="${() => this.shiftMonth(-1)}"></zn-button>
            ${this.renderMonth(this.view.year, this.view.month0)}
            ${this.renderMonth(next.getUTCFullYear(), next.getUTCMonth())}
            <zn-button class="date-range__nav date-range__nav--next" icon="chevron-right@lu" icon-size="16"
                       icon-button plain aria-label="Next month"
                       @click="${() => this.shiftMonth(1)}"></zn-button>
          </div>
          ${this.note ? html`<p class="date-range__note">${this.note}</p>` : nothing}
          <div class="date-range__foot">
            <span class="date-range__summary">
              ${from && to ? `${rangeLabel(from, to)} · ${daysBetween(from, to) + 1} days` : 'Pick a last day'}
            </span>
            <zn-button color="transparent" @click="${() => this.close()}">Cancel</zn-button>
            <zn-button class="date-range__apply" color="primary" ?disabled="${!from || !to}"
                       @click="${() => this.applyRange(this.draft)}">Apply
            </zn-button>
          </div>
        </div>
      </div>`;
  }

  private renderMonth(year: number, month0: number) {
    const cells = monthGrid(year, month0);
    const rows = Array.from({length: 6}, (_, i) => cells.slice(i * 7, i * 7 + 7)).filter(row => row.some(Boolean));
    const title = new Intl.DateTimeFormat('en-GB', {month: 'long', year: 'numeric', timeZone: 'UTC'})
      .format(new Date(Date.UTC(year, month0, 1)));
    const today = todayIso();
    const {from, to} = this.draft;
    const tabStop = [this.focusDay, from].find(d => d && this.visible(d))
      ?? `${this.view.year}-${String(this.view.month0 + 1).padStart(2, '0')}-01`;

    return html`
      <div class="date-range__month">
        <div class="date-range__head">${title}</div>
        <div class="date-range__grid" role="grid" aria-label="${title}" @keydown="${this.dayKeydown}">
          <div class="date-range__week" role="row">
            ${WEEKDAYS.map(d => html`<span role="columnheader">${d}</span>`)}
          </div>
          ${rows.map(row => html`
            <div class="date-range__row" role="row">
              ${row.map(iso => iso ? html`
                <button type="button" role="gridcell" data-date="${iso}"
                        class="${classMap({
                          'date-range__day': true,
                          'is-start': iso === from,
                          'is-end': !!to && iso === to,
                          'is-in': !!from && !!to && iso > from && iso < to,
                          'is-today': iso === today,
                        })}"
                        tabindex="${iso === tabStop ? 0 : -1}"
                        aria-label="${formatDate(iso)}"
                        aria-selected="${!!from && iso >= from && iso <= (to || from)}"
                        aria-disabled="${this.isDisabled(iso)}"
                        @click="${() => this.choose(iso)}">${Number(iso.slice(8))}</button>` : html`
                <span class="date-range__pad" role="gridcell"></span>`)}
            </div>`)}
        </div>
      </div>`;
  }
}
