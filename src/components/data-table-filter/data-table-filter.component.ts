import {AnchoredPopoverController} from '../../internal/anchored-popover';
import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {
  operatorText,
  type QueryBuilderDateSubmitFormat,
  type QueryBuilderItem,
  QueryBuilderOperators,
  type QueryBuilderOptions
} from "../query-builder";
import {property, state} from 'lit/decorators.js';
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnIcon from "../icon";
import ZnInput from "../input";
import ZnOptGroup from "../opt-group";
import ZnOption from "../option";
import ZnSelect from "../select";
import type {ZnInputEvent} from "../../events/zn-input";

import styles from './data-table-filter.scss';

/** A field offered by the filter: a zn-query-builder filter whose operators may be left out. */
export type FilterField = Omit<QueryBuilderItem, 'operators'> & {operators?: QueryBuilderItem['operators'] | string[]};

interface FilterRule {
  key: string;
  comparator: string;
  value: string;
  /** Kept so a date can be re-encoded when the operator changes. */
  timestamp?: number;
}

export const FILTER_OPERATOR_LABELS: Record<string, string> = {
  eq: 'is',
  neq: 'is not',
  in: 'is any of',
  nin: 'is none of',
  contains: 'contains',
  like: 'is like',
  starts: 'starts with',
  gt: 'is more than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  before: 'is before',
  after: 'is after',
};

const BOOLEAN_OPTIONS: QueryBuilderOptions = {1: 'True', 0: 'False'};
const SUGGESTION_LIMIT = 8;
const FIELD_SEARCH_THRESHOLD = 8;

/**
 * @summary The filter for data tables: a funnel that opens a field / operator / value builder, and chips for the
 * rules that apply.
 * @documentation https://zinc.style/components/data-table-filter
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 * @dependency zn-input
 * @dependency zn-opt-group
 * @dependency zn-option
 * @dependency zn-select
 *
 * @event zn-filter-change - Emitted when the applied rules change. Read the encoded query off `value`.
 * @event zn-clear - Emitted when `clear()` removes every rule.
 */
