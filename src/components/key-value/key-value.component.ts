import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from '../../internal/form';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';

import formControlStyles from '../../form-control.scss';
import styles from './key-value.scss';

interface KeyValueRow {
  key: string;
  value: string;
}

/**
 * @summary Edits a list of name and value pairs, submitted as a JSON object.
 * @documentation https://zinc.style/components/key-value
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-input
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

  /** The pairs as a JSON object, such as `{"1": "{{recipient.firstName}}"}`. */
  @property() value = '{}';

  @property() label = '';

  @property({attribute: 'help-text'}) helpText = '';

  @property({attribute: 'key-label'}) keyLabel = 'Name';

  @property({attribute: 'value-label'}) valueLabel = 'Value';

  @property({attribute: 'add-text'}) addText = 'Add';

  /** Passed to each value input, so its slash menu can insert merge fields. */
  @property({attribute: 'slash-items'}) slashItems = '';

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
    if (changed.has('value') && this.value !== this._serialise()) {
      this._rows = this._parse(this.value);
    }
  }

  private _parse(value: string): KeyValueRow[] {
    try {
      const parsed: unknown = JSON.parse(value || '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.entries(parsed as Record<string, unknown>).map(([key, v]) => ({key, value: String(v ?? '')}));
      }
    } catch {
      // An unreadable value starts empty rather than breaking the form
    }
    return [];
  }

  private _serialise(): string {
    const pairs: Record<string, string> = {};
    this._rows.filter(row => row.key.trim()).forEach(row => pairs[row.key.trim()] = row.value);
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

  render() {
    const hasLabel = this.label || this.hasSlotController.test('label');
    const hasHelpText = this.helpText || this.hasSlotController.test('help-text');

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

        <div class="key-value__rows">
          ${this._rows.map((row, index) => html`
            <div part="row" class="key-value__row">
              <zn-input class="key-value__key" placeholder=${this.keyLabel} .value=${row.key}
                        ?disabled=${this.disabled} @zn-input=${(e: Event) => this._edit(index, 'key', e)}></zn-input>
              <zn-input class="key-value__value" placeholder=${this.valueLabel} .value=${row.value}
                        slash-items=${this.slashItems} ?disabled=${this.disabled}
                        @zn-input=${(e: Event) => this._edit(index, 'value', e)}></zn-input>
              <zn-button icon="x@lu" color="transparent" size="small" title="Remove" icon-button="small" plain ?disabled=${this.disabled}
                         @click=${() => this._update(this._rows.filter((_, i) => i !== index))}></zn-button>
            </div>`)}
          <zn-button class="key-value__add" icon="plus@lu" color="secondary" size="small" ?disabled=${this.disabled}
                     @click=${() => this._update([...this._rows, {key: '', value: ''}])}>${this.addText}</zn-button>
        </div>

        <div class="form-control__help-text" aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>`;
  }
}
