import {type CSSResultGroup, html, nothing, type PropertyValues, type TemplateResult, unsafeCSS} from "lit";
import {property, queryAll, state} from "lit/decorators.js";
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {toolTitle} from "./tools";
import ZincElement from "../../../../internal/zinc-element";
import ZnButton from "../../../button";
import ZnDropdown from "../../../dropdown";
import ZnEditorTool from "./tool";
import ZnMenu from "../../../menu";
import ZnMenuItem from "../../../menu-item";
import type {Formats} from "../../../../internal/rich-text/rich-editor";
import type {ToolDef, ToolGroup} from "./tools";

import styles from './toolbar.scss';

export type ToolbarVariant = 'segmented' | 'bubble' | 'bar' | 'format';

// Room the "more" button needs when trailing groups move into it
const OVERFLOW_WIDTH = 44;

const BUBBLE_TOOLS = new Set(['block', 'bold', 'italic', 'underline', 'strike', 'code', 'link', 'color', 'refine']);

// zn-button's host doesn't take focus, so focus the button inside it
function focusControl(control: HTMLElement) {
  (control.shadowRoot?.querySelector<HTMLElement>('[part~="base"]') ?? control).focus();
}

/**
 * Renders the editor's tools, which it receives as data with the current formats. Each control carries the
 * `data-format` and `data-format-type` its tool applies; the editor's toolbar module handles the clicks.
 */