export default class ZnDataTableFilter extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-icon': ZnIcon,
    'zn-input': ZnInput,
    'zn-opt-group': ZnOptGroup,
    'zn-option': ZnOption,
    'zn-select': ZnSelect,
  };

  // A chips-only filter mirrors another, so it must not submit a second copy of its value
  private _formController: FormControlController = new FormControlController(this, {
    disabled: () => !!this.source,
  });

  private readonly _popover = new AnchoredPopoverController(this, {
    trigger: '.filter__toggle',
    popover: '.filter__pop',
    width: () => Math.min(704, window.innerWidth * 0.94),
    align: 'end',
    focus: ['.filter__rule:last-of-type zn-select[aria-label="Filter field"]'],
    onHide: () => this.discard(),
  });

  private _mirrors = new Set<ZnDataTableFilter>();
  private _emitted?: string;

  @property({type: Array}) filters: FilterField[] = [];

  @property() name: string = "data-table-filter";

  @property() value: string = '';

  /** Fields to offer an empty rule for when the builder opens with nothing applied. */
  @property({attribute: 'default-filters'}) defaultFilters: string = '';

  /** Typeahead values per field. `zn-data-table` fills this from the rows it has loaded. */
  @property({attribute: false}) suggestions: Record<string, string[]> = {};

  /**
   * Another filter to show the chips of. This element then renders only that filter's chips, and that filter stops
   * rendering its own, so a table can keep the funnel in its header and the chips under it.
   */
  @property({attribute: false}) source: ZnDataTableFilter | null = null;

  @state() private _rules: FilterRule[] = [];

  @state() private _typing: {index: number; text: string} | null = null;

  @state() private _fieldSearch: number | null = null;

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

  /** Number of rules that apply. */
  get activeCount(): number {
    return this.committed().length;
  }

  /** Opens the filter builder. */
  show() {
    if (this._rules.length === 0) {
      const defaults = this.defaultFilters.split(',').map(key => key.trim()).filter(key => this.field(key));
      this._rules = defaults.length > 0
        ? defaults.map(key => ({key, comparator: this.operators(this.field(key)!)[0], value: ''}))
        : [{key: '', comparator: '', value: ''}];
    }
    this._popover.show();
  }

  /** Closes the filter builder. */
  hide() {
    this._popover.hide();
  }

  /** Removes every rule. */
  clear() {
    this.setRules([]);
    this.emit('zn-clear');
  }

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this._formController.updateValidity();
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('source')) {
      this.toggleAttribute('data-chips', !!this.source);
      (changed.get('source') as ZnDataTableFilter | null | undefined)?.unmirror(this);
      this.source?.mirror(this);
    }

    if (changed.has('value') && this.value !== this._emitted) {
      this.readValue();
    } else if (changed.has('filters')) {
      this._rules = this._rules.map(rule => rule.timestamp ? rule : this.ruleFrom(rule));
    }
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this._mirrors.forEach(mirror => mirror.requestUpdate());
  }

  connectedCallback() {
    super.connectedCallback();
    this.source?.mirror(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.source?.unmirror(this);
  }

  private mirror(chips: ZnDataTableFilter) {
    this._mirrors.add(chips);
    this.requestUpdate();
  }

  private unmirror(chips: ZnDataTableFilter) {
    if (this._mirrors.delete(chips)) this.requestUpdate();
  }

  private readValue() {
    const pending = this._popover.open ? this._rules.filter(rule => !this.isComplete(rule)) : [];
    this._rules = [...this.decoded(), ...pending];
    this._emitted = this.value;
  }

  /** The complete rules in `value`, which the builder's edits only reach once they are applied. */
  private committed(): FilterRule[] {
    return this.decoded().filter(rule => this.isComplete(rule));
  }

  private decoded(): FilterRule[] {
    let decoded: unknown = [];
    try {
      decoded = this.value ? JSON.parse(atob(this.value)) : [];
    } catch {
      decoded = [];
    }

    return Array.isArray(decoded)
      ? decoded
        .filter((entry: Partial<FilterRule> | null) => typeof entry?.key === 'string' && entry.key)
        .map((entry: {key: string; comparator?: string; value?: unknown}) => this.ruleFrom(entry))
      : [];
  }

  private ruleFrom(entry: {key: string; comparator?: string; value?: unknown}): FilterRule {
    const value = Array.isArray(entry.value) ? entry.value.join(' ') : String(entry.value ?? '');
    const rule: FilterRule = {key: entry.key, comparator: entry.comparator ?? '', value};
    const field = this.field(entry.key);
    if (field && this.isDate(field) && value) {
      rule.timestamp = this.parseDate(value, rule.comparator, field.dateSubmitFormat);
    }
    return rule;
  }

  private field(key: string): FilterField | undefined {
    return this.filters.find(field => field.id === key);
  }

  private operators(field: FilterField): string[] {
    return field.operators?.length ? field.operators : [QueryBuilderOperators.Eq];
  }

  private operatorLabel(op: string): string {
    return FILTER_OPERATOR_LABELS[op] ?? operatorText[op as QueryBuilderOperators]?.toLowerCase() ?? op;
  }

  private optionsFor(field: FilterField): QueryBuilderOptions | undefined {
    if (field.options) return field.options;
    if (field.type === 'bool' || field.type === 'boolean') return BOOLEAN_OPTIONS;
    return undefined;
  }

  private isMultiple(comparator: string): boolean {
    return comparator === 'in' || comparator === 'nin';
  }

  private isDate(field: FilterField): boolean {
    return field.type === 'date' || field.type === 'dateTime';
  }

  private humanize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private isComplete(rule: FilterRule): boolean {
    return !!this.field(rule.key) && !!rule.comparator && rule.value !== '';
  }

  // Option keys keep the space-separated wire format the query builder uses; typed values can contain spaces of
  // their own, so they only split on commas
  private values(field: FilterField | undefined, value: string): string[] {
    return value.split(field && this.optionsFor(field) ? ' ' : ',').map(item => item.trim()).filter(Boolean);
  }

  private ruleText(rule: FilterRule): string {
    const field = this.field(rule.key);
    const name = field ? this.humanize(field.name) : rule.key;
    const options = field && this.optionsFor(field);
    let value = rule.value;
    if (field && this.isDate(field) && rule.timestamp) {
      value = this.dateInputValue(field, rule.timestamp);
    } else if (options) {
      const items = this.isMultiple(rule.comparator) ? this.values(field, rule.value) : [rule.value];
      value = items.map(item => options[item] ?? item).join(', ');
    }
    return `${name} ${this.operatorLabel(rule.comparator)} ${value}`;
  }

  private setLocal(rules: FilterRule[]) {
    this._rules = rules;
  }

  private setRules(rules: FilterRule[]) {
    this.setLocal(rules);
    const complete = rules
      .filter(rule => this.isComplete(rule))
      .map(rule => ({key: rule.key, comparator: rule.comparator, value: rule.value}));
    const encoded = complete.length > 0 ? btoa(JSON.stringify(complete)) : '';
    if (encoded === this.value) return;

    this._emitted = encoded;
    this.value = encoded;
    this._formController.updateValidity();
    this.emit('zn-filter-change');
  }

  private updateRule(index: number, change: Partial<FilterRule>) {
    const rules = this._rules.map((rule, i) => {
      if (i !== index) return rule;
      const next = {...rule, ...change};
      const field = this.field(next.key);

      // A new field resets the operator and value, which may not apply to it
      if (change.key !== undefined && change.key !== rule.key) {
        next.comparator = field ? this.operators(field)[0] : 'eq';
        next.value = '';
        next.timestamp = undefined;
        this._typing = null;
      } else if (change.comparator !== undefined && field) {
        if (next.timestamp) {
          next.value = this.serializeDate(next.timestamp, next.comparator, field.dateSubmitFormat);
        } else if (this.isMultiple(rule.comparator) && !this.isMultiple(next.comparator)) {
          next.value = this.values(field, rule.value)[0] ?? '';
        }
      }
      return next;
    });
    this.setLocal(rules);
  }

  private dateChange(index: number, field: FilterField, input: string) {
    if (!input) {
      this.updateRule(index, {value: '', timestamp: undefined});
      return;
    }
    const timestamp = new Date(field.type === 'dateTime' ? input : `${input}T00:00`).getTime();
    const comparator = this._rules[index].comparator;
    this.updateRule(index, {timestamp, value: this.serializeDate(timestamp, comparator, field.dateSubmitFormat)});
  }

  // Mirrors zn-query-builder's date serialization so backends built against it keep working
  private serializeDate(timestamp: number, comparator: string, format: QueryBuilderDateSubmitFormat = 'legacy'): string {
    if (format === 'timestamp') return timestamp.toString();

    if (format === 'iso') {
      const date = new Date(timestamp);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();
    }

    if (comparator === 'eq' || comparator === 'neq') {
      return (timestamp / 1000).toString();
    }

    // Everything else goes as minutes from now, negated for `before`
    const multiplier = comparator === 'before' ? -1 : 1;
    return (Math.floor((Date.now() - timestamp) / 1000 / 60) * multiplier).toString();
  }

  private parseDate(value: string, comparator: string, format: QueryBuilderDateSubmitFormat = 'legacy'): number | undefined {
    let timestamp: number;
    if (format === 'timestamp') {
      timestamp = Number(value);
    } else if (format === 'iso') {
      const date = new Date(value);
      timestamp = date.getTime() + date.getTimezoneOffset() * 60_000;
    } else if (comparator === 'eq' || comparator === 'neq') {
      timestamp = Number(value) * 1000;
    } else {
      const multiplier = comparator === 'before' ? -1 : 1;
      timestamp = Date.now() - Number(value) * multiplier * 60_000;
    }
    return Number.isFinite(timestamp) ? timestamp : undefined;
  }

  private dateInputValue(field: FilterField, timestamp: number): string {
    const date = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return field.type === 'dateTime' ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
  }

  private suggestionsFor(field: FilterField, rule: FilterRule, index: number): string[] {
    if (this._typing?.index !== index) return [];
    const available = this.suggestions[rule.key] ?? [];
    const multiple = this.isMultiple(rule.comparator);
    const typed = (multiple ? this._typing.text.split(',').pop()! : this._typing.text).trim().toLowerCase();
    const chosen = multiple ? this.values(field, this._typing.text).map(item => item.toLowerCase()) : [];

    return available
      .filter(value => value.toLowerCase().includes(typed) && !chosen.includes(value.toLowerCase())
        && value.toLowerCase() !== typed)
      .slice(0, SUGGESTION_LIMIT);
  }

  private applySuggestion(index: number, field: FilterField, rule: FilterRule, value: string) {
    const typed = this._typing?.text ?? rule.value;
    const next = this.isMultiple(rule.comparator)
      ? [...this.values(field, typed).slice(0, typed.trimEnd().endsWith(',') ? undefined : -1), value].join(',')
      : value;
    this._typing = null;
    this.updateRule(index, {value: next});
  }

  private toggle = () => {
    if (this._popover.open) {
      this.hide();
    } else {
      this.show();
    }
  };

  private apply() {
    this.setRules(this._rules);
    this.hide();
  }

  // Closing without applying abandons the builder's edits
  private discard() {
    this._rules = this.committed();
    this._typing = null;
  }

  private renderToggle() {
    const applied = this.activeCount;

    return html`
      <zn-button icon-button="small"
                 icon="funnel@lu"
                 icon-size="18"
                 tooltip="Filter"
                 aria-label="Filter"
                 muted-notifications
                 notification="${applied || nothing}"
                 aria-expanded="${this._popover.open}"
                 aria-haspopup="dialog"
                 class="${classMap({
                   'filter__toggle': true,
                   'filter__toggle--active': applied > 0,
                   'filter__toggle--open': this._popover.open,
                 })}"
                 @click="${this.toggle}">
      </zn-button>`;
  }

  private renderPopover() {
    if (!this._popover.open) return nothing;

    const incomplete = this._rules.filter(rule => !this.isComplete(rule)).length;
    const hint = incomplete === 0
      ? 'Show records that match all of these'
      : incomplete === 1 ? 'Choose a value for the empty filter to apply it' : 'Choose a value for each empty filter to apply it';
    const used = new Set(this._rules.map(rule => rule.key));
    const canAdd = this.filters.some(field => !used.has(field.id));

    return html`
      <div class="filter__pop" role="dialog" aria-label="Filters" style="${this._popover.style}">
        <div class="filter__pop__head">
          <b>Filters</b>
          <span class="filter__pop__meta">${hint}</span>
        </div>
        <div class="filter__pop__body">
          ${this._rules.map((rule, index) => this.renderRule(rule, index, used))}
        </div>
        <div class="filter__pop__foot">
          <zn-button size="small" color="secondary" icon="plus@lu" icon-size="14" ?disabled="${!canAdd}"
                     @click="${() => this.setLocal([...this._rules, {key: '', comparator: '', value: ''}])}">
            Add filter
          </zn-button>
          <span class="filter__pop__spacer"></span>
          ${this._rules.some(rule => this.isComplete(rule)) ? html`
            <zn-button size="small" color="transparent" @click="${() => this.setLocal([])}">Clear all</zn-button>` : nothing}
          <zn-button size="small" color="primary" @click="${() => this.apply()}">Apply</zn-button>
        </div>
      </div>`;
  }

  private renderRule(rule: FilterRule, index: number, used: Set<string>) {
    const field = this.field(rule.key);
    const fields = this.filters.filter(f => f.id === rule.key || !used.has(f.id));
    const searchable = this.filters.length > FIELD_SEARCH_THRESHOLD;
    const placeholder = searchable && this._fieldSearch === index
      ? `Search ${this.filters.length} fields...`
      : 'Please select...';

    return html`
      <div class="filter__rule">
        <zn-select placeholder="${placeholder}" value="${rule.key}" aria-label="Filter field" ?search="${searchable}"
                   @zn-show="${() => { this._fieldSearch = index; }}"
                   @zn-hide="${() => { this._fieldSearch = null; }}"
                   @zn-change="${(e: Event) => this.updateRule(index, {key: (e.target as ZnSelect).value as string})}">
          <zn-opt-group label="Filter by">
            ${fields.map(f => html`<zn-option value="${f.id}">${this.humanize(f.name)}</zn-option>`)}
          </zn-opt-group>
        </zn-select>
        <zn-select value="${rule.comparator}" ?disabled="${!field}" aria-label="Filter operator"
                   @zn-change="${(e: Event) => this.updateRule(index, {comparator: (e.target as ZnSelect).value as string})}">
          ${field ? this.operators(field).map(op => html`<zn-option value="${op}">${this.operatorLabel(op)}</zn-option>`) : nothing}
        </zn-select>
        ${this.renderValue(rule, index, field)}
        <zn-button icon="trash-2@lu" icon-size="16" icon-color="grey" icon-button="small" plain aria-label="Remove filter"
                   @click="${() => this.setLocal(this._rules.filter((_, i) => i !== index))}"></zn-button>
        ${field ? this.renderSuggestions(field, rule, index) : nothing}
      </div>`;
  }

  private renderValue(rule: FilterRule, index: number, field?: FilterField) {
    const options = field && this.optionsFor(field);
    if (field && options) {
      return html`
        <zn-select placeholder="Value" value="${rule.value}" aria-label="Filter value"
                   ?multiple="${this.isMultiple(rule.comparator)}"
                   @zn-change="${(e: Event) => {
                     const value = (e.target as ZnSelect).value;
                     this.updateRule(index, {value: Array.isArray(value) ? value.join(' ') : value});
                   }}">
          ${Object.entries(options).map(([value, label]) => html`<zn-option value="${value}">${label}</zn-option>`)}
        </zn-select>`;
    }

    if (field && this.isDate(field)) {
      return html`
        <zn-input type="${field.type === 'dateTime' ? 'datetime-local' : 'date'}" aria-label="Filter value"
                  value="${rule.timestamp ? this.dateInputValue(field, rule.timestamp) : ''}"
                  @zn-change="${(e: Event) => this.dateChange(index, field, (e.target as ZnInput).value as string)}"></zn-input>`;
    }

    return html`
      <zn-input type="${field?.type === 'number' ? 'number' : 'text'}" no-spin-buttons placeholder="Value"
                value="${rule.value}" ?disabled="${!field}" aria-label="Filter value"
                @zn-input="${(e: ZnInputEvent) => { this._typing = {index, text: (e.target as ZnInput).value as string}; }}"
                @zn-change="${(e: Event) => {
                  this._typing = null;
                  this.updateRule(index, {value: (e.target as ZnInput).value as string});
                }}"></zn-input>`;
  }

  private renderSuggestions(field: FilterField, rule: FilterRule, index: number) {
    const suggestions = this.suggestionsFor(field, rule, index);
    if (suggestions.length === 0) return nothing;

    return html`
      <div class="filter__suggestions" role="listbox" aria-label="Suggestions">
        ${suggestions.map(value => html`
          <button class="filter__suggestion" role="option" aria-selected="false"
                  @mousedown="${(e: Event) => e.preventDefault()}"
                  @click="${() => this.applySuggestion(index, field, rule, value)}">${value}</button>`)}
      </div>`;
  }

  private renderChips(owner: ZnDataTableFilter) {
    const applied = owner.committed();
    if (applied.length === 0) return nothing;

    return html`
      <div class="filter__chips">
        <span class="filter__chips__label">Filters:</span>
        ${applied.map(rule => html`
          <span class="filter__chip">
            <button class="filter__chip__text" @click="${(e: Event) => {
              e.stopPropagation();
              owner.show();
            }}">${owner.ruleText(rule)}</button>
            <button class="filter__chip__remove" aria-label="Remove filter: ${owner.ruleText(rule)}"
                    @click="${() => owner.setRules(applied.filter(r => r !== rule))}">
              <zn-icon src="x@lu" size="14"></zn-icon>
            </button>
          </span>`)}
        <button class="filter__chips__clear" @click="${() => owner.setRules([])}">Clear all</button>
      </div>`;
  }

  render() {
    if (this.source) return this.renderChips(this.source);
    if (this.filters.length === 0) return nothing;

    return html`
      ${this.renderToggle()}
      ${this.renderPopover()}
      ${this._mirrors.size === 0 ? this.renderChips(this) : nothing}`;
  }
}
