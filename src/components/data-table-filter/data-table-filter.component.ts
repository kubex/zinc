import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {
  operatorText,
  type QueryBuilderData,
  type QueryBuilderDateSubmitFormat,
  type QueryBuilderItem,
  QueryBuilderOperators,
  type QueryBuilderOptions
} from "../query-builder";
import {property, state} from 'lit/decorators.js';
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnDatepicker from "../datepicker";
import ZnDropdown from "../dropdown";
import ZnInput from "../input";
import ZnMenu from "../menu";
import ZnMenuItem from "../menu-item";
import type {ZnInputEvent} from "../../events/zn-input";

import styles from './data-table-filter.scss';

interface ActiveFilter {
  key: string;
  comparator: QueryBuilderOperators;
  value: string;
  /** Display text for values the wire format renders unreadable, such as dates. */
  label?: string;
  /** Kept so a date can be re-encoded when the comparator changes. */
  timestamp?: number;
}

const BOOLEAN_OPTIONS: QueryBuilderOptions = {1: 'True', 0: 'False'};
const TEXT_DEBOUNCE = 350;
const SUGGESTION_LIMIT = 8;

// Pills have to stay short, so the wordier operators get a compact label
const OPERATOR_LABELS: Partial<Record<QueryBuilderOperators, string>> = {
  [QueryBuilderOperators.Eq]: 'is',
  [QueryBuilderOperators.Neq]: 'is not',
  [QueryBuilderOperators.Gt]: '>',
  [QueryBuilderOperators.Gte]: '\u2265',
  [QueryBuilderOperators.Lt]: '<',
  [QueryBuilderOperators.Lte]: '\u2264',
  [QueryBuilderOperators.In]: 'is any of',
  [QueryBuilderOperators.Nin]: 'is none of',
  [QueryBuilderOperators.Before]: 'before',
  [QueryBuilderOperators.After]: 'after',
};

/**
 * @summary An inline filter bar for data tables. Each active filter is a pill whose dropdown sets its value.
 * @documentation https://zinc.style/components/data-table-filter
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-datepicker
 * @dependency zn-dropdown
 * @dependency zn-input
 * @dependency zn-menu
 * @dependency zn-menu-item
 *
 * @event zn-filter-change - Emitted when the active filters change. Read the encoded query off `value`.
 */
