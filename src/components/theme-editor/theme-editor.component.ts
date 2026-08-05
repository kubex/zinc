import { type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS } from 'lit';
import { HasSlotController } from '../../internal/slot';
import { ifDefined } from 'lit/directives/if-defined.js';
import { MutationController } from '@lit-labs/observers/mutation-controller.js';
import { property, query, queryAll, state } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnCollapsible from '../collapsible';
import ZnIcon from '../icon';
import ZnNavbar from '../navbar';
import ZnOption from '../option';
import ZnPreviewFrame from '../preview-frame';
import ZnSelect from '../select';
import ZnTabs from '../tabs';
import type { ZnErrorEvent } from '../../events/zn-error';

import styles from './theme-editor.scss';

export type ThemeEditorMode = 'light' | 'dark';
export type ThemeEditorDevice = 'desktop' | 'tablet' | 'mobile';

export interface ThemeEditorGroup {
  /** The slot name controls are assigned to with `slot="<name>"`. */
  name: string;
  caption: string;
  description?: string;
  /** Renders expanded initially. */
  open?: boolean;
}

export interface ThemeEditorSection extends ThemeEditorGroup {
  /**
   * Nests a collapsible per group inside this section's tab instead of the
   * section's own controls directly. A non-empty `groups` on ANY section
   * switches every section to `zn-tabs`, regardless of `section-layout`.
   */
  groups?: ThemeEditorGroup[];
}

export interface ThemeEditorSource {
  label: string;
  src: string;
}

// Controls whose state lives on `checked` rather than `value`.
const BOOLEAN_CONTROLS = new Set(['zn-checkbox', 'zn-toggle']);

// Matches theme-editor.scss's stacked breakpoint - keep both in sync.
const STACKED_QUERY = '(max-width: 768px)';

const DEVICES: { id: ThemeEditorDevice; icon: string; label: string }[] = [
  { id: 'desktop', icon: 'monitor', label: 'Desktop' },
  { id: 'tablet', icon: 'tablet', label: 'Tablet' },
  { id: 'mobile', icon: 'smartphone', label: 'Mobile' },
];

interface HarvestableControl extends HTMLElement {
  name?: string;
  value?: unknown;
  checked?: boolean;
  disabled?: boolean;
  type?: string;
}

/** Turns a freeform `group`/`category` label into a slot-safe name. */
function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

