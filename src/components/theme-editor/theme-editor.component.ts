import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {ifDefined} from 'lit/directives/if-defined.js';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, query, queryAll, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnCollapsible from '../collapsible';
import ZnIcon from '../icon';
import ZnPreviewFrame from '../preview-frame';
import type {ZnErrorEvent} from '../../events/zn-error';

import styles from './theme-editor.scss';

export type ThemeEditorMode = 'light' | 'dark';
export type ThemeEditorDevice = 'desktop' | 'tablet' | 'mobile';

export interface ThemeEditorSection {
  /** The slot name controls are assigned to with `slot="<name>"`. */
  name: string;
  caption: string;
  description?: string;
  /** Renders the section expanded initially. */
  open?: boolean;
}

// Controls whose state lives on `checked` rather than `value`.
const BOOLEAN_CONTROLS = new Set(['zn-checkbox', 'zn-toggle']);

// Matches theme-editor.scss's stacked breakpoint - keep both in sync.
const STACKED_QUERY = '(max-width: 768px)';

const DEVICES: {id: ThemeEditorDevice; icon: string; label: string}[] = [
  {id: 'desktop', icon: 'monitor', label: 'Desktop'},
  {id: 'tablet', icon: 'tablet', label: 'Tablet'},
  {id: 'mobile', icon: 'smartphone', label: 'Mobile'},
];

interface HarvestableControl extends HTMLElement {
  name?: string;
  value?: unknown;
  checked?: boolean;
  disabled?: boolean;
  type?: string;
}

/**
 * @summary A theme editor: slotted form controls drive a live preview frame,
 * with a toolbar for the preview's light/dark mode and device width.
 * @documentation https://zinc.style/components/theme-editor
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-collapsible
 * @dependency zn-preview-frame
 * @dependency zn-icon
 * @dependency zn-button
 *
 * @event zn-theme-change - Emitted when the values, mode or device change.
 * @event zn-theme-submit - Emitted on submit (button click), carrying the
 * current values. With `action` set, only fires after a successful save.
 * @event zn-error - Emitted when a save fails. Also seen for preview render
 * failures: the frame's zn-error is composed and not stopped, so it bubbles
 * out through the editor too.
 *
 * @slot - Ungrouped theme controls, rendered above any sections. Controls
 * assigned `slot="<name>"` matching a `sections` entry render inside that
 * section instead. Harvesting and change detection walk every slot's full
 * assigned subtree, not just direct children.
 * @slot toolbar - Actions in the toolbar, right-aligned beside the device and
 * mode controls. Where a save button belongs.
 * @slot footer - Actions pinned beneath the controls. The built-in submit button
 * lives in the toolbar, not here.
 *
 * @csspart base - The component's base wrapper.
 * @csspart toolbar - The device and mode switcher, spanning the full width.
 * @csspart controls - The left-hand controls column.
 * @csspart section - A rendered section's collapsible (`section-layout="collapsible"`).
 * @csspart tablist-wrap - Non-scrolling wrapper around the tablist; carries the border and right-edge overflow fade.
 * @csspart tablist - The section tab strip (`section-layout="tabs"`), a single-row horizontal scroller.
 * @csspart tab - A section's tab button.
 * @csspart tabpanel - A section's tab panel.
 * @csspart footer - The footer wrapper beneath the controls.
 * @csspart preview - The preview column.
 * @csspart error - The inline error strip.
 * @csspart preview__base - The frame's base wrapper (forwarded from zn-preview-frame).
 * @csspart preview__stage - The frame's device-width wrapper (forwarded from zn-preview-frame).
 * @csspart preview__iframe - The frame's iframe (forwarded from zn-preview-frame).
 * @csspart preview__error - The frame's own error overlay (forwarded from zn-preview-frame).
 *
 * @cssproperty --zn-theme-editor-controls-width - Width of the controls column.
 */
