import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {property, state} from 'lit/decorators.js';
import {
  type QueryBuilderData,
  type QueryBuilderItem,
  QueryBuilderOperators,
  type QueryBuilderOptions
} from "../query-builder";
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnDropdown from "../dropdown";
import ZnInput from "../input";
import ZnMenu from "../menu";
import ZnMenuItem from "../menu-item";
import type {ZnInputEvent} from "../../events/zn-input";

import styles from './data-table-filter.scss';

interface ActiveFilter {
  key: string;
  comparator: string;
  value: string;
}

const BOOLEAN_OPTIONS: QueryBuilderOptions = {1: 'True', 0: 'False'};
const TEXT_DEBOUNCE = 350;

/**
 * @summary An inline filter bar for data tables. Each active filter is a pill whose dropdown sets its value.
 * @documentation https://zinc.style/components/data-table-filter
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
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
    'zn-dropdown': ZnDropdown,
    'zn-input': ZnInput,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
  };

  private _formController: FormControlController = new FormControlController(this, {});
  private _textTimeout?: number;

  @property({type: Array}) filters: QueryBuilderData = [];

  @property() name: string = "data-table-filter";

  @property() value: string;

  /** Filter keys to show a pill for before the user adds any. */
  @property({attribute: 'default-filters'}) defaultFilters: string = '';

  @state() private _active: ActiveFilter[] = [];

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

  private comparatorFor(filter: QueryBuilderItem): QueryBuilderOperators {
    return filter.operators?.length > 0 ? filter.operators[0] : QueryBuilderOperators.Eq;
  }

  // `in`/`nin` take a set of values; every other comparator holds one
  private isMultiple(filter: QueryBuilderItem): boolean {
    const comparator = this.comparatorFor(filter);
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
    if (emit) this.emitChange();
  }

  private removeFilter(key: string) {
    this._active = this._active.filter(item => item.key !== key);
    this.emitChange();
  }

  private setValue(key: string, value: string) {
    this._active = this._active.map(item => item.key === key ? {...item, value} : item);
    this.emitChange();
  }

  private toggleOption(filter: QueryBuilderItem, active: ActiveFilter, option: string) {
    if (!this.isMultiple(filter)) {
      this.setValue(active.key, active.value === option ? '' : option);
      return;
    }

    const selected = this.selectedValues(active);
    const next = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];

    this.setValue(active.key, next.join(' '));
  }

  private selectedValues(active: ActiveFilter): string[] {
    return active.value.split(' ').filter(item => item.length > 0);
  }

  private emitChange() {
    const data = this._active
      .filter(item => item.value.length > 0)
      .map(item => ({key: item.key, comparator: item.comparator, value: item.value}));

    this.value = data.length > 0 ? btoa(JSON.stringify(data)) : '';
    this._formController.updateValidity();
    this.emit('zn-filter-change');
  }

  private handleTextInput(key: string, event: ZnInputEvent) {
    const input = event.target as ZnInput;
    const value = input.value as string;

    if (this._textTimeout) window.clearTimeout(this._textTimeout);
    this._textTimeout = window.setTimeout(() => this.setValue(key, value), TEXT_DEBOUNCE);
  }

  private humanize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private pillLabel(filter: QueryBuilderItem, active: ActiveFilter) {
    const name = this.humanize(filter.name);
    const selected = this.selectedValues(active);

    if (selected.length === 0) return name;
    if (selected.length > 1) return `${name} (${selected.length})`;

    const options = this.optionsFor(filter);
    return `${name}: ${options ? options[selected[0]] ?? selected[0] : selected[0]}`;
  }

  private renderPill(active: ActiveFilter) {
    const filter = this.definition(active.key);
    if (!filter) return nothing;

    return html`
      <zn-dropdown placement="bottom-start" ?stay-open-on-select="${this.isMultiple(filter)}">
        <zn-button slot="trigger"
                   class="filter-bar__pill"
                   pill
                   panel-bg
                   icon="chevron-down@lu"
                   icon-size="16"
                   icon-position="right">${this.pillLabel(filter, active)}
        </zn-button>
        <zn-menu variant="shell">
          ${this.renderEditor(filter, active)}
          <zn-menu-item class="filter-bar__remove"
                        @zn-menu-select="${() => this.removeFilter(active.key)}">
            <span slot="prefix" class="filter-bar__remove__icon">
              <zn-icon src="trash-2@lu" size="16"></zn-icon>
            </span>
            Remove
          </zn-menu-item>
        </zn-menu>
      </zn-dropdown>`;
  }

  private renderEditor(filter: QueryBuilderItem, active: ActiveFilter) {
    const options = this.optionsFor(filter);

    if (!options) {
      return html`
        <div class="filter-bar__input">
          <zn-input size="small"
                    type="${filter.type === 'number' ? 'number' : 'text'}"
                    placeholder="${this.humanize(filter.name)}"
                    value="${active.value}"
                    @zn-input="${(e: ZnInputEvent) => this.handleTextInput(active.key, e)}">
          </zn-input>
        </div>`;
    }

    const selected = this.selectedValues(active);

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