interface DerivedStructure {
  sections: ThemeEditorSection[];
  /** The slot name each control must be assigned to. */
  assignments: Map<Element, string>;
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
 * @dependency zn-tabs
 * @dependency zn-navbar
 * @dependency zn-select
 *
 * @event zn-theme-change - Emitted when the values, mode or device change.
 * @event zn-theme-submit - Emitted on submit (button click), carrying the
 * current values. With `action` set, only fires after a successful save.
 * @event zn-error - Emitted when a save fails. Also seen for preview render
 * failures: the frame's zn-error is composed and not stopped, so it bubbles
 * out through the editor too.
 *
 * @slot - Ungrouped theme controls, rendered above any sections. Controls
 * assigned `slot="<name>"` matching a `sections` entry (or, when nested, a
 * `groups` entry) render inside that section/group instead. Harvesting and
 * change detection walk every slot's full assigned subtree, not just direct
 * children.
 *
 * With `sections` left unset, the structure is instead derived from the
 * controls' own attributes: `group="<label>"` becomes a tab and
 * `category="<label>"` a collapsible within it, and the control is slotted
 * into that collapsible automatically. Either attribute works alone - a
 * control with only `group` sits directly in its tab, and one with only
 * `category` becomes its own top-level section. Setting `sections`
 * explicitly disables the derivation entirely.
 * @slot toolbar - Actions in the toolbar, right-aligned beside the device
 * controls. Where a save button belongs.
 * @slot footer - Actions pinned beneath the controls. The built-in submit button
 * lives in the toolbar, not here.
 *
 * @csspart base - The component's base wrapper.
 * @csspart controls - The left-hand controls column, full height.
 * @csspart controls-header - The controls column's header row: `controls-caption` on the left, the light/dark mode toggle on the right.
 * @csspart toolbar - The preview column's header row: `preview-caption` on the left, the device switcher (and sources/submit) on the right. Spans the preview column only.
 * @csspart section - A rendered section's or group's collapsible (`section-layout="collapsible"`, or any nested group).
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
    'zn-tabs': ZnTabs,
    'zn-navbar': ZnNavbar,
    'zn-select': ZnSelect,
    'zn-option': ZnOption,
  };

  /** URL of the preview shell page; forwarded to the frame. */
  @property() src = '';

  /** Expected origin of the iframe; forwarded to the frame. */
  @property({ attribute: 'frame-origin' }) frameOrigin = '';

  /** Optional endpoint returning the base hp-preview:config payload. */
  @property({ attribute: 'data-uri' }) dataUri = '';

  /** Which mode the preview renders in. Travels in the theme payload. */
  @property({ reflect: true }) mode: ThemeEditorMode = 'light';

  /** Preview viewport width. Resizes the frame only; not part of the payload. */
  @property({ reflect: true }) device: ThemeEditorDevice = 'desktop';

  /** Minimum height of the preview row, in pixels; forwarded to the frame as its own floor. */
  @property({ type: Number, attribute: 'min-height' }) minHeight = 480;

  /** Debounce in ms between a control change and the push to the preview. */
  @property({ type: Number }) debounce = 150;

  /** Optional endpoint the values are POSTed to. Empty = no persistence. */
  @property() action = '';

  /** Debounce in ms between a control change and the save POST. */
  @property({ type: Number, attribute: 'save-debounce' }) saveDebounce = 1000;

  /**
   * Groups controls into named sections. Empty/unset falls back to deriving the
   * structure from the controls' own `group`/`category` attributes, and renders
   * one ungrouped column when they carry neither. A section with a non-empty
   * `groups` nests a collapsible per group inside a `zn-tabs` tab for that
   * section - see `groups` on `ThemeEditorSection`.
   */
  @property({ type: Array }) sections: ThemeEditorSection[] = [];

  /**
   * Presentation for flat, group-less `sections`: stacked `zn-collapsible`s
   * (default) or a `zn-tabs` strip. Ignored once any section has `groups` -
   * nested sections always render as tabs.
   */
  @property({ attribute: 'section-layout' }) sectionLayout: 'collapsible' | 'tabs' = 'collapsible';

  /** Dropdown of preview sources, `{label, src}`, rendered in the toolbar. Empty/unset renders no dropdown; the first entry wins over an explicit `src` when non-empty. */
  @property({ type: Array }) sources: ThemeEditorSource[] = [];

  /** Collapses the controls column. */
  @property({ type: Boolean, reflect: true, attribute: 'controls-collapsed' }) controlsCollapsed = false;

  /** Presents the editor as its own bordered, rounded panel with a plain preview backdrop, rather than embedded in a dotted canvas. */
  @property({ type: Boolean, reflect: true }) standalone = false;

  /** Caption in the controls column's header row. Empty (default) renders no text; the row itself always renders. */
  @property({ attribute: 'controls-caption' }) controlsCaption = '';

  /** Caption at the left of the toolbar, opposite the device and mode controls. Empty (default) renders no text. */
  @property({ attribute: 'preview-caption' }) previewCaption = '';

  /** Label for the built-in submit button. Empty (default) renders no button. */
  @property({ attribute: 'submit-label' }) submitLabel = '';

  /** Disables the debounced auto-save; saving then happens only via submit. Preview pushes are unaffected. */
  @property({ type: Boolean }) manual = false;

  @query('zn-preview-frame') frame: ZnPreviewFrame;

  @query('slot:not([name])') private controlsSlot: HTMLSlotElement;

  @queryAll('.editor__section-slot') private sectionSlots: NodeListOf<HTMLSlotElement>;

  @state() protected error = '';

  @state() private _submitting = false;

  // Which `sources` entry drives the frame's src. Purely a view toggle -
  // never read by harvesting, seeding or the push/save pipeline.
  @state() private _sourceIndex = 0;

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
  private readonly _controlsObserverConfig: MutationObserverInit = { childList: true, subtree: true };

  private readonly _controlsObserver = new MutationController(this, {
    target: null,
    config: this._controlsObserverConfig,
    callback: () => this._pushIfControlsChanged(),
  });

  // Per-mode value sets. Seeded once per control name (never re-seeded, so a
  // user's edits survive later controls being added) and otherwise updated by
  // harvesting the DOM into the active mode only.
  private _modeValues: Record<ThemeEditorMode, Record<string, unknown>> = { light: {}, dark: {} };

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
  get values(): { light: Record<string, unknown>; dark: Record<string, unknown> } {
    return { light: { ...this._modeValues.light }, dark: { ...this._modeValues.dark } };
  }

  /** The active mode's values - what gets pushed to the preview frame. */
  get activeValues(): Record<string, unknown> {
    return { ...this._modeValues[this.mode] };
  }

  /** The default slot plus every rendered section slot. */
  private _controlSlots(): HTMLSlotElement[] {
    return [this.controlsSlot, ...Array.from(this.sectionSlots ?? [])]
      .filter((slot): slot is HTMLSlotElement => !!slot);
  }

  /** Walks every control slot (default and sections) for every enabled, named control. */
  private _harvestNamed(): { name: string; control: HarvestableControl }[] {
    const found: { name: string; control: HarvestableControl }[] = [];

    for (const slot of this._controlSlots()) {
      const roots = slot.assignedElements({ flatten: true });
      for (const root of roots) {
        const candidates = [root, ...Array.from(root.querySelectorAll('[name]'))];
        for (const candidate of candidates) {
          const control = candidate as HarvestableControl;
          if (!control.getAttribute?.('name') || control.disabled) continue;
          found.push({ name: control.getAttribute('name')!, control });
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
    for (const { name, control } of this._harvestNamed()) {
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
    for (const { name, control } of this._harvestNamed()) {
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
    for (const { name, control } of this._harvestNamed()) {
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
    this.frame?.setTheme({ mode: this.mode, values: this.activeValues });
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

    const current = this._harvestNamed().map(({ control }) => control);
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
      this.emit('zn-theme-submit', { detail: { values: this.values } });
      return;
    }

    this._submitting = true;
    void this._awaitSave()
      .then(ok => {
        if (ok) this.emit('zn-theme-submit', { detail: { values: this.values } });
      })
      .finally(() => {
        this._submitting = false;
      });
  };

  private _announce() {
    this.emit('zn-theme-change', { detail: { values: this.values, mode: this.mode, device: this.device } });
  }

  private _fail(message: string) {
    this.error = message;
    this.emit('zn-error', { detail: { message } });
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

  private _sourcesSafe(): ThemeEditorSource[] {
    return Array.isArray(this.sources) ? this.sources : [];
  }

  // The first source wins over an explicit `src` when sources is non-empty.
  // The frame reloads on switch; setTheme()'s retained payload replays after
  // its next hp-preview:ready, so nothing further is needed here.
  private _frameSrc(): string {
    const sources = this._sourcesSafe();
    return sources.length > 0 ? (sources[this._sourceIndex] ?? sources[0]).src : this.src;
  }

  private readonly _onSourceChange = (e: Event) => {
    const index = Number((e.target as HTMLElement & { value: string }).value);
    if (!Number.isNaN(index)) this._sourceIndex = index;
  };

  private _sectionsSafe(): ThemeEditorSection[] {
    // Lit's default converter falls back to null on bad JSON, and does nothing
    // to coerce valid-but-non-array JSON - both would otherwise crash render().
    return Array.isArray(this.sections) ? this.sections : [];
  }

  private _groupsFor(section: ThemeEditorSection): ThemeEditorGroup[] {
    return Array.isArray(section?.groups) ? section.groups : [];
  }

  /** Whether any direct child carries the `group`/`category` structure attributes. */
  private _hasStructureAttributes(): boolean {
    return Array.from(this.children).some(el => el.hasAttribute('group') || el.hasAttribute('category'));
  }

  /** Attribute-derived structure applies only when `sections` is left unset. */
  private _usesDerivedSections(): boolean {
    return this._sectionsSafe().length === 0 && this._hasStructureAttributes();
  }

  /**
   * Builds the tab/collapsible tree from the controls' own `group` (tab) and
   * `category` (collapsible) attributes, alongside the slot name each control
   * needs assigning to. Only direct children are considered, since `slot` only
   * works one level deep. Slot names are slugged from the labels and made
   * unique across the whole tree, so two tabs can each hold a "Colors"
   * category without their slots colliding.
   */
  private _derive(): DerivedStructure {
    const used = new Set<string>();
    const unique = (label: string) => {
      const base = slugify(label) || 'group';
      let name = base;
      for (let i = 2; used.has(name); i++) name = `${base}-${i}`;
      used.add(name);
      return name;
    };

    const sections = new Map<string, ThemeEditorSection & { groups: ThemeEditorGroup[] }>();
    const groupNames = new Map<string, string>();
    const assignments = new Map<Element, string>();

    for (const child of Array.from(this.children)) {
      const group = child.getAttribute('group')?.trim() ?? '';
      const category = child.getAttribute('category')?.trim() ?? '';
      if (!group && !category) continue;

      // A `category` with no `group` becomes its own top-level section.
      const sectionLabel = group || category;
      let section = sections.get(sectionLabel);
      if (!section) {
        section = { name: unique(sectionLabel), caption: sectionLabel, groups: [] };
        sections.set(sectionLabel, section);
      }

      // Only one of the two present: the control sits directly in the section.
      if (!group || !category) {
        assignments.set(child, section.name);
        continue;
      }

      const key = `${sectionLabel} ${category}`;
      let groupName = groupNames.get(key);
      if (!groupName) {
        groupName = unique(`${sectionLabel}-${category}`);
        groupNames.set(key, groupName);
        section.groups.push({ name: groupName, caption: category });
      }
      assignments.set(child, groupName);
    }

    return { sections: Array.from(sections.values()), assignments };
  }

  /** Explicit `sections` when set, otherwise the attribute-derived tree. */
  private _effectiveSections(): ThemeEditorSection[] {
    return this._usesDerivedSections() ? this._derive().sections : this._sectionsSafe();
  }

  // Assignment is idempotent: the `slot` attribute is only written when it
  // actually differs, so the slotchange this triggers settles in one pass. The
  // observer's childList-only config means these writes never feed back into it.
  private _assignDerivedSlots() {
    if (!this._usesDerivedSections()) return;
    for (const [el, slotName] of this._derive().assignments) {
      if (el.getAttribute('slot') !== slotName) el.setAttribute('slot', slotName);
    }
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    this._assignDerivedSlots();
  }

  /** Whether any section has a populated `groups` - the switch to nested tabs+collapsibles. */
  private _hasNestedGroups(): boolean {
    return this._effectiveSections().some(section => this._groupsFor(section).length > 0);
  }

  private _visibleGroups(section: ThemeEditorSection): ThemeEditorGroup[] {
    return this._groupsFor(section).filter(group => this._hasAssignedControls(group.name));
  }

  /** Configured sections that have an assigned control, or (nested) a populated group - shared by every presentation. */
  private _visibleSections(): ThemeEditorSection[] {
    const sections = this._effectiveSections();
    return this._hasNestedGroups()
      ? sections.filter(section => this._visibleGroups(section).length > 0)
      : sections.filter(section => this._hasAssignedControls(section.name));
  }

  private _renderSections() {
    return this._visibleSections().map(section => html`
      <zn-collapsible
        class="editor__section"
        part="section"
        caption="${section.caption}"
        description="${ifDefined(section.description)}"
        default="${section.open ? 'open' : 'closed'}">
        <div class="editor__section-fields">
          <slot name="${section.name}" class="editor__section-slot" @slotchange="${this._onSlotChange}"></slot>
        </div>
      </zn-collapsible>`);
  }

  private _renderGroups(section: ThemeEditorSection) {
    return this._visibleGroups(section).map(group => html`
      <zn-collapsible
        class="editor__section"
        part="section"
        caption="${group.caption}"
        description="${ifDefined(group.description)}"
        default="${group.open ? 'open' : 'closed'}">
        <div class="editor__section-fields">
          <slot name="${group.name}" class="editor__section-slot" @slotchange="${this._onSlotChange}"></slot>
        </div>
      </zn-collapsible>`);
  }

  // zn-tabs never removes a panel - it toggles `selected` on it and hides the
  // rest via its own shadow stylesheet - so every section's slot(s) stay
  // assigned and switching tabs can never drop a control's value from the
  // theme. The first visible section is the initial `active` tab; once set,
  // Lit only re-touches the attribute (resetting zn-tabs' own tracked
  // selection) if that name actually changes between renders.
  private _renderTabs(panel: (section: ThemeEditorSection) => unknown) {
    const sections = this._visibleSections();
    if (sections.length === 0) return nothing;

    return html`
      <zn-tabs class="editor__tabs" flush active="${sections[0].name}">
        <zn-navbar slot="top" border>
          ${sections.map(section => html`<li tab="${section.name}">${section.caption}</li>`)}
        </zn-navbar>
        ${sections.map(section => html`
          <div id="${section.name}" class="editor__tab-panel">${panel(section)}</div>`)}
      </zn-tabs>`;
  }

  render() {
    return html`
      <div part="base" class="editor ${this.controlsCollapsed ? 'editor--controls-collapsed' : ''}"
           style="min-height: ${this.minHeight}px">
        <div part="controls" class="editor__controls">
          <div part="controls-header" class="editor__controls-header">
            ${this.controlsCaption ? html`<span class="editor__caption">${this.controlsCaption}</span>` : nothing}
            <button type="button"
                    class="editor__mode"
                    data-mode-toggle
                    aria-label="${this.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}"
                    @click="${this._toggleMode}">
              <zn-icon src="${this.mode === 'dark' ? 'sun' : 'moon'}" library="lucide" size="16"></zn-icon>
            </button>
          </div>
          <div class="editor__controls-body">
            <div
              class="editor__fields ${this.hasSlotController.test('[default]') ? '' : 'editor__fields--sections-only'}"
              @zn-change="${this._onControlChange}"
              @zn-input="${this._onControlChange}"
              @change="${this._onControlChange}"
              @input="${this._onControlChange}">
              <slot @slotchange="${this._onSlotChange}"></slot>
              ${this._hasNestedGroups()
                ? this._renderTabs(section => html`
                    ${this._hasAssignedControls(section.name) ? html`
                      <slot name="${section.name}" class="editor__section-slot" @slotchange="${this._onSlotChange}"></slot>` : nothing}
                    ${this._renderGroups(section)}`)
                : this.sectionLayout === 'tabs'
                  ? this._renderTabs(section => html`
                      <slot name="${section.name}" class="editor__section-slot" @slotchange="${this._onSlotChange}"></slot>`)
                  : this._renderSections()}
            </div>
            ${this.hasSlotController.test('footer') ? html`
              <div part="footer" class="editor__footer">
                <slot name="footer"></slot>
              </div>` : nothing}
          </div>
        </div>

        <div class="editor__main">
          <button type="button"
                  class="panel-toggle panel-toggle--left ${this.controlsCollapsed ? 'panel-toggle--tucked' : ''}"
                  title="${this.controlsCollapsed ? 'Show controls' : 'Hide controls'}"
                  aria-label="${this.controlsCollapsed ? 'Show controls' : 'Hide controls'}"
                  @click="${() => (this.controlsCollapsed = !this.controlsCollapsed)}">
            <zn-icon src="${this.controlsCollapsed ? 'chevron-right@lu' : 'chevron-left@lu'}" size="16"></zn-icon>
          </button>

          <div part="toolbar" class="editor__toolbar">
            ${this.previewCaption ? html`<span class="editor__caption">${this.previewCaption}</span>` : nothing}
            <div class="editor__toolbar-actions">
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
              ${this._sourcesSafe().length > 0 ? html`
                <zn-select
                  class="editor__sources"
                  size="small"
                  label="Preview source"
                  hoist
                  .value="${String(this._sourceIndex)}"
                  @zn-change="${this._onSourceChange}">
                  ${this._sourcesSafe().map((source, i) => html`
                    <zn-option value="${i}">${source.label}</zn-option>`)}
                </zn-select>` : nothing}
              <slot name="toolbar"></slot>
              ${this.submitLabel ? html`
                <zn-button class="editor__submit"
                           color="primary"
                           @click="${this._onSubmit}"
                           ?loading="${this._submitting}">${this.submitLabel}
                </zn-button>` : nothing}
            </div>
          </div>

          <div part="preview" class="editor__preview">
            ${this.error ? html`
              <div part="error" class="editor__error">${this.error}</div>` : nothing}
            <zn-preview-frame
              src="${this._frameSrc()}"
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