export default class ZnThemeEditor extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-collapsible': ZnCollapsible,
    'zn-preview-frame': ZnPreviewFrame,
    'zn-icon': ZnIcon,
    'zn-button': ZnButton,
  };

  /** URL of the preview shell page; forwarded to the frame. */
  @property() src = '';

  /** Expected origin of the iframe; forwarded to the frame. */
  @property({attribute: 'frame-origin'}) frameOrigin = '';

  /** Optional endpoint returning the base hp-preview:config payload. */
  @property({attribute: 'data-uri'}) dataUri = '';

  /** Which mode the preview renders in. Travels in the theme payload. */
  @property({reflect: true}) mode: ThemeEditorMode = 'light';

  /** Preview viewport width. Resizes the frame only; not part of the payload. */
  @property({reflect: true}) device: ThemeEditorDevice = 'desktop';

  /** Minimum height of the preview row, in pixels; forwarded to the frame as its own floor. */
  @property({type: Number, attribute: 'min-height'}) minHeight = 480;

  /** Debounce in ms between a control change and the push to the preview. */
  @property({type: Number}) debounce = 150;

  /** Optional endpoint the values are POSTed to. Empty = no persistence. */
  @property() action = '';

  /** Debounce in ms between a control change and the save POST. */
  @property({type: Number, attribute: 'save-debounce'}) saveDebounce = 1000;

  /** Groups controls into named, collapsible sections. Empty/unset renders one ungrouped column. */
  @property({type: Array}) sections: ThemeEditorSection[] = [];

  /**
   * Presentation for `sections`: stacked `zn-collapsible`s (default) or a tab
   * strip. Reuses `sections` and its named slots verbatim; `description` and
   * `open` are ignored in `tabs`.
   */
  @property({attribute: 'section-layout'}) sectionLayout: 'collapsible' | 'tabs' = 'collapsible';

  /** Collapses the controls column. */
  @property({type: Boolean, reflect: true, attribute: 'controls-collapsed'}) controlsCollapsed = false;

  /** Presents the editor as its own bordered, rounded panel with a plain preview backdrop, rather than embedded in a dotted canvas. */
  @property({type: Boolean, reflect: true}) standalone = false;

  /** Label for the built-in submit button. Empty (default) renders no button. */
  @property({attribute: 'submit-label'}) submitLabel = '';

  /** Disables the debounced auto-save; saving then happens only via submit. Preview pushes are unaffected. */
  @property({type: Boolean}) manual = false;

  @query('zn-preview-frame') frame: ZnPreviewFrame;

  @query('slot:not([name])') private controlsSlot: HTMLSlotElement;

  @queryAll('.editor__section-slot') private sectionSlots: NodeListOf<HTMLSlotElement>;

  @state() protected error = '';

  @state() private _submitting = false;

  // Which section's tab is active in section-layout="tabs". Purely a view
  // toggle - never read by harvesting, seeding or the push/save pipeline.
  @state() private _activeTab = '';

  private readonly hasSlotController = new HasSlotController(this, 'footer', '[default]');

  private _pushTimer?: number;
  private _saveTimer?: number;
  private _saving = false;
  private _saveQueued = false;
  private _saveWaiters: ((ok: boolean) => void)[] = [];

  // Mirrors page-builder's one-shot auto-collapse on crossing into narrow.
  private readonly _narrowQuery = window.matchMedia(STACKED_QUERY);
  private _wasNarrow = false;

  // firstUpdated(), slotchange and the mutation observer below all race to
  // report the same initial state. Track the deep set of named controls (not
  // their values) so any redundant echo is a no-op while a genuine change -
  // including one nested inside an already-assigned section - still pushes.
  // Never gates _push() itself: any real control value change always pushes.
  private _mounted = false;
  private _lastControls: HarvestableControl[] = [];

  // childList+subtree only, NEVER attributes - zn-checkbox reflects `checked`
  // to an attribute, and write-back assigns .checked on mode toggle, which
  // would otherwise feed straight back into this guard. Exposed as a field
  // (rather than inlined) so a test can pin the config directly.
  private readonly _controlsObserverConfig: MutationObserverInit = {childList: true, subtree: true};

  private readonly _controlsObserver = new MutationController(this, {
    target: null,
    config: this._controlsObserverConfig,
    callback: () => this._pushIfControlsChanged(),
  });

  // Per-mode value sets. Seeded once per control name (never re-seeded, so a
  // user's edits survive later controls being added) and otherwise updated by
  // harvesting the DOM into the active mode only.
  private _modeValues: Record<ThemeEditorMode, Record<string, unknown>> = {light: {}, dark: {}};

  // Suppresses _onControlChange while write-back assigns .value/.checked
  // programmatically. This IS load-bearing: zn-input's color-format watcher
  // can emit zn-change from inside a later Lit update() - after the
  // microtasks of this call stack, not during it - e.g. when a dark-value is
  // authored in a different colour-string representation than value. A depth
  // counter (not a boolean) so overlapping write-backs (e.g. a slot change
  // and a mode toggle landing close together) don't let one's cleanup clear
  // the other's guard early.
  private _suppressDepth = 0;

  /** The current per-mode value sets. Returns copies. */
  get values(): {light: Record<string, unknown>; dark: Record<string, unknown>} {
    return {light: {...this._modeValues.light}, dark: {...this._modeValues.dark}};
  }

  /** The active mode's values - what gets pushed to the preview frame. */
  get activeValues(): Record<string, unknown> {
    return {...this._modeValues[this.mode]};
  }

  /** The default slot plus every rendered section slot. */
  private _controlSlots(): HTMLSlotElement[] {
    return [this.controlsSlot, ...Array.from(this.sectionSlots ?? [])]
      .filter((slot): slot is HTMLSlotElement => !!slot);
  }

  /** Walks every control slot (default and sections) for every enabled, named control. */
  private _harvestNamed(): {name: string; control: HarvestableControl}[] {
    const found: {name: string; control: HarvestableControl}[] = [];

    for (const slot of this._controlSlots()) {
      const roots = slot.assignedElements({flatten: true});
      for (const root of roots) {
        const candidates = [root, ...Array.from(root.querySelectorAll('[name]'))];
        for (const candidate of candidates) {
          const control = candidate as HarvestableControl;
          if (!control.getAttribute?.('name') || control.disabled) continue;
          found.push({name: control.getAttribute('name')!, control});
        }
      }
    }

    return found;
  }

  /** Whether a direct child is assigned to the named slot — an empty section renders no chrome. */
  private _hasAssignedControls(slotName: string): boolean {
    return Array.from(this.children).some(el => el.getAttribute('slot') === slotName);
  }

  private _isBooleanControl(control: HarvestableControl): boolean {
    return BOOLEAN_CONTROLS.has(control.tagName.toLowerCase()) || control.type === 'checkbox';
  }

  private _readControlValue(control: HarvestableControl): unknown {
    return this._isBooleanControl(control) ? !!control.checked : control.value;
  }

  /** Seeds light/dark entries for any control name not already present. */
  private _seed() {
    for (const {name, control} of this._harvestNamed()) {
      if (name in this._modeValues.light) continue;

      const light = this._readControlValue(control);
      this._modeValues.light[name] = light;

      const darkAttr = control.getAttribute('dark-value');
      this._modeValues.dark[name] = darkAttr === null
        ? light
        : this._isBooleanControl(control)
          ? (darkAttr === '1' || darkAttr === 'true')
          : darkAttr;
    }
  }

  /** Writes a mode's value set back into the controls so they display it. */
  private _writeBack(mode: ThemeEditorMode = this.mode) {
    // Only assign - and only suppress - controls whose displayed value is
    // actually about to change. Most write-backs (e.g. mount seeding a
    // control from its own current value) are true no-ops; skipping the
    // assignment entirely means no Lit update is triggered for them, so
    // there is nothing to suppress and no window during which an unrelated,
    // genuinely new edit to that same control could be wrongly swallowed.
    let wrote = false;
    for (const {name, control} of this._harvestNamed()) {
      if (!(name in this._modeValues[mode])) continue;
      const value = this._modeValues[mode][name];
      const isBoolean = this._isBooleanControl(control);
      const current = isBoolean ? !!control.checked : control.value;
      if (isBoolean ? current === value : String(current) === String(value)) continue;

      wrote = true;
      if (isBoolean) {
        control.checked = !!value;
      } else {
        control.value = value;
      }
    }

    if (!wrote) return;

    // Lit's update cycle is never synchronous with the assignments above, and
    // a watched-property handler can emit after several microtask hops of
    // its own (e.g. an internal `await this.updateComplete`). A macrotask
    // boundary is cruder than awaiting updateComplete directly, but it
    // reliably outlasts however many microtask hops that chain takes,
    // without this method needing to know the shape of that chain.
    this._suppressDepth++;
    window.setTimeout(() => {
      this._suppressDepth--;
    }, 0);
  }

  /** Harvests the controls' current displayed values into a mode's set. */
  private _harvestInto(mode: ThemeEditorMode) {
    for (const {name, control} of this._harvestNamed()) {
      this._modeValues[mode][name] = this._readControlValue(control);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._controlsObserver.observe(this);
    this._narrowQuery.addEventListener('change', this._onNarrowChange);
    this._onNarrowChange(this._narrowQuery);
  }

  disconnectedCallback() {
    if (this._pushTimer) window.clearTimeout(this._pushTimer);
    if (this._saveTimer) window.clearTimeout(this._saveTimer);
    this._narrowQuery.removeEventListener('change', this._onNarrowChange);
    super.disconnectedCallback();
  }

  private readonly _onNarrowChange = (e: MediaQueryList | MediaQueryListEvent) => {
    if (e.matches && !this._wasNarrow) this.controlsCollapsed = true;
    this._wasNarrow = e.matches;
  };

  protected firstUpdated() {
    // Push the authored defaults immediately so the preview never renders
    // un-themed and then snaps to the real values. The frame retains the
    // payload and replays it after its ready handshake. Routed through the
    // same assignment-change gate as _onSlotChange so that whichever of the
    // two fires first performs the mount push and the other — seeing an
    // unchanged control set — is a no-op, regardless of firing order.
    this._pushIfControlsChanged();
  }

  /** Pushes the active mode's values into the preview and announces it. */
  private _push() {
    // Optimistically clear a frame-sourced error: the frame clears its own
    // overlay on hp-preview:rendered, and a failing save re-sets this on its
    // own (longer) debounce.
    this.error = '';
    this.frame?.setTheme({mode: this.mode, values: this.activeValues});
    this._announce();
  }

  private _queueSave() {
    if (!this.action || this.manual) return;
    if (this._saveTimer) window.clearTimeout(this._saveTimer);
    this._saveTimer = window.setTimeout(() => {
      this._saveTimer = undefined;
      void this._save();
    }, this.saveDebounce);
  }

  // Saves serialize through a single slot: changes arriving mid-flight collapse
  // into exactly one follow-up save, so overlapping POSTs can't land out of
  // order and persist a stale value. Waiters queued via _awaitSave() are only
  // resolved by whichever run finishes with nothing further queued behind it -
  // the run that actually carries their values, not necessarily this call.
  private async _save() {
    if (this._saving) {
      this._saveQueued = true;
      return;
    }
    this._saving = true;
    let ok = false;

    try {
      const body = new FormData();
      for (const mode of ['light', 'dark'] as ThemeEditorMode[]) {
        for (const [name, value] of Object.entries(this._modeValues[mode])) {
          body.append(`${mode}[${name}]`, typeof value === 'boolean' ? (value ? '1' : '') : String(value ?? ''));
        }
      }
      const response = await fetch(this.action, {
        method: 'POST',
        credentials: 'same-origin',
        body,
      });
      if (!response.ok) {
        throw new Error(await response.text() || response.statusText);
      }
      this.error = '';
      ok = true;
    } catch (err) {
      this._fail(err instanceof Error ? err.message : String(err));
    } finally {
      this._saving = false;
      if (this._saveQueued) {
        this._saveQueued = false;
        void this._save();
      } else {
        const waiters = this._saveWaiters;
        this._saveWaiters = [];
        waiters.forEach(resolve => resolve(ok));
      }
    }
  }

  /** Resolves once a save actually carrying the current values has settled. */
  private _awaitSave(): Promise<boolean> {
    return new Promise(resolve => {
      this._saveWaiters.push(resolve);
      void this._save();
    });
  }

  /**
   * Pushes only if the deep set of named controls (the same set harvesting
   * walks, so it includes controls nested inside sections) has changed since
   * the last push. Comparison is by element identity only, never by value.
   */
  private _pushIfControlsChanged() {
    // A section's rendered chrome depends on live slot assignment - recompute every time.
    this.requestUpdate();

    const current = this._harvestNamed().map(({control}) => control);
    const changed = !this._mounted
      || current.length !== this._lastControls.length
      || current.some((el, i) => el !== this._lastControls[i]);

    if (!changed) return;

    this._flushPendingEdit();
    this._mounted = true;
    this._lastControls = current;
    this._seed();
    // Write back so an editor authored with mode="dark" displays its dark
    // values on first render rather than the light defaults just seeded.
    this._writeBack();
    this._push();
  }

  /** Harvests and queues a save for a pending debounced edit, then cancels its timer. */
  private _flushPendingEdit() {
    if (!this._pushTimer) return;
    window.clearTimeout(this._pushTimer);
    this._pushTimer = undefined;
    this._harvestInto(this.mode);
    this._queueSave();
  }

  // Reuses _save()'s single-slot queue rather than POSTing directly, so a
  // submit mid-flight can't land as a second concurrent request.
  private readonly _onSubmit = () => {
    if (this._submitting) return;

    this._flushPendingEdit();
    if (this._saveTimer) {
      window.clearTimeout(this._saveTimer);
      this._saveTimer = undefined;
    }

    if (!this.action) {
      this.emit('zn-theme-submit', {detail: {values: this.values}});
      return;
    }

    this._submitting = true;
    void this._awaitSave()
      .then(ok => {
        if (ok) this.emit('zn-theme-submit', {detail: {values: this.values}});
      })
      .finally(() => {
        this._submitting = false;
      });
  };

  private _announce() {
    this.emit('zn-theme-change', {detail: {values: this.values, mode: this.mode, device: this.device}});
  }

  private _fail(message: string) {
    this.error = message;
    this.emit('zn-error', {detail: {message}});
  }

  private readonly _onControlChange = () => {
    if (this._suppressDepth > 0) return;
    if (this._pushTimer) window.clearTimeout(this._pushTimer);
    this._pushTimer = window.setTimeout(() => {
      this._pushTimer = undefined;
      this._harvestInto(this.mode);
      this._push();
      this._queueSave();
    }, this.debounce);
  };

  private readonly _onSlotChange = () => {
    this._pushIfControlsChanged();
  };

  private readonly _setDevice = (device: ThemeEditorDevice) => {
    if (this.device === device) return;
    this.device = device;
    // device only resizes the frame — the embed reads its width from the
    // iframe box, so there's nothing new to push
    this._announce();
  };

  private readonly _toggleMode = () => {
    // A pending debounced edit reads this.mode at fire time, not schedule
    // time - if it fired after the flip below, it would harvest the value
    // write-back is about to overwrite, into the wrong mode's bucket, and
    // the edit would land nowhere. Flush it into the mode it was actually
    // made in before switching.
    this._flushPendingEdit();

    this.mode = this.mode === 'dark' ? 'light' : 'dark';
    this._writeBack();
    this._push();
  };

  private readonly _onFrameError = (e: ZnErrorEvent) => {
    // zn-error already bubbles and composes out to the host; just display it.
    this.error = e.detail.message ?? 'Preview failed to render';
  };

  /** Configured sections that have an assigned control - shared by both section-layout presentations. */
  private _visibleSections(): ThemeEditorSection[] {
    // Lit's default converter falls back to null on bad JSON, and does nothing
    // to coerce valid-but-non-array JSON - both would otherwise crash render().
    const sections = Array.isArray(this.sections) ? this.sections : [];
    return sections.filter(section => this._hasAssignedControls(section.name));
  }

  private _renderSections() {
    return this._visibleSections().map(section => html`
      <zn-collapsible
        class="editor__section"
        part="section"
        caption="${section.caption}"
        description="${ifDefined(section.description)}"
        default="${section.open ? 'open' : 'closed'}"
        flush>
        <div class="editor__section-fields">
          <slot name="${section.name}" class="editor__section-slot" @slotchange="${this._onSlotChange}"></slot>
        </div>
      </zn-collapsible>`);
  }

  /** The active tab, falling back to the first visible section if the tracked name no longer matches one. */
  private _activeTabName(sections: ThemeEditorSection[]): string {
    return sections.some(section => section.name === this._activeTab) ? this._activeTab : (sections[0]?.name ?? '');
  }

  private readonly _setActiveTab = (name: string) => {
    this._activeTab = name;
    void this.updateComplete.then(() => this._scrollTabIntoView(name));
  };

  /** Keeps a tab reachable in the single-row scroller when it becomes active. */
  private _scrollTabIntoView(name: string) {
    this.shadowRoot?.getElementById(`tab-${name}`)?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  }

  private readonly _onTabKeydown = (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;

    const sections = this._visibleSections();
    if (sections.length === 0) return;
    const index = sections.findIndex(section => section.name === this._activeTabName(sections));

    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % sections.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + sections.length) % sections.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = sections.length - 1;

    e.preventDefault();
    this._setActiveTab(sections[next].name);
    void this.updateComplete.then(() => {
      this.shadowRoot?.getElementById(`tab-${sections[next].name}`)?.focus();
    });
  };

  // Every pane renders regardless of which tab is active - only visibility is
  // toggled (via the `hidden` attribute, not removal) - so a section's slot
  // always exists for _harvestNamed() to walk, and switching tabs can never
  // drop a control's value from the theme.
  private _renderTabs() {
    const sections = this._visibleSections();
    if (sections.length === 0) return nothing;
    const active = this._activeTabName(sections);

    return html`
      <div class="editor__tabs">
        <div class="editor__tablist-wrap" part="tablist-wrap">
          <div class="editor__tablist" part="tablist" role="tablist" aria-label="Sections" @keydown="${this._onTabKeydown}">
            ${sections.map(section => html`
              <button type="button" role="tab"
                      id="tab-${section.name}"
                      part="tab"
                      class="editor__tab ${section.name === active ? 'editor__tab--active' : ''}"
                      aria-selected="${section.name === active ? 'true' : 'false'}"
                      aria-controls="tabpanel-${section.name}"
                      tabindex="${section.name === active ? '0' : '-1'}"
                      @click="${() => this._setActiveTab(section.name)}">
                ${section.caption}
              </button>`)}
          </div>
        </div>
        ${sections.map(section => html`
          <div id="tabpanel-${section.name}"
               part="tabpanel"
               class="editor__tabpanel"
               role="tabpanel"
               aria-labelledby="tab-${section.name}"
               ?hidden="${section.name !== active}">
            <slot name="${section.name}" class="editor__section-slot" @slotchange="${this._onSlotChange}"></slot>
          </div>`)}
      </div>`;
  }

  render() {
    return html`
      <div part="base" class="editor ${this.controlsCollapsed ? 'editor--controls-collapsed' : ''}">
        <div part="toolbar" class="editor__toolbar">
          <div class="editor__devices" role="group" aria-label="Preview width">
            ${DEVICES.map(d => html`
              <button type="button"
                      class="editor__device"
                      data-device="${d.id}"
                      aria-label="${d.label}"
                      aria-pressed="${this.device === d.id ? 'true' : 'false'}"
                      @click="${() => this._setDevice(d.id)}">
                <zn-icon src="${d.icon}" library="lucide" size="16"></zn-icon>
              </button>`)}
          </div>
          <button type="button"
                  class="editor__mode"
                  data-mode-toggle
                  aria-label="${this.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}"
                  @click="${this._toggleMode}">
            <zn-icon src="${this.mode === 'dark' ? 'sun' : 'moon'}" library="lucide" size="16"></zn-icon>
          </button>
          <slot name="toolbar"></slot>
          ${this.submitLabel ? html`
            <zn-button class="editor__submit"
                       color="primary"
                       @click="${this._onSubmit}"
                       ?loading="${this._submitting}">${this.submitLabel}</zn-button>` : nothing}
        </div>

        <div class="editor__row" style="min-height: ${this.minHeight}px">
          <div part="controls" class="editor__controls">
            <div class="editor__fields ${this.hasSlotController.test('[default]') ? '' : 'editor__fields--sections-only'}"
                 @zn-change="${this._onControlChange}"
                 @zn-input="${this._onControlChange}"
                 @change="${this._onControlChange}"
                 @input="${this._onControlChange}">
              <slot @slotchange="${this._onSlotChange}"></slot>
              ${this.sectionLayout === 'tabs' ? this._renderTabs() : this._renderSections()}
            </div>
            ${this.hasSlotController.test('footer') ? html`
              <div part="footer" class="editor__footer">
                <slot name="footer"></slot>
              </div>` : nothing}
          </div>

          <div part="preview" class="editor__preview">
            <button type="button"
                    class="panel-toggle panel-toggle--left ${this.controlsCollapsed ? 'panel-toggle--tucked' : ''}"
                    title="${this.controlsCollapsed ? 'Show controls' : 'Hide controls'}"
                    aria-label="${this.controlsCollapsed ? 'Show controls' : 'Hide controls'}"
                    @click="${() => (this.controlsCollapsed = !this.controlsCollapsed)}">
              <zn-icon src="${this.controlsCollapsed ? 'chevron-right@lu' : 'chevron-left@lu'}" size="16"></zn-icon>
            </button>
            ${this.error ? html`
              <div part="error" class="editor__error">${this.error}</div>` : nothing}
            <zn-preview-frame
              src="${this.src}"
              frame-origin="${this.frameOrigin}"
              data-uri="${this.dataUri}"
              device="${this.device}"
              min-height="${this.minHeight}"
              fill
              backdrop="${this.standalone ? 'panel' : 'dots'}"
              exportparts="base:preview__base,stage:preview__stage,iframe:preview__iframe,error:preview__error"
              @zn-error="${this._onFrameError}"></zn-preview-frame>
          </div>
        </div>
      </div>`;
  }
}
