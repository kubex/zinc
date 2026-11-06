import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {defaultValue} from '../../internal/default-value';
import {FormControlController} from '../../internal/form';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import type ZnInput from '../input';

import formControlStyles from '../../form-control.scss';
import styles from './key-value.scss';

interface KeyValueRow {
  key: string;
  value: string;
}

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

/**
 * @summary Edits a list of name and value pairs, submitted as a JSON object.
 * @documentation https://zinc.style/components/key-value
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-input
 * @dependency zn-select
 * @dependency zn-option
 * @dependency zn-button
 *
 * @event zn-change - Emitted when a pair is added, removed or edited.
 *
 * @slot label - The label. Alternatively, use the `label` attribute.
 * @slot help-text - Text under the pairs. Alternatively, use the `help-text` attribute.
 *
 * @csspart base - The component's base wrapper.
 * @csspart row - Each name and value pair.
 */
export default class ZnKeyValue extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = [unsafeCSS(formControlStyles), unsafeCSS(styles)];

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');

  private readonly formControlController = new FormControlController(this, {
    value: (control: ZnKeyValue) => control.value,
  });

  @property() name = '';

  /**
   * The pairs as a JSON object, such as `{"1": "{{recipient.firstName}}"}`. With `list`, the names as a JSON array,
   * such as `["10.0.0.0/24"]`.
   */
  @property() value = '{}';

  /** The value a form reset restores, taken from the initial `value` attribute. */
  @defaultValue() defaultValue = '{}';

  @property() label = '';

  @property({attribute: 'help-text'}) helpText = '';

  @property({attribute: 'key-label'}) keyLabel = 'Name';

  @property({attribute: 'value-label'}) valueLabel = 'Value';

  @property({attribute: 'add-text'}) addText = 'Add';

  /** Passed to each value input, so its slash menu can insert merge fields. */
  @property({attribute: 'slash-items'}) slashItems = '';

  /**
   * Makes each value a choice instead of free text: a JSON object of option values to labels, such as
   * `{"default": "System default", "auto": "Auto approve"}`. New rows take the first option.
   */
  @property({attribute: 'value-options', type: Object}) valueOptions: Record<string, string> | null = null;

  /** Edits a plain list of names with no values, submitted as a JSON array. */
  @property({type: Boolean, reflect: true}) list = false;

  @property({reflect: true}) form = '';

  @property({type: Boolean, reflect: true}) disabled = false;

  @state() private _rows: KeyValueRow[] = [];

  get validity(): ValidityState {
    return {valid: true} as ValidityState;
  }

  get validationMessage(): string {
    return '';
  }

  checkValidity(): boolean {
    return true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return true;
  }

  setCustomValidity(): void {
  }

  protected willUpdate(changed: PropertyValues) {
    if (this.list && this.value === '{}') {
      this.value = '[]';
    }
    if (changed.has('value') && this.value !== this._serialise()) {
      this._rows = this._parse(this.value);
    }
    this._rows = this._withSpareRow(this._rows);
  }

  private get _defaultValue(): string {
    return this.valueOptions ? Object.keys(this.valueOptions)[0] ?? '' : '';
  }

  private _emptyRow(): KeyValueRow {
    return {key: '', value: this._defaultValue};
  }

  // There's always a row to type into, so an empty list never leaves the add button on its own
  private _withSpareRow(rows: KeyValueRow[]): KeyValueRow[] {
    return rows.length ? rows : [this._emptyRow()];
  }

  private _parse(value: string): KeyValueRow[] {
    try {
      const parsed: unknown = JSON.parse(value || (this.list ? '[]' : '{}'));
      if (Array.isArray(parsed)) {
        return parsed.map(key => ({key: String(key ?? ''), value: this._defaultValue}));
      }
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed as Record<string, unknown>).map(([key, v]) => ({key, value: String(v ?? '')}));
      }
    } catch {
      // An unreadable value starts empty rather than breaking the form
    }
    return [];
  }

  private _serialise(): string {
    const named = this._rows.filter(row => row.key.trim());
    if (this.list) {
      return JSON.stringify(named.map(row => row.key.trim()));
    }
    const pairs: Record<string, string> = {};
    named.forEach(row => pairs[row.key.trim()] = row.value);
    return JSON.stringify(pairs);
  }

  private _update(rows: KeyValueRow[]) {
    this._rows = rows;
    this.value = this._serialise();
    this.emit('zn-change');
  }

  private _edit(index: number, field: keyof KeyValueRow, e: Event) {
    const rows = [...this._rows];
    rows[index] = {...rows[index], [field]: (e.target as HTMLInputElement).value};
    this._update(rows);
  }

  private get _reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private _easing(): string {
    return getComputedStyle(this).getPropertyValue('--zn-ease-out').trim() || EASE_OUT;
  }

  private async _add() {
    this._update([...this._rows, this._emptyRow()]);
    await this.updateComplete;
    const rows = this.shadowRoot!.querySelectorAll<HTMLElement>('.key-value__row');
    const row = rows[rows.length - 1];
    if (!row) return;
    // Opacity and transform only: the new inputs render for the first time during these frames
    row.animate(
      this._reduceMotion
        ? [{opacity: 0}, {opacity: 1}]
        : [{opacity: 0, transform: 'translateY(-4px)'}, {opacity: 1, transform: 'translateY(0)'}],
      {duration: this._reduceMotion ? 150 : 180, easing: this._easing()});
    const input = row.querySelector<ZnInput>('.key-value__key');
    await input?.updateComplete;
    input?.focus();
  }

  private async _remove(row: KeyValueRow, rowElement: HTMLElement) {
    if (this._rows.length === 1) {
      this._update([this._emptyRow()]);
      return;
    }
    rowElement.style.pointerEvents = 'none';
    rowElement.style.overflow = 'hidden';
    const height = rowElement.getBoundingClientRect().height;
    await rowElement.animate(
      this._reduceMotion
        ? [{opacity: 1}, {opacity: 0}]
        : [{opacity: 1, transform: 'scale(1)', height: `${height}px`}, {opacity: 0, transform: 'scale(0.98)', height: '0px'}],
      {duration: this._reduceMotion ? 150 : 220, easing: this._easing()}).finished.catch(() => undefined);
    rowElement.style.pointerEvents = '';
    rowElement.style.overflow = '';
    this._update(this._rows.filter(r => r !== row));
  }

  private _renderValue(row: KeyValueRow, index: number) {
    if (this.list) return null;
    if (this.valueOptions) {
      return html`
        <zn-select class="key-value__value" .value=${row.value} ?disabled=${this.disabled} aria-label=${this.valueLabel}
                   @zn-change=${(e: Event) => this._edit(index, 'value', e)}>
          ${Object.entries(this.valueOptions).map(([value, label]) => html`
            <zn-option value=${value}>${label}</zn-option>`)}
        </zn-select>`;
    }
    return html`
      <zn-input class="key-value__value" placeholder=${this.valueLabel} .value=${row.value}
                slash-items=${this.slashItems} ?disabled=${this.disabled}
                @zn-input=${(e: Event) => this._edit(index, 'value', e)}></zn-input>`;
  }

  render() {
    const hasLabel = this.label || this.hasSlotController.test('label');
    const hasHelpText = this.helpText || this.hasSlotController.test('help-text');
    // A lone empty row has nothing to remove; hidden rather than dropped so its inputs don't change width
    const lonelyEmpty = this._rows.length === 1 && !this._rows[0].key.trim();

    return html`
      <div part="base" class=${classMap({
        'form-control': true,
        'form-control--medium': true,
        'form-control--has-label': !!hasLabel,
        'form-control--has-help-text': !!hasHelpText,
      })}>
        <label class="form-control__label" aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>
        </label>

        <div class=${classMap({
          'key-value__rows': true,
          'key-value__rows--list': this.list,
          'key-value__rows--options': !!this.valueOptions && !this.list,
        })}>
          ${this._rows.map((row, index) => html`
            <div part="row" class="key-value__row">
              <zn-input class="key-value__key" placeholder=${this.keyLabel} .value=${row.key}
                        aria-label=${this.keyLabel} ?disabled=${this.disabled}
                        @zn-input=${(e: Event) => this._edit(index, 'key', e)}></zn-input>
              ${this._renderValue(row, index)}
              <zn-button class=${classMap({'key-value__remove': true, 'key-value__remove--hidden': lonelyEmpty})}
                         icon="x@lu" color="transparent" size="small" title="Remove" icon-button="small" plain
                         ?disabled=${this.disabled}
                         @click=${(e: Event) => this._remove(row, (e.currentTarget as HTMLElement).closest('.key-value__row')!)}></zn-button>
            </div>`)}
          <zn-button class="key-value__add" icon="plus@lu" color="secondary" size="small" ?disabled=${this.disabled}
                     @click=${() => this._add()}>${this.addText}</zn-button>
        </div>

        <div class="form-control__help-text" aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>`;
  }
}