export default class ZnDataTableFilter extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-datepicker': ZnDatepicker,
    'zn-dropdown': ZnDropdown,
    'zn-input': ZnInput,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
  };

  private _formController: FormControlController = new FormControlController(this, {});
  private _textTimeout?: number;
  private _pendingOpen?: string;

  @property({type: Array}) filters: QueryBuilderData = [];

  @property() name: string = "data-table-filter";

  @property() value: string = '';

  /** Filter keys to show a pill for before the user adds any. */
  @property({attribute: 'default-filters'}) defaultFilters: string = '';

  /** Typeahead values per filter key. `zn-data-table` fills this from the rows it has loaded. */
  @property({attribute: false}) suggestions: Record<string, string[]> = {};

  @state() private _active: ActiveFilter[] = [];

  // What the user has typed so far, which the debounced value hasn't caught up with yet
  @state() private _typing: Record<string, string> = {};

  get validationMessage(): string {
    return '';
  }

  get validity(): ValidityState {
    return validValidityState;
  }

  checkValidity(): boolean {
    return true;
  }

  getForm(): HTMLFormElement | null {
    return this._formController.getForm();
  }

  reportValidity(): boolean {
    return true;
  }

  setCustomValidity(): void {
    this._formController.updateValidity();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._formController.updateValidity();
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);

    const key = this._pendingOpen;
    if (!key) return;
    this._pendingOpen = undefined;

    // The pill has only just rendered, so let it upgrade before anchoring a panel to it
    requestAnimationFrame(() => {
      const pill = [...this.shadowRoot!.querySelectorAll('zn-dropdown')]
        .find(dropdown => dropdown.dataset.key === key);

      // The panel animates in, so the field can only take focus once it has settled
      void pill?.show().then(() => requestAnimationFrame(() => pill.querySelector('zn-input')?.focus()));
    });
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('filters') && this._active.length === 0) {
      this.defaultFilters
        .split(',')
        .map(key => key.trim())
        .filter(key => key.length > 0)
        .forEach(key => this.addFilter(key, false));
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._textTimeout) {
      window.clearTimeout(this._textTimeout);
    }
  }

  /** Number of filters with a value set. */
  get activeCount(): number {
    return this._active.filter(item => item.value.length > 0).length;
  }

  /** Removes every active filter. */
  clear() {
    this._active = [];
    this.emitChange();
    this.emit('zn-clear');
  }

  private definition(key: string): QueryBuilderItem | undefined {
    return this.filters.find((item: QueryBuilderItem) => item.id === key);
  }

  private operatorsFor(filter: QueryBuilderItem): QueryBuilderOperators[] {
    return filter.operators?.length > 0 ? filter.operators : [QueryBuilderOperators.Eq];
  }

  private comparatorFor(filter: QueryBuilderItem): QueryBuilderOperators {
    return this.operatorsFor(filter)[0];
  }

  private operatorLabel(comparator: QueryBuilderOperators): string {
    return OPERATOR_LABELS[comparator] ?? operatorText[comparator].toLowerCase();
  }

  // `in`/`nin` take a set of values; every other comparator holds one
  private isMultiple(comparator: QueryBuilderOperators): boolean {
    return comparator === QueryBuilderOperators.In || comparator === QueryBuilderOperators.Nin;
  }

  private optionsFor(filter: QueryBuilderItem): QueryBuilderOptions | undefined {
    if (filter.options) return filter.options;
    if (filter.type === 'bool' || filter.type === 'boolean') return BOOLEAN_OPTIONS;
    return undefined;
  }

  private addFilter(key: string, emit = true) {
    if (this._active.some(item => item.key === key)) return;

    const filter = this.definition(key);
    if (!filter) return;

    this._active = [...this._active, {key, comparator: this.comparatorFor(filter), value: ''}];

    if (emit) {
      // Picking a filter and setting its value is one action, so carry straight on to the value
      this._pendingOpen = key;
      this.emitChange();
    }
  }

  private removeFilter(key: string) {
    this._active = this._active.filter(item => item.key !== key);
    this.emitChange();
  }

  private setValue(key: string, value: string, label?: string, timestamp?: number) {
    this._active = this._active.map(item => item.key === key ? {...item, value, label, timestamp} : item);
    this.emitChange();
  }

  private setComparator(filter: QueryBuilderItem, active: ActiveFilter, comparator: QueryBuilderOperators) {
    // A set of values can't survive a move to a comparator that holds one
    const value = this.isMultiple(active.comparator) && !this.isMultiple(comparator)
      ? this.selectedValues(filter, active)[0] ?? ''
      : active.value;

    this._active = this._active.map(item => item.key === active.key
      ? {
        ...item,
        comparator,
        value: item.timestamp
          ? this.serializeDate(item.timestamp, comparator, filter.dateSubmitFormat)
          : value,
      }
      : item);
    this.emitChange();
  }

  private toggleOption(filter: QueryBuilderItem, active: ActiveFilter, option: string) {
    if (!this.isMultiple(active.comparator)) {
      this.setValue(active.key, active.value === option ? '' : option);
      return;
    }

    const selected = this.selectedValues(filter, active);
    const next = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];

    this.setValue(active.key, next.join(' '));
  }

  // Option keys keep the space-separated wire format the query builder uses; typed
  // values can contain spaces of their own, so they only split on commas
  private selectedValues(filter: QueryBuilderItem, active: ActiveFilter): string[] {
    return active.value
      .split(this.optionsFor(filter) ? ' ' : ',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private emitChange() {
    const data = this._active
      .filter(item => item.value.length > 0)
      .map(item => ({key: item.key, comparator: item.comparator, value: item.value}));

    this.value = data.length > 0 ? btoa(JSON.stringify(data)) : '';
    this._formController.updateValidity();
    this.emit('zn-filter-change');
  }

  private handleDateInput(filter: QueryBuilderItem, active: ActiveFilter, event: Event) {
    const picker = event.target as ZnDatepicker;
    const timestamp = picker.timestamp;

    if (!timestamp) {
      this.setValue(active.key, '');
      return;
    }

    this.setValue(
      active.key,
      this.serializeDate(timestamp, active.comparator, filter.dateSubmitFormat),
      picker.value as string,
      timestamp
    );

    // A time picker needs the panel to stay put while the time is set
    if (filter.type !== 'dateTime') {
      void picker.closest('zn-dropdown')?.hide();
    }
  }

  // Mirrors zn-query-builder's date serialization so backends built against it keep working
  private serializeDate(
    timestamp: number,
    comparator: QueryBuilderOperators,
    format: QueryBuilderDateSubmitFormat = 'legacy'
  ): string {
    if (format === 'timestamp') return timestamp.toString();

    if (format === 'iso') {
      const date = new Date(timestamp);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();
    }

    if (comparator === QueryBuilderOperators.Eq || comparator === QueryBuilderOperators.Neq) {
      return (timestamp / 1000).toString();
    }

    // Everything else goes as minutes from now, negated for `before`
    const multiplier = comparator === QueryBuilderOperators.Before ? -1 : 1;
    return (Math.floor((Date.now() - timestamp) / 1000 / 60) * multiplier).toString();
  }

  private handleTextInput(key: string, event: ZnInputEvent) {
    const input = event.target as ZnInput;
    const value = input.value as string;

    this._typing = {...this._typing, [key]: value};

    if (this._textTimeout) window.clearTimeout(this._textTimeout);
    this._textTimeout = window.setTimeout(() => this.setValue(key, value), TEXT_DEBOUNCE);
  }

  private suggestionsFor(filter: QueryBuilderItem, active: ActiveFilter): string[] {
    const available = this.suggestions[active.key] ?? [];
    if (available.length === 0) return [];

    // Match the term being typed, which for a multi-value filter is the one after the last comma
    const typed = (this._typing[active.key] ?? active.value).split(',').pop()!.trim().toLowerCase();
    const selected = this.selectedValues(filter, active).map(item => item.toLowerCase());

    return available
      .filter(value => value.toLowerCase().includes(typed) && !selected.includes(value.toLowerCase()))
      .slice(0, SUGGESTION_LIMIT);
  }

  private applySuggestion(filter: QueryBuilderItem, active: ActiveFilter, value: string, event: Event) {
    if (this._textTimeout) window.clearTimeout(this._textTimeout);

    const next = this.isMultiple(active.comparator)
      ? [...this.selectedValues(filter, active), value].join(',')
      : value;

    this._typing = {...this._typing, [active.key]: next};
    this.setValue(active.key, next);

    if (!this.isMultiple(active.comparator)) {
      void (event.currentTarget as HTMLElement).closest('zn-dropdown')?.hide();
    }
  }

  private humanize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private pillLabel(filter: QueryBuilderItem, active: ActiveFilter) {
    const name = this.humanize(filter.name);
    const selected = this.selectedValues(filter, active);

    if (selected.length === 0) return name;

    // With a choice of operator the pill has to say which one is applied
    const operator = this.operatorsFor(filter).length > 1
      ? ` ${this.operatorLabel(active.comparator)}`
      : '';

    if (selected.length > 1) return `${name}${operator} (${selected.length})`;

    const options = this.optionsFor(filter);
    const value = active.label ?? (options ? options[selected[0]] ?? selected[0] : selected[0]);

    return operator ? `${name}${operator} ${value}` : `${name}: ${value}`;
  }

  private renderOperators(filter: QueryBuilderItem, active: ActiveFilter) {
    const operators = this.operatorsFor(filter);
    if (operators.length < 2) return nothing;

    return html`
      <div class="filter-bar__operators">
        ${operators.map(operator => html`
          <zn-button class="${classMap({
            'filter-bar__operator': true,
            'filter-bar__operator--selected': operator === active.comparator,
          })}"
                     outline
                     @click="${() => this.setComparator(filter, active, operator)}">
            ${this.operatorLabel(operator)}
          </zn-button>`)}
      </div>`;
  }

  private renderPill(active: ActiveFilter) {
    const filter = this.definition(active.key);
    if (!filter) return nothing;

    const operators = this.operatorsFor(filter);

    return html`
      <zn-dropdown placement="bottom-start"
                   data-key="${active.key}"
                   ?stay-open-on-select="${this.isMultiple(active.comparator)}">
        <zn-button slot="trigger"
                   class="filter-bar__pill"
                   pill
                   panel-bg
                   icon="chevron-down@lu"
                   icon-size="16"
                   icon-position="right">${this.pillLabel(filter, active)}
        </zn-button>
        ${this.optionsFor(filter)
          ? html`
            <zn-menu variant="shell">
              ${operators.length > 1 ? html`
                ${operators.map(operator => html`
                  <zn-menu-item type="checkbox"
                                keep-open
                                ?checked="${operator === active.comparator}"
                                @zn-menu-select="${() => this.setComparator(filter, active, operator)}">
                    ${this.operatorLabel(operator)}
                  </zn-menu-item>`)}
                <div class="filter-bar__separator"></div>` : nothing}
              ${this.renderOptionItems(filter, active)}
              <zn-menu-item class="filter-bar__remove"
                            @zn-menu-select="${() => this.removeFilter(active.key)}">
                <span slot="prefix" class="filter-bar__remove__icon">
                  <zn-icon src="trash-2@lu" size="16"></zn-icon>
                </span>
                Remove
              </zn-menu-item>
            </zn-menu>`
          : html`
            <div class="filter-bar__editor">
              ${this.renderOperators(filter, active)}
              ${this.renderValueInput(filter, active)}
              <zn-button class="filter-bar__remove-button"
                         text
                         icon="trash-2@lu"
                         icon-size="16"
                         @click="${() => this.removeFilter(active.key)}">Remove
              </zn-button>
            </div>`}
      </zn-dropdown>`;
  }

  private isDateFilter(filter: QueryBuilderItem): boolean {
    return filter.type === 'date' || filter.type === 'dateTime';
  }

  private renderValueInput(filter: QueryBuilderItem, active: ActiveFilter) {
    if (this.isDateFilter(filter)) {
      return html`
        <zn-datepicker inline
                       ?time-picker="${filter.type === 'dateTime'}"
                       format-time="HH:mm"
                       @zn-change="${(e: Event) => this.handleDateInput(filter, active, e)}">
        </zn-datepicker>`;
    }

    const suggestions = this.suggestionsFor(filter, active);

    return html`
      <zn-input type="${filter.type === 'number' ? 'number' : 'text'}"
                no-spin-buttons
                placeholder="${this.humanize(filter.name)}"
                value="${active.value}"
                @zn-input="${(e: ZnInputEvent) => this.handleTextInput(active.key, e)}">
      </zn-input>
      ${suggestions.length > 0 ? html`
        <div class="filter-bar__suggestions">
          ${suggestions.map(value => html`
            <zn-button class="filter-bar__suggestion"
                       text
                       @click="${(e: Event) => this.applySuggestion(filter, active, value, e)}">${value}
            </zn-button>`)}
        </div>` : nothing}`;
  }

  private renderOptionItems(filter: QueryBuilderItem, active: ActiveFilter) {
    const options = this.optionsFor(filter)!;
    const selected = this.selectedValues(filter, active);

    return Object.keys(options).map(key => html`
      <zn-menu-item type="checkbox"
                    value="${key}"
                    ?checked="${selected.includes(key)}"
                    @zn-menu-select="${() => this.toggleOption(filter, active, key)}">${options[key]}
      </zn-menu-item>`);
  }

  private renderAddFilter() {
    const available = this.filters.filter(
      (filter: QueryBuilderItem) => !this._active.some(item => item.key === filter.id)
    );

    if (available.length === 0) return nothing;

    return html`
      <zn-dropdown placement="bottom-start">
        <zn-button slot="trigger"
                   class="filter-bar__add"
                   icon-button="small"
                   icon="plus@lu"
                   icon-size="18"
                   tooltip="Add filter"
                   aria-label="Add filter">
        </zn-button>
        <zn-menu variant="shell">
          ${available.map((filter: QueryBuilderItem) => html`
            <zn-menu-item value="${filter.id}"
                          @zn-menu-select="${() => this.addFilter(filter.id)}">${this.humanize(filter.name)}
            </zn-menu-item>`)}
        </zn-menu>
      </zn-dropdown>`;
  }

  render() {
    if (this.filters.length === 0) return nothing;

    return html`
      <div class="filter-bar">
        ${this._active.map((active: ActiveFilter) => this.renderPill(active))}
        ${this.renderAddFilter()}
        ${this._active.length > 0 ? html`
          <zn-button class="filter-bar__clear" text @click="${this.clear}">Clear</zn-button>` : nothing}
      </div>
    `;
  }
}
