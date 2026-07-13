import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnButton from '../../../button';
import ZnIcon from '../../../icon';
import ZnInput from '../../../input';
import ZnOption from '../../../option';
import ZnSelect from '../../../select';

import {
  type FlowBranchCondition,
  type FlowBranchConditions,
  type FlowBranchFilter,
  type FlowFilterField,
  operatorLabel,
} from '../../flow.types';

import styles from './flow-branch-conditions.scss';

/**
 * @summary The built-in branch conditions editor: pick filters from a searchable list, then
 *   combine them into AND groups joined by OR. Rendered by `<zn-flow-builder>`'s branch editor
 *   for node types that declare `branchFilters`; edits are drafted locally and only applied
 *   on Save.
 * @documentation https://zinc.style/components/flow-branch-conditions
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 * @dependency zn-input
 * @dependency zn-option
 * @dependency zn-select
 *
 * @event flow-conditions-save - Emitted on Save with `detail.conditions` (OR groups of AND-ed conditions).
 * @event flow-conditions-cancel - Emitted on Cancel, with the draft discarded.
 *
 * @csspart base - The editor wrapper.
 * @csspart picker - The filter picker (search + list).
 * @csspart conditions - The configured condition groups.
 */
export default class ZnFlowBranchConditions extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-button': ZnButton,
    'zn-icon': ZnIcon,
    'zn-input': ZnInput,
    'zn-option': ZnOption,
    'zn-select': ZnSelect,
  };

  /** The filters available to build conditions from. */
  @property({attribute: false}) filters: FlowBranchFilter[] = [];

  /** The saved conditions being edited; changes stay in a local draft until Save. */
  @property({attribute: false}) value: FlowBranchConditions = [];

  @state() private _draft: FlowBranchConditions = [];
  /** Group index the picker adds into (`_draft.length` starts a new OR group), or null when closed. */
  @state() private _picker: number | null = null;
  @state() private _search = '';

  /** JSON of the last `value` the draft was built from, so re-renders that pass an
   *  equivalent value (fresh array refs) don't wipe in-progress edits. */
  private _valueJson = '';

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('value')) {
      const json = JSON.stringify(this.value ?? []);
      if (json !== this._valueJson) {
        this._valueJson = json;
        this._draft = JSON.parse(json) as FlowBranchConditions;
        this._picker = null;
        this._search = '';
      }
    }
  }

  private _emit(name: string, detail?: Record<string, unknown>) {
    this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true, detail}));
  }

  private _save = () => {
    this._emit('flow-conditions-save', {conditions: JSON.parse(JSON.stringify(this._draft)) as FlowBranchConditions});
  };

  private _cancel = () => {
    this._emit('flow-conditions-cancel');
  };

  // --- Draft edits ------------------------------------------------------------

  private _cloneDraft(): FlowBranchConditions {
    return this._draft.map(group => group.map(c => ({...c, values: {...c.values}})));
  }

  private _addCondition(filter: FlowBranchFilter) {
    const values: FlowBranchCondition['values'] = {};
    filter.fields.forEach(f => {
      values[f.id] = {
        ...(f.operators?.length ? {operator: f.operators[0].value} : {}),
        ...(f.value !== undefined ? {value: f.value} : {}),
        ...(f.units?.length ? {unit: f.units[0].value} : {}),
      };
    });
    const draft = this._cloneDraft();
    const group = Math.min(this._picker ?? 0, draft.length);
    if (group === draft.length) draft.push([]);
    draft[group].push({filter: filter.id, values});
    this._draft = draft;
    this._picker = null;
    this._search = '';
  }

  private _removeCondition(group: number, index: number) {
    const draft = this._cloneDraft();
    draft[group].splice(index, 1);
    this._draft = draft.filter(g => g.length);
  }

  private _setField(group: number, index: number, fieldId: string, patch: { operator?: string; value?: string | number; unit?: string }) {
    const draft = this._cloneDraft();
    const condition = draft[group][index];
    condition.values[fieldId] = {...condition.values[fieldId], ...patch};
    this._draft = draft;
  }

  // --- Rendering --------------------------------------------------------------

  private _renderPicker() {
    const term = this._search.trim().toLowerCase();
    const matches = this.filters.filter(f => !term || f.label.toLowerCase().includes(term));

    return html`
      <div part="picker" class="picker">
        <div class="picker__head">
          <span>Add Filters</span>
          ${this._draft.length ? html`
            <zn-button
              class="picker__back"
              icon="x@lu"
              icon-button="small"
              plain
              title="Back to conditions"
              @click="${() => (this._picker = null)}"
            ></zn-button>` : ''}
        </div>
        <zn-input
          class="picker__search"
          placeholder="Search filters..."
          clearable
          .value="${this._search}"
          @zn-input="${(e: Event) => (this._search = String((e.target as ZnInput).value ?? ''))}"
          @input="${(e: Event) => (this._search = String((e.target as ZnInput).value ?? ''))}"
        >
          <zn-icon slot="suffix" src="search@lu" size="16"></zn-icon>
        </zn-input>
        <div class="picker__list">
          ${matches.length === 0
            ? html`<p class="picker__empty">No matching filters.</p>`
            : matches.map(f => html`
              <button class="picker__item" @click="${() => this._addCondition(f)}">
                <span class="picker__item-text">
                  <span class="picker__item-label">${f.label}</span>
                  ${f.description ? html`<span class="picker__item-description">${f.description}</span>` : ''}
                </span>
                <zn-icon src="arrow-right@lu" size="16"></zn-icon>
              </button>`)}
        </div>
      </div>
    `;
  }

  /**
   * A select's minimum width, sized so its longest label never truncates
   * (estimated per char, plus padding and the chevron). When the row can't
   * fit it, flex-wrap gives the select its own full-width line instead.
   */
  private static _selectMinWidth(labels: string[]): number {
    const longest = Math.max(0, ...labels.map(l => l.length));
    return Math.min(260, Math.round(52 + longest * 7.2));
  }

  private _renderField(condition: FlowBranchCondition, group: number, index: number, field: FlowFilterField) {
    const entry = condition.values[field.id] ?? {};
    const type = field.type ?? (field.options?.length ? 'select' : 'text');
    const set = (patch: { operator?: string; value?: string | number; unit?: string }) =>
      this._setField(group, index, field.id, patch);

    return html`
      <div class="condition__row">
        ${field.label ? html`<span class="condition__row-label">${field.label}</span>` : ''}
        ${field.operators?.length ? html`
          <zn-select
            class="control control--operator"
            size="small"
            style="min-width:${ZnFlowBranchConditions._selectMinWidth(field.operators.map(o => operatorLabel(o)))}px"
            .value="${entry.operator ?? field.operators[0].value}"
            @zn-change="${(e: Event) => set({operator: String((e.target as ZnSelect).value)})}"
          >
            ${field.operators.map(o => html`
              <zn-option value="${o.value}">${operatorLabel(o)}</zn-option>`)}
          </zn-select>` : ''}
        ${type === 'select' ? html`
          <zn-select
            class="control control--value"
            size="small"
            style="min-width:${ZnFlowBranchConditions._selectMinWidth((field.options ?? []).map(o => o.label ?? o.value))}px"
            placeholder="${field.placeholder ?? ''}"
            .value="${String(entry.value ?? '')}"
            @zn-change="${(e: Event) => set({value: String((e.target as ZnSelect).value)})}"
          >
            ${(field.options ?? []).map(o => html`
              <zn-option value="${o.value}">${o.label ?? o.value}</zn-option>`)}
          </zn-select>` : html`
          <zn-input
            class="control ${type === 'number' ? 'control--number' : 'control--value'}"
            size="small"
            type="${type}"
            .value="${String(entry.value ?? '')}"
            placeholder="${field.placeholder ?? ''}"
            @zn-input="${(e: Event) => {
              const raw = String((e.target as ZnInput).value ?? '');
              set({value: type === 'number' ? Number(raw) : raw});
            }}"
            @input="${(e: Event) => {
              const raw = String((e.target as ZnInput).value ?? '');
              set({value: type === 'number' ? Number(raw) : raw});
            }}"
          ></zn-input>`}
        ${field.units?.length ? html`
          <zn-select
            class="control control--unit"
            size="small"
            style="min-width:${ZnFlowBranchConditions._selectMinWidth(field.units.map(u => u.label ?? u.value))}px"
            .value="${entry.unit ?? field.units[0].value}"
            @zn-change="${(e: Event) => set({unit: String((e.target as ZnSelect).value)})}"
          >
            ${field.units.map(u => html`
              <zn-option value="${u.value}">${u.label ?? u.value}</zn-option>`)}
          </zn-select>`
          : field.suffix ? html`<span class="condition__suffix">${field.suffix}</span>` : ''}
      </div>
    `;
  }

  private _renderCondition(condition: FlowBranchCondition, group: number, index: number) {
    const filter = this.filters.find(f => f.id === condition.filter);
    return html`
      <div class="condition">
        <div class="condition__head">
          <span class="condition__name">${filter?.label ?? condition.filter}</span>
          <zn-button class="condition__remove" title="Remove filter" icon="x@lu" icon-button="small" plain
                     @click="${() => this._removeCondition(group, index)}">
          </zn-button>
        </div>
        ${(filter?.fields ?? []).map(f => this._renderField(condition, group, index, f))}
      </div>
    `;
  }

  private _renderConditions() {
    return html`
      <div part="conditions" class="conditions">
        ${this._draft.map((group, gi) => html`
          ${gi > 0 ? html`
            <div class="or-label">OR</div>` : ''}
          <div class="group">
            ${group.map((condition, ci) => html`
              ${ci > 0 ? html`
                <div class="and-rule"><span>AND</span></div>` : ''}
              ${this._renderCondition(condition, gi, ci)}
            `)}
            <zn-button icon="plus@lu" @click="${() => (this._picker = gi)}" panel-bg>AND
            </zn-button>
          </div>
        `)}
        <zn-button icon="plus@lu" @click="${() => (this._picker = this._draft.length)}" panel-bg>
          OR
        </zn-button>
      </div>
    `;
  }

  render() {
    // With nothing configured yet, the picker is the first step (as designed).
    const picking = this._picker !== null || this._draft.length === 0;
    return html`
      <div part="base" class="editor">
        ${picking ? this._renderPicker() : this._renderConditions()}
        <div class="actions">
          <zn-button class="actions__save" icon="check@lu" @click="${this._save}">Save</zn-button>
          <zn-button class="actions__cancel" icon="x@lu" @click="${this._cancel}" panel-bg>Cancel</zn-button>
        </div>
      </div>
    `;
  }
}