export default class ToolbarComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-dropdown': ZnDropdown,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
    'zn-editor-tool': ZnEditorTool,
  };

  @property({attribute: false}) tools: ToolDef[] = [];
  @property({attribute: false}) formats: Formats = {};
  @property({reflect: true}) variant: ToolbarVariant = 'segmented';
  @property({type: Boolean, reflect: true}) compact = false;

  // Groups shown before the rest move into the "more" menu
  @state() private _visibleGroups = Infinity;
  @queryAll('.toolbar__group') private _groupEls!: HTMLElement[];
  private _widths: number[] | null = null;

  // Watches this toolbar for as long as it exists
  protected readonly resizeController = new ResizeController(this, {
    callback: entries => this._fit(entries[0]?.contentRect.width),
  });

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has('tools') || changed.has('variant') || changed.has('compact')) {
      this._widths = null;
      this._visibleGroups = Infinity;
    }
  }

  protected async updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this._widths !== null || !this._overflows()) return;
    // Measured with every group showing, once the controls inside have rendered, then split to the width there is
    const controls = this.renderRoot.querySelectorAll<ZincElement>('zn-button, zn-dropdown');
    await Promise.all(Array.from(controls).map(control => control.updateComplete));
    requestAnimationFrame(() => {
      if (this._widths !== null || this._visibleGroups !== Infinity) return;
      this._widths = Array.from(this._groupEls).map(group => group.offsetWidth);
      this._fit(this.getBoundingClientRect().width);
    });
  }

  private _overflows() {
    return this.variant === 'segmented' && !this.compact;
  }

  private _fit(width: number | undefined) {
    if (!this._overflows() || !this._widths || !width) return;
    const total = this._widths.reduce((sum, w) => sum + w, 0);
    if (total <= width) {
      this._visibleGroups = Infinity;
      return;
    }
    let used = 0;
    let count = 0;
    for (const w of this._widths) {
      if (used + w + OVERFLOW_WIDTH > width) break;
      used += w;
      count++;
    }
    this._visibleGroups = count;
  }

  private _shownTools(): ToolDef[] {
    // Formatting only, for a row that sits beside a bar that already has the inserts
    if (this.variant === 'format') return this.tools.filter(tool => tool.compact && tool.kind !== 'picker');
    if (this.compact) return this.tools.filter(tool => tool.compact);
    const tools = this.tools.filter(tool => !tool.compactOnly);
    if (this.variant === 'bubble') return tools.filter(tool => BUBBLE_TOOLS.has(tool.id));
    // Refine works on a selection, so only the bar that appears over one offers it
    if (this.variant === 'segmented') return tools.filter(tool => tool.group !== 'ai');
    if (this.variant === 'bar') return tools.filter(tool => tool.group === 'insert' || tool.group === 'custom');
    return tools;
  }

  private _groups(tools: ToolDef[]): ToolDef[][] {
    const groups = new Map<ToolGroup, ToolDef[]>();
    tools.forEach(tool => groups.set(tool.group, [...groups.get(tool.group) ?? [], tool]));
    return [...groups.values()];
  }

  private _active(tool: ToolDef) {
    return tool.isActive?.(this.formats) ?? false;
  }

  private _icon(tool: ToolDef, slot = 'prefix') {
    if (tool.icon.startsWith('color:')) {
      return html`<span slot=${slot} class="color-icon" style="background-color: ${tool.value}"></span>`;
    }
    return html`<zn-icon slot=${slot} src=${tool.icon} size="16"></zn-icon>`;
  }

  private _button(tool: ToolDef) {
    const active = this._active(tool);
    return html`
      <zn-button class="toolbar__button"
                 color="transparent"
                 icon=${tool.icon}
                 icon-size="16"
                 tooltip=${toolTitle(tool)}
                 aria-label=${tool.label}
                 aria-pressed=${tool.isActive ? String(active) : nothing}
                 data-format=${tool.format ?? nothing}
                 data-format-type=${tool.value ?? nothing}
                 ?data-active=${active}></zn-button>`;
  }

  private _menuItems(options: ToolDef[]) {
    return options.map(option => html`
      <zn-menu-item type="checkbox"
                    checked-position="right"
                    data-format=${option.format ?? nothing}
                    data-format-type=${option.value ?? nothing}
                    ?checked=${this._active(option)}>
        ${this._icon(option)}
        ${option.label}
      </zn-menu-item>`);
  }

  private _menu(tool: ToolDef) {
    const options = tool.options ?? [];
    const current = options.find(option => this._active(option));
    // The text style menu reads as the current style; the others keep their icon
    const label = tool.id === 'block' && this.variant !== 'bar' ? (current ?? options[0])?.label : '';
    return html`
      <zn-dropdown class="toolbar__menu toolbar__menu--${tool.id}" placement="bottom-start">
        <zn-button slot="trigger"
                   class="toolbar__trigger"
                   color="transparent"
                   icon=${label ? 'chevron-down@lu' : tool.icon}
                   icon-size="16"
                   icon-position=${label ? 'right' : nothing}
                   tooltip=${label ? nothing : tool.label}
                   aria-label=${tool.label}>${label ? this._sizedLabel(options, label) : ''}</zn-button>
        <zn-menu>${this._menuItems(options)}</zn-menu>
      </zn-dropdown>`;
  }

  // Every option's label stacked in one cell, only the current one shown, so the trigger is as wide as the longest
  // and the tools after it stay put as the style changes
  private _sizedLabel(options: ToolDef[], label: string) {
    return html`
      <span class="sized-label">
        ${options.map(option => html`
          <span ?data-current=${option.label === label} aria-hidden=${option.label === label ? nothing : 'true'}>${option.label}</span>`)}
      </span>`;
  }

  // Text colour opens a grid of swatches, and its trigger's bar shows the colour at the caret
  private _colorMenu(tool: ToolDef) {
    const options = tool.options ?? [];
    const current = options.find(option => this._active(option))?.value;
    return html`
      <zn-dropdown class="toolbar__menu toolbar__menu--color" placement="bottom-start">
        <zn-button slot="trigger"
                   class="toolbar__trigger"
                   color="transparent"
                   tooltip=${tool.label}
                   aria-label=${tool.label}>
          <span class="color-trigger">
            A<i class="color-trigger__bar" style=${current ? `background-color: ${current}` : nothing}></i>
          </span>
        </zn-button>
        <div class="color-grid"
             role="group"
             aria-label=${tool.label}
             @click=${(e: Event) => (e.currentTarget as Element).closest('zn-dropdown')?.hide()}>
          ${options.map(option => html`
            <button type="button"
                    class="color-swatch ${option.value ? '' : 'color-swatch--default'}"
                    style=${option.value ? `background-color: ${option.value}` : nothing}
                    title=${option.label}
                    aria-label=${option.label}
                    aria-pressed=${String(this._active(option))}
                    data-format=${option.format ?? nothing}
                    data-format-type=${option.value ?? nothing}></button>`)}
        </div>
      </zn-dropdown>`;
  }

  private _tool(tool: ToolDef) {
    if (tool.id === 'color') return this._colorMenu(tool);
    return tool.kind === 'menu' ? this._menu(tool) : this._button(tool);
  }

  // The bar keeps inserts behind one "+" menu, beside the pickers and custom tools
  private _bar(tools: ToolDef[]) {
    const inserts = tools.filter(tool => tool.group === 'insert' && tool.kind === 'button');
    const rest = tools.filter(tool => !inserts.includes(tool));
    const plus: ToolDef = {id: 'insert', label: 'Insert', icon: 'plus@lu', group: 'insert', kind: 'menu', options: inserts};
    return html`
      <div class="toolbar__group">
        ${inserts.length ? this._menu(plus) : nothing}
        ${rest.map(tool => this._tool(tool))}
      </div>`;
  }

  private _overflowItem(tool: ToolDef): TemplateResult {
    if (tool.kind === 'menu') {
      return html`
        <zn-menu-item>
          ${this._icon(tool)}
          ${tool.label}
          <zn-menu slot="submenu">${this._menuItems(tool.options ?? [])}</zn-menu>
        </zn-menu-item>`;
    }
    return html`
      <zn-menu-item data-format=${tool.format ?? nothing} data-format-type=${tool.value ?? nothing}>
        ${this._icon(tool)}
        ${tool.label}
      </zn-menu-item>`;
  }

  // Arrow keys step between the toolbar's own controls, as a role="toolbar" promises
  private _handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const controls = Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.toolbar > * > zn-button, .toolbar > * > zn-dropdown > zn-button, .toolbar__overflow > zn-button'));
    const current = controls.findIndex(control => control.matches(':focus-within'));
    if (current === -1) return;
    e.preventDefault();
    const next = (current + (e.key === 'ArrowRight' ? 1 : -1) + controls.length) % controls.length;
    focusControl(controls[next]);
  }

  // Pressing a control leaves focus, and so the caret, in the text. Safari would otherwise blur the text without
  // focusing the button, and the tool would act on a stale caret.
  private _keepFocus(e: MouseEvent) {
    e.preventDefault();
  }

  /** Focuses the first control, for a shortcut that moves the keyboard into the toolbar. */
  focusFirst() {
    const first = this.renderRoot.querySelector<HTMLElement>('zn-button');
    if (first) focusControl(first);
  }

  render() {
    const tools = this._shownTools();
    if (this.variant === 'bar') {
      return html`
        <div class="toolbar"
             role="toolbar"
             aria-label="Insert"
             @keydown=${this._handleKeydown}
             @mousedown=${this._keepFocus}>${this._bar(tools)}</div>`;
    }
    const groups = this._groups(tools);
    const shown = groups.slice(0, this._visibleGroups);
    const hidden = groups.slice(this._visibleGroups).flat();
    return html`
      <div class="toolbar" role="toolbar" aria-label="Formatting" @keydown=${this._handleKeydown} @mousedown=${this._keepFocus}>
        ${shown.map(group => html`
          <div class="toolbar__group toolbar__group--${group[0].group}">${group.map(tool => this._tool(tool))}</div>`)}
        ${hidden.length ? html`
          <zn-dropdown class="toolbar__overflow" placement="bottom-end">
            <zn-button slot="trigger"
                       class="toolbar__trigger"
                       color="transparent"
                       icon="ellipsis@lu"
                       icon-size="16"
                       aria-label="More tools"></zn-button>
            <zn-menu>${hidden.map(tool => this._overflowItem(tool))}</zn-menu>
          </zn-dropdown>` : nothing}
      </div>`;
  }
}

ToolbarComponent.define('zn-toolbar');
