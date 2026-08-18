import {
  cloneWithNewIds,
  containerCells,
  containerColumns,
  containerDepth,
  containerGrow,
  containerHeight,
  containerWidths,
  extractSection,
  findSection,
  insertIntoCell,
  normaliseCells,
  normaliseGrowth,
  normaliseSections,
  patchSection,
  recolumnCells,
  trimTrailingEmptyCells,
} from './page-tree';
import { type CSSResultGroup, html, type PropertyValues, type TemplateResult, unsafeCSS } from 'lit';
import {
  DEFAULT_WIDTHS,
  defaultLayout,
  emptyPageState,
  generateSectionId,
  isContainer,
  MAX_COLUMNS,
  MAX_CONTAINER_LEVELS,
  MAX_WIDTH,
  PAGE_SECTION_MIME,
  PAGE_TYPE_MIME,
  type PageSection,
  type PageSectionType,
  type PageState,
  sectionSummary,
} from './page.types';
import { FormControlController, validValidityState } from '../../internal/form';
import { HasSlotController } from '../../internal/slot';
import { ifDefined } from 'lit/directives/if-defined.js';
import { PageSectionRegistry } from './page-registry';
import { property, state } from 'lit/decorators.js';
import { watch } from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import ZnCollapsible from '../collapsible';
import ZnIcon from '../icon';
import ZnInput from '../input';
import ZnPagePaletteItem from './modules/page-palette-item';
import ZnPageSectionCard from './modules/page-section-card';
import ZnToggle from '../toggle';

import styles from './page-builder.scss';

const HISTORY_LIMIT = 50;
/** Builder width below which the palette auto-collapses — keep in sync with the @container query in page-builder.scss. */
const NARROW_WIDTH = 768;

const AUTO_SAVE_DEFAULT_MINUTES = 5;
const AUTO_SAVE_TTL_MS = 24 * 60 * 60 * 1000;

/** Compact relative time for the auto-save status ("just now", "3m ago"). */
function timeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Where a section lives inside a container cell. */
interface CellOwner {
  containerId: string;
  cellIndex: number;
  index: number;
  columns: number;
}

/**
 * @summary A config-driven page composer: a palette of predefined section types, a linear
 *   canvas of section cards, and an inspector for editing each section's content.
 * @documentation https://zinc.style/components/page-builder
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-collapsible
 * @dependency zn-icon
 * @dependency zn-input
 * @dependency zn-page-palette-item
 * @dependency zn-page-section-card
 *
 * @event zn-page-change - Emitted whenever the page state changes. `event.detail.state` is the new PageState.
 * @event zn-page-selection-change - Emitted when the selected section changes. `event.detail.sectionId`.
 *
 * @slot config - `<template type="…">` declarations; never displayed. Each template's attributes
 *   (type, label, icon, icon-library, color, category, description, container, columns, widths,
 *   grow, slots, accepts) declare a palette entry and its content declares the inspector form for
 *   that type. `container` makes the type a container whose editor-configurable layout starts from
 *   `columns` (seeds equal widths) or `widths` (explicit weights, wins over `columns`); `grow` seeds
 *   a growable instance. `accepts` is a comma-separated list of the type keys its cells allow —
 *   omitted on a `container` type, any type is allowed subject to the nesting cap. `slots` is
 *   @deprecated: it declares a fixed-slot container of `DEFAULT_WIDTHS` columns pinned to that many
 *   cells, and keeps the old any-non-container-type rule when `accepts` is omitted.
 * @slot header-left - Actions shown on the left of the header bar.
 * @slot header-right - Actions shown on the right of the header bar.
 *
 * @csspart base - The grid wrapper.
 * @csspart header - The full-width header action bar (only rendered when header slots are filled).
 * @csspart palette - The left palette panel.
 * @csspart canvas - The centre section-card canvas.
 * @csspart inspector - The right panel while a section is selected.
 * @csspart inspector-header - The inspector's fixed header (icon, section name, type, close).
 * @csspart inspector-body - The inspector's scrolling form area.
 */
export default class ZnPageBuilder extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-collapsible': ZnCollapsible,
    'zn-icon': ZnIcon,
    'zn-input': ZnInput,
    'zn-page-palette-item': ZnPagePaletteItem,
    'zn-page-section-card': ZnPageSectionCard,
    'zn-toggle': ZnToggle,
  };

  private readonly formControlController = new FormControlController(this);

  /** The name of the control, submitted as a name/value pair with form data. */
  @property() name = '';

  /** Associates the control with a form by id. The form must be in the same document or shadow root. */
  @property({ reflect: true }) form = '';

  /** The page state as a JSON string. Parsed on set; invalid JSON is ignored with a warning. */
  @property() config = '';

  @property({ reflect: true }) heading = '';
  @property({ reflect: true }) subheading = '';

  /**
   * Section type key that must lead the page. The builder hoists an existing section of
   * that type to the top, or inserts an empty one, and pins it there: it can't be
   * removed, reordered or dragged into a slot, and nothing can be dropped above it.
   * Its content stays fully editable in the inspector.
   */
  @property({ attribute: 'required-first', reflect: true }) requiredFirst = '';

  /** Section types to make available, registered into the internal registry. */
  @property({ attribute: false }) sectionTypes: PageSectionType[] = [];

  /** Collapses the left palette. Auto-set when the builder becomes narrow. */
  @property({ type: Boolean, reflect: true, attribute: 'palette-collapsed' }) paletteCollapsed = false;

  /** Collapses the inspector while a section is selected. */
  @property({ type: Boolean, reflect: true, attribute: 'inspector-collapsed' }) inspectorCollapsed = false;

  /**
   * Auto-save the page to localStorage (1-day TTL). Omit to disable. A bare
   * `auto-save` saves every 5 minutes; a numeric value sets the interval in
   * minutes (`auto-save="2"`). Restore with `restoreAutoSave()`.
   */
  @property({
    attribute: 'auto-save',
    converter: {
      fromAttribute: (value: string | null) => {
        if (value === null) return null;
        const minutes = parseFloat(value);
        return Number.isFinite(minutes) && minutes > 0 ? minutes : AUTO_SAVE_DEFAULT_MINUTES;
      },
      toAttribute: (value: number | null) => (value === null ? null : String(value)),
    },
  }) autoSave: number | null = null;

  private registry = new PageSectionRegistry();

  @state() private _state: PageState = emptyPageState();
  @state() private _selectedId: string | null = null;
  @state() private _search = '';
  /** Index of the drop zone whose "+" type picker is open, if any. */
  @state() private _pickerIndex: number | null = null;
  @state() private _dragOverIndex: number | null = null;
  /** The cell a drag is currently over, if any. */
  @state() private _cellDragOver: { containerId: string; cellIndex: number; insertIndex: number } | null = null;
  /** The cell whose "+" type picker is open, if any. */
  @state() private _cellPicker: { containerId: string; cellIndex: number } | null = null;
  /** The stamped config form for the selected section; rebuilt on selection change. */
  @state() private _form: HTMLDivElement | null = null;

  private readonly _hasSlot = new HasSlotController(this, 'header-left', 'header-right');

  private _history: PageState[] = [];
  private _redoStack: PageState[] = [];

  /** A deep copy of the current page state. */
  get state(): PageState {
    return structuredClone(this._state);
  }

  /** Replaces the page state wholesale (does not emit zn-page-change). */
  set state(next: PageState) {
    try {
      this._applyExternalState(next);
    } catch {
      console.warn('<zn-page-builder> invalid state');
    }
  }

  /** The page state as a JSON string — the value submitted with form data. */
  get value(): string {
    return JSON.stringify(this._state);
  }

  /** Replaces the page state from a JSON string (does not emit zn-page-change). */
  set value(next: string) {
    if (!next) return;
    try {
      this._applyExternalState(JSON.parse(next) as PageState);
    } catch {
      console.warn('<zn-page-builder> invalid value JSON');
    }
  }

  /** The serialised state of the last externally loaded page — restored on form reset. */
  defaultValue = JSON.stringify(emptyPageState());

  /** Gets the validity state object. */
  get validity(): ValidityState {
    return validValidityState;
  }

  /** Gets the validation message. */
  get validationMessage(): string {
    return '';
  }

  /** Checks for validity but does not show a validation message. */
  checkValidity(): boolean {
    return true;
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity(): boolean {
    return true;
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCustomValidity(_message = '') {
    // Always valid.
  }

  @watch('config')
  handleConfigChange() {
    if (!this.config) return;
    try {
      this._applyExternalState(JSON.parse(this.config) as PageState);
    } catch {
      console.warn('<zn-page-builder> invalid config JSON');
    }
  }

  // Idempotent, so it does not matter whether this or handleConfigChange runs first.
  @watch('requiredFirst')
  handleRequiredFirstChange() {
    const sections = this._requireFirst(this._state.sections);
    if (sections === this._state.sections) return;
    this._state = { sections };
    this.defaultValue = JSON.stringify(this._state);
  }

  @watch('sectionTypes')
  handleSectionTypesChange() {
    this.registry.registerAll(this.sectionTypes ?? []);
    this.requestUpdate();
  }

  registerSectionType(type: PageSectionType): this {
    this.registry.register(type);
    this.requestUpdate();
    return this;
  }

  registerSectionTypes(types: PageSectionType[]): this {
    this.registry.registerAll(types);
    this.requestUpdate();
    return this;
  }

  /**
   * Auto-collapses the palette when the builder crosses into narrow — only on the
   * crossing, so re-expanding while narrow stays a user choice.
   */
  private _wasNarrow = false;

  private _resizeObserver = new ResizeObserver(entries => {
    const width = entries[0]?.contentRect.width ?? 0;
    if (width <= 0) return;
    const narrow = width < NARROW_WIDTH;
    if (narrow && !this._wasNarrow) this.paletteCollapsed = true;
    this._wasNarrow = narrow;
  });

  connectedCallback() {
    super.connectedCallback();
    this._registerSlottedTemplates();
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    this._resizeObserver.disconnect();
    this._stopAutoSave();
    if (this._justSavedTimer !== null) {
      clearTimeout(this._justSavedTimer);
      this._justSavedTimer = null;
    }
    super.disconnectedCallback();
  }

  // --- Auto-save (mirrors flow-builder's) --------------------------------------

  private _autoSaveTimer: number | null = null;
  private _statusTimer: number | null = null;
  private _justSavedTimer: number | null = null;
  /** Guards the restore prompt from re-triggering on restoreAutoSave's own state install. */
  private _restoring = false;

  /** Epoch of the newest auto-save (also picked up from storage on start). */
  @state() private _lastSavedAt: number | null = null;
  /** Briefly true right after a save — flashes "Auto-saved" in the status pill. */
  @state() private _justSaved = false;
  /** Re-render clock for the "last saved Xm ago" label. */
  @state() private _statusNow = Date.now();
  /** A fresh auto-save differing from the loaded page — offer to restore it. */
  @state() private _restorePrompt: { savedAt: number } | null = null;

  /** localStorage key for this builder's auto-saves — its id, else its heading. */
  private get _autoSaveKey(): string {
    return `zn-page-builder:${this.id || this.heading || 'page'}`;
  }

  // The "Auto-saved" flash timeout is deliberately not cleared here — it always
  // runs out 2.5s after the last save, even if the schedule changes meanwhile.
  private _stopAutoSave() {
    if (this._autoSaveTimer !== null) {
      clearInterval(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }
    if (this._statusTimer !== null) {
      clearInterval(this._statusTimer);
      this._statusTimer = null;
    }
  }

  private _restartAutoSave() {
    this._stopAutoSave();
    if (this.autoSave === null) return;
    // Housekeeping: drop an expired auto-save, and carry its timestamp into the
    // status pill when one survives — "last saved" outlives a reload.
    const saved = this._readAutoSave();
    if (saved) this._lastSavedAt = saved.savedAt;
    this._autoSaveTimer = window.setInterval(this._autoSaveTick, this.autoSave * 60_000);
    this._statusTimer = window.setInterval(() => (this._statusNow = Date.now()), 30_000);
  }

  /** An empty page is never saved — it would clobber a stored page with nothing. */
  private _autoSaveTick = () => {
    if (!this._state.sections.length || this._restorePrompt) return;
    try {
      localStorage.setItem(this._autoSaveKey, JSON.stringify({ savedAt: Date.now(), state: this._state }));
      this._lastSavedAt = Date.now();
      this._justSaved = true;
      if (this._justSavedTimer !== null) clearTimeout(this._justSavedTimer);
      this._justSavedTimer = window.setTimeout(() => (this._justSaved = false), 2500);
    } catch {
      /* storage unavailable / full */
    }
  };

  /** The stored auto-save, purging it when past its TTL (or unreadable). */
  private _readAutoSave(): { savedAt: number; state: PageState } | null {
    try {
      const raw = localStorage.getItem(this._autoSaveKey);
      if (!raw) return null;
      const saved = JSON.parse(raw) as { savedAt: number; state: PageState };
      if (!saved.state || Date.now() - saved.savedAt > AUTO_SAVE_TTL_MS) {
        localStorage.removeItem(this._autoSaveKey);
        return null;
      }
      return saved;
    } catch {
      return null;
    }
  }

  /** Load the auto-saved page, if one exists within the 1-day TTL. */
  restoreAutoSave = (): boolean => {
    const saved = this._readAutoSave();
    if (!saved) return false;
    this._restoring = true;
    try {
      this._applyExternalState(saved.state);
    } finally {
      this._restoring = false;
    }
    this._restorePrompt = null;
    return true;
  };

  /**
   * A page was just loaded — when a fresh auto-save differs from it, ask the
   * user whether to pick up their draft instead.
   */
  private _offerRestoreIfNewer() {
    if (this.autoSave === null || this._restoring) return;
    const saved = this._readAutoSave();
    this._restorePrompt = saved && JSON.stringify(saved.state) !== JSON.stringify(this._state)
      ? { savedAt: saved.savedAt }
      : null;
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('_selectedId')) this._buildInspectorForm();
    if (changed.has('autoSave')) this._restartAutoSave();
  }

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this.formControlController.updateValidity();
  }

  // --- Slotted templates define section types --------------------------------

  private _typeFromTemplate(el: HTMLTemplateElement): PageSectionType | null {
    const type = el.getAttribute('type');
    if (!type) return null;
    const slots = parseInt(el.getAttribute('slots') ?? '', 10);
    // `container` is the flag; `columns`/`widths`/`grow` only apply when it's present, so a
    // legacy `slots`-only declaration is untouched by the new fields.
    const container = el.hasAttribute('container');
    let defaultWidths: number[] | undefined;
    if (container) {
      const widths = (el.getAttribute('widths') ?? '')
        .trim().split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
      const columns = parseInt(el.getAttribute('columns') ?? '', 10);
      defaultWidths = widths.length
        ? widths
        : columns > 0 ? Array.from({ length: columns }, () => 1) : [...DEFAULT_WIDTHS];
    }
    return {
      type,
      label: el.getAttribute('label') ?? type,
      icon: el.getAttribute('icon') ?? undefined,
      iconLibrary: el.getAttribute('icon-library') ?? undefined,
      color: el.getAttribute('color') ?? undefined,
      category: el.getAttribute('category') ?? undefined,
      description: el.getAttribute('description') ?? undefined,
      configTemplate: el,
      slots: slots > 0 ? slots : undefined,
      accepts: el.getAttribute('accepts')?.split(',').map(s => s.trim()).filter(Boolean),
      container: container ? true : undefined,
      defaultWidths,
      defaultGrow: container ? el.hasAttribute('grow') : undefined,
    };
  }

  private _registerSlottedTemplates = () => {
    let added = false;
    this.querySelectorAll<HTMLTemplateElement>('template[slot="config"][type]').forEach(el => {
      const type = this._typeFromTemplate(el);
      if (type && !this.registry.has(type.type)) {
        this.registry.register(type);
        added = true;
      }
    });
    if (added) this.requestUpdate();
  };

  /** Normalises and installs an externally provided state; resets selection. */
  private _applyExternalState(next: PageState) {
    const { sections, warnings } = normaliseSections(next?.sections, key => this.registry.get(key));
    warnings.forEach(warning => console.warn(`<zn-page-builder> ${warning}`));
    this._history = [];
    this._redoStack = [];
    this._state = { sections: this._requireFirst(sections) };
    this.defaultValue = JSON.stringify(this._state);
    this._selectedId = null;
    this._pickerIndex = null;
    this._cellPicker = null;
    this._offerRestoreIfNewer();
  }

  // --- The pinned leading section (`required-first`) ---------------------------

  /**
   * Id of the section pinned to the top of the page, or null when `required-first`
   * is unset. Derived from the state rather than stored on it, so nothing about the
   * lock leaks into the persisted config.
   */
  private get _pinnedId(): string | null {
    const first = this._state.sections[0];
    return this.requiredFirst && first?.type === this.requiredFirst ? first.id : null;
  }

  private _isPinned(id: string): boolean {
    return this._pinnedId === id;
  }

  /** Lowest top-level index a section may be added or moved to. */
  private get _firstFreeIndex(): number {
    return this._pinnedId === null ? 0 : 1;
  }

  /**
   * Sections reordered so `required-first` leads the page: an existing section of that
   * type is hoisted to the front, otherwise an empty one is prepended. Returns the
   * argument unchanged when there is nothing to do, so callers can compare by identity.
   */
  private _requireFirst(sections: PageSection[]): PageSection[] {
    if (!this.requiredFirst || sections[0]?.type === this.requiredFirst) return sections;
    const at = sections.findIndex(s => s.type === this.requiredFirst);
    if (at === -1) return [this._newSection(this.requiredFirst), ...sections];
    const hoisted = [...sections];
    hoisted.unshift(...hoisted.splice(at, 1));
    return hoisted;
  }

  /**
   * Installs a new state from a user edit and notifies listeners. Re-applies
   * growth normalisation across the tree first, so a growable container never
   * carries a trailing empty row past this point — the read path (`containerCells`)
   * already hides it, but state/value/zn-page-change/auto-save must not diverge
   * from what the canvas renders.
   */
  private _commit(next: PageState) {
    this._state = { sections: normaliseGrowth(next.sections, key => this.registry.get(key)) };
    this.emit('zn-page-change', { detail: { state: this.state } });
  }

  private _selectedSection(): PageSection | undefined {
    return findSection(this._state.sections, this._selectedId);
  }

  private _select(id: string | null) {
    if (this._selectedId === id) return;
    this._selectedId = id;
    this._pickerIndex = null;
    this._cellPicker = null;
    this.emit('zn-page-selection-change', { detail: { sectionId: id } });
  }

  // --- History ----------------------------------------------------------------

  private _pushHistory() {
    this._history.push(structuredClone(this._state));
    if (this._history.length > HISTORY_LIMIT) this._history.shift();
    this._redoStack = [];
  }

  // Bound fields (not methods) so hosts can pass them straight to event
  // listeners — `button.addEventListener('click', builder.undo)`.
  undo = () => {
    const prev = this._history.pop();
    if (!prev) return;
    this._redoStack.push(structuredClone(this._state));
    this._select(null);
    this._commit(prev);
  };

  redo = () => {
    const next = this._redoStack.pop();
    if (!next) return;
    this._history.push(structuredClone(this._state));
    this._select(null);
    this._commit(next);
  };

  // --- Section mutations ------------------------------------------------------

  /** A fresh section of a registered type, seeded with layout/cells when it's a container. */
  private _newSection(type: string): PageSection {
    const sectionType = this.registry.get(type);
    const section: PageSection = { id: generateSectionId(), type, data: {} };
    if (isContainer(sectionType)) {
      section.layout = defaultLayout(sectionType);
      section.cells = containerCells(section, sectionType);
    }
    return section;
  }

  /** Adds a section of a registered type at `index` (default: end). Returns null for unknown types. */
  addSection(type: string, index?: number): PageSection | null {
    if (!this.registry.has(type)) return null;
    this._pushHistory();
    const section = this._newSection(type);
    const sections = [...this._state.sections];
    sections.splice(Math.max(index ?? sections.length, this._firstFreeIndex), 0, section);
    this._commit({ sections });
    this._select(section.id);
    return section;
  }

  private _removeSection(id: string) {
    if (this._isPinned(id)) return;
    const [removed, sections] = extractSection(this._state.sections, id);
    if (!removed) return;
    this._pushHistory();
    // Clear selection for the removed section AND anything inside it, at any depth.
    const stillSelected = (s: PageSection): boolean =>
      s.id === this._selectedId || (s.cells ?? []).some(cell => cell.some(stillSelected));
    if (stillSelected(removed)) this._select(null);
    this._commit({ sections });
  }

  private _duplicateSection(id: string) {
    const index = this._state.sections.findIndex(s => s.id === id);
    if (index !== -1) {
      this._pushHistory();
      const copy = cloneWithNewIds(this._state.sections[index]);
      const sections = [...this._state.sections];
      sections.splice(index + 1, 0, copy);
      this._commit({ sections });
      this._select(copy.id);
      return;
    }
    // A section inside a cell duplicates directly below itself in that stack.
    const owner = this._findCellOwner(id);
    if (!owner) return;
    const copy = cloneWithNewIds(findSection(this._state.sections, id)!);
    this._pushHistory();
    this._commit({
      sections: insertIntoCell(
        this._state.sections, owner.containerId, owner.cellIndex, owner.index + 1, copy, owner.columns
      ),
    });
    this._select(copy.id);
  }

  /** Locates a section living inside a container cell. */
  private _findCellOwner(id: string): CellOwner | undefined {
    const search = (sections: PageSection[]): CellOwner | undefined => {
      for (const section of sections) {
        const cells = section.cells ?? [];
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
          const index = cells[cellIndex].findIndex(child => child.id === id);
          if (index !== -1) {
            return {
              containerId: section.id,
              cellIndex,
              index,
              columns: containerColumns(section, this.registry.get(section.type)),
            };
          }
          const deeper = search(cells[cellIndex]);
          if (deeper) return deeper;
        }
      }
      return undefined;
    };
    return search(this._state.sections);
  }

  /** Moves a section (top-level or inside a cell) to a top-level position. */
  private _moveSection(id: string, index: number) {
    if (this._isPinned(id)) return;
    index = Math.max(index, this._firstFreeIndex);
    const from = this._state.sections.findIndex(s => s.id === id);
    if (from !== -1) {
      const to = index > from ? index - 1 : index;
      if (to === from) return;
      this._pushHistory();
      const sections = [...this._state.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      this._commit({ sections });
      return;
    }
    const [moved, sections] = extractSection(this._state.sections, id);
    if (!moved) return;
    this._pushHistory();
    sections.splice(index, 0, moved);
    this._commit({ sections });
  }

  // --- Canvas drag & drop -----------------------------------------------------

  /** Id of the section currently being dragged — dataTransfer is unreadable during dragover. */
  private _draggingId: string | null = null;

  private _onCardDragStart(e: DragEvent, id: string) {
    if (!e.dataTransfer) return;
    e.stopPropagation(); // a child card's drag must not also start its container's
    this._draggingId = id;
    e.dataTransfer.setData(PAGE_SECTION_MIME, id);
    e.dataTransfer.effectAllowed = 'move';
  }

  /** Whether a drag carries one of the builder's own payloads. */
  private _isPageDrag(e: DragEvent): boolean {
    const types = e.dataTransfer ? Array.from(e.dataTransfer.types) : [];
    return types.includes(PAGE_TYPE_MIME) || types.includes(PAGE_SECTION_MIME);
  }

  private _onZoneDragOver(e: DragEvent, index: number) {
    if (!this._isPageDrag(e)) return;
    e.preventDefault();
    e.stopPropagation(); // claim this index over the canvas-level fallback
    this._dragOverIndex = index;
  }

  private _onZoneDrop(e: DragEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    this._dragOverIndex = null;
    const typeKey = e.dataTransfer?.getData(PAGE_TYPE_MIME);
    const sectionId = e.dataTransfer?.getData(PAGE_SECTION_MIME);
    if (typeKey) this.addSection(typeKey, index);
    else if (sectionId) this._moveSection(sectionId, index);
  }

  // Canvas-level fallback: the strips between cards are thin, so accept drags
  // anywhere on the canvas and target the end of the page.
  private _onCanvasDragOver = (e: DragEvent) => {
    if (!this._isPageDrag(e)) return;
    e.preventDefault();
    this._dragOverIndex = this._state.sections.length;
  };

  private _onCanvasDrop = (e: DragEvent) => {
    this._onZoneDrop(e, this._state.sections.length);
  };

  // --- Container cell drag & drop ----------------------------------------------

  /**
   * Whether `typeKey`'s registered type is allowed into this container by its
   * `accepts`/`slots=` rule — the nesting depth cap is a separate concern,
   * checked by each caller against its own notion of how tall the dropped
   * subtree is.
   */
  private _acceptsType(container: PageSection, typeKey: string): boolean {
    const containerType = this.registry.get(container.type);
    const dragged = this.registry.get(typeKey);
    if (!dragged || !isContainer(containerType)) return false;
    if (containerType!.accepts) return containerType!.accepts.includes(typeKey);
    // The deprecated `slots=` alias keeps its stricter non-containers-only rule.
    if (!containerType!.container) return !isContainer(dragged);
    return true;
  }

  /**
   * Whether `typeKey` may be dropped into this container's cells from the
   * palette. A newly created section always has height 1, so the depth cap
   * only needs the target's own depth.
   */
  private _acceptsInCell(container: PageSection, typeKey: string): boolean {
    const dragged = this.registry.get(typeKey);
    // The nesting depth cap is enforced independently of `accepts` — an explicit
    // allow-list must not be able to punch through MAX_CONTAINER_LEVELS.
    if (dragged && isContainer(dragged) && containerDepth(this._state.sections, container.id) >= MAX_CONTAINER_LEVELS) {
      return false;
    }
    return this._acceptsType(container, typeKey);
  }

  /**
   * Whether a dragged, already-placed section may land in this container's
   * cells. Unlike a palette drop, the moved subtree can already be several
   * containers tall (it may itself hold a nested container), so the cap has to
   * account for that height, not just the target's depth: dropping `moved` at
   * a new depth of `containerDepth(container) + 1` puts its own deepest
   * descendant at `containerDepth(container) + containerHeight(moved)`.
   */
  private _canMoveIntoCell(container: PageSection, sectionId: string): boolean {
    if (this._isPinned(sectionId)) return false;
    if (sectionId === container.id) return false;
    const moved = findSection(this._state.sections, sectionId);
    if (!moved) return false;
    // Refuse dropping a container into its own subtree.
    if (findSection([moved], container.id)) return false;
    if (containerDepth(this._state.sections, container.id) + containerHeight(moved) > MAX_CONTAINER_LEVELS) {
      return false;
    }
    return this._acceptsType(container, moved.type);
  }

  private _onCellDragOver(e: DragEvent, containerId: string, cellIndex: number, insertIndex: number) {
    if (!this._isPageDrag(e)) return;
    const container = findSection(this._state.sections, containerId);
    if (!container) return;
    // Claim the event before deciding accept/refuse — a nested cell is the deepest
    // target and must not let a refusal bubble up into an ancestor cell that accepts.
    e.stopPropagation();
    const types = e.dataTransfer ? Array.from(e.dataTransfer.types) : [];
    // A section drag is validated here from its own tracked id, since dataTransfer
    // values are unreadable during a real dragover (protected mode).
    if (types.includes(PAGE_SECTION_MIME) && this._draggingId && !this._canMoveIntoCell(container, this._draggingId)) {
      return;
    }
    // A type-key drag's payload is unreadable during a real dragover too, so this
    // only enforces `accepts`/depth when the payload happens to be readable; the
    // definitive check is on drop.
    const typeKey = types.includes(PAGE_TYPE_MIME) ? e.dataTransfer?.getData(PAGE_TYPE_MIME) : '';
    if (typeKey && !this._acceptsInCell(container, typeKey)) return;
    e.preventDefault();
    this._dragOverIndex = null;
    this._cellDragOver = { containerId, cellIndex, insertIndex };
  }

  private _onCellDrop(e: DragEvent, containerId: string, cellIndex: number, insertIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    this._cellDragOver = null;
    const typeKey = e.dataTransfer?.getData(PAGE_TYPE_MIME);
    const sectionId = e.dataTransfer?.getData(PAGE_SECTION_MIME);
    if (typeKey) this.addSectionToCell(typeKey, containerId, cellIndex, insertIndex);
    else if (sectionId) this._moveToCell(sectionId, containerId, cellIndex, insertIndex);
  }

  /** Adds a new section of a registered type into a container cell. */
  addSectionToCell(type: string, containerId: string, cellIndex: number, insertIndex = 0): PageSection | null {
    const container = findSection(this._state.sections, containerId);
    if (!container || !this._acceptsInCell(container, type)) return null;
    const section = this._newSection(type);
    this._pushHistory();
    this._commit({
      sections: insertIntoCell(
        this._state.sections, containerId, cellIndex, insertIndex, section,
        containerColumns(container, this.registry.get(container.type))
      ),
    });
    this._select(section.id);
    return section;
  }

  private _moveToCell(id: string, containerId: string, cellIndex: number, insertIndex: number) {
    const container = findSection(this._state.sections, containerId);
    if (!container || !this._canMoveIntoCell(container, id)) return;
    const columns = containerColumns(container, this.registry.get(container.type));
    const [moved, without] = extractSection(this._state.sections, id);
    if (!moved) return;
    this._pushHistory();
    this._commit({ sections: insertIntoCell(without, containerId, cellIndex, insertIndex, moved, columns) });
  }

  /** Types offerable in a container's cells. */
  private _cellTypes(container: PageSection): PageSectionType[] {
    return this.registry.all().filter(t => this._acceptsInCell(container, t.type));
  }

  private _onCardKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this._removeSection(id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._select(id);
    }
  }

  private _renderPalette() {
    const query = this._search.trim().toLowerCase();
    const categories = new Map<string, PageSectionType[]>();
    for (const [category, types] of this.registry.categories()) {
      const matches = query ? types.filter(t => t.label.toLowerCase().includes(query)) : types;
      if (matches.length) categories.set(category, matches);
    }

    return html`
      <aside part="palette" class="palette">
        <div class="palette__title">
          <div class="palette__text">
            <div class="palette__heading">${this.heading || 'Page Builder'}</div>
            ${this.subheading ? html`
              <div class="palette__subheading">${this.subheading}</div>` : ''}
          </div>
        </div>
        <zn-input
          class="palette__search"
          label="Search sections"
          placeholder="Search sections"
          clearable
          .value="${this._search}"
          @zn-input="${(e: Event) => (this._search = String((e.target as ZnInput).value ?? ''))}"></zn-input>
        <div class="palette__scroll">
          ${[...categories.entries()].map(([category, types]) => category
            ? html`
              <zn-collapsible class="palette__category" caption="${category}" default="open">
                ${types.map(t => this._renderPaletteItem(t))}
              </zn-collapsible>`
            : html`
              <div class="palette__uncategorized">${types.map(t => this._renderPaletteItem(t))}</div>`)}
        </div>
      </aside>`;
  }

  private _renderPaletteItem(type: PageSectionType) {
    return html`
      <zn-page-palette-item
        type="${type.type}"
        label="${type.label}"
        description="${ifDefined(type.description)}"
        icon="${ifDefined(type.icon)}"
        icon-library="${ifDefined(type.iconLibrary)}"
        color="${ifDefined(type.color)}"></zn-page-palette-item>`;
  }

  // Bottom-left of the canvas: flashes as each auto-save lands, otherwise
  // shows how long ago the last one happened.
  private _renderAutoSaveStatus() {
    if (this.autoSave === null || (!this._justSaved && this._lastSavedAt === null)) return '';
    const label = this._justSaved
      ? 'Auto-saved'
      : `Last saved ${timeAgo(Math.max(0, this._statusNow - (this._lastSavedAt ?? 0)))}`;
    return html`
      <div class="save-status ${this._justSaved ? 'save-status--saved' : ''}">
        <zn-icon src="${this._justSaved ? 'check@lu' : 'history@lu'}" size="14"></zn-icon>
        <span>${label}</span>
      </div>
    `;
  }

  // Offered when a loaded page differs from a fresh auto-saved draft.
  private _renderRestorePrompt() {
    if (!this._restorePrompt) return '';
    return html`
      <div class="restore-banner" @click="${(e: Event) => e.stopPropagation()}">
        <zn-icon src="history@lu" size="16"></zn-icon>
        <span>An auto-saved draft from ${timeAgo(Date.now() - this._restorePrompt.savedAt)} differs from this page.</span>
        <button class="restore-banner__restore" @click="${() => this.restoreAutoSave()}">Restore</button>
        <button class="restore-banner__dismiss" @click="${() => (this._restorePrompt = null)}">Dismiss</button>
      </div>
    `;
  }

  private _renderCanvas() {
    const sections = this._state.sections;
    return html`
      <div class="canvas-cell">
        <button
          type="button"
          class="panel-toggle panel-toggle--left ${this.paletteCollapsed ? 'panel-toggle--tucked' : ''}"
          title="${this.paletteCollapsed ? 'Show sections palette' : 'Hide sections palette'}"
          aria-label="${this.paletteCollapsed ? 'Show sections palette' : 'Hide sections palette'}"
          @click="${(e: Event) => {
            e.stopPropagation();
            this.paletteCollapsed = !this.paletteCollapsed;
          }}">
          <zn-icon src="${this.paletteCollapsed ? 'chevron-right@lu' : 'chevron-left@lu'}" size="16"></zn-icon>
        </button>
        ${this._selectedId ? html`
          <button
            type="button"
            class="panel-toggle panel-toggle--right ${this.inspectorCollapsed ? 'panel-toggle--tucked' : ''}"
            title="${this.inspectorCollapsed ? 'Show section settings' : 'Hide section settings'}"
            aria-label="${this.inspectorCollapsed ? 'Show section settings' : 'Hide section settings'}"
            @click="${(e: Event) => {
              e.stopPropagation();
              this.inspectorCollapsed = !this.inspectorCollapsed;
            }}">
            <zn-icon src="${this.inspectorCollapsed ? 'chevron-left@lu' : 'chevron-right@lu'}" size="16"></zn-icon>
          </button>` : ''}
        ${this._renderAutoSaveStatus()}
        ${this._renderRestorePrompt()}
        <main
          part="canvas"
          class="canvas"
          @click="${() => this._select(null)}"
          @dragover="${this._onCanvasDragOver}"
          @drop="${this._onCanvasDrop}">
          ${sections.length === 0 ? html`
            <div class="canvas__empty" ?hidden="${this._dragOverIndex !== null}">
              Drag sections here to build your page
            </div>` : ''}
          ${sections.map((section, i) => html`
            ${i === 0 && this._pinnedId !== null ? '' : this._renderDropZone(i)}
            ${this._renderCard(section, i)}
          `)}
          ${this._renderDropZone(sections.length)}
        </main>
      </div>`;
  }

  /** The one card template both the page list and slot cells render. */
  private _renderSectionCard(
    section: PageSection,
    drop: { over: (e: DragEvent) => void; drop: (e: DragEvent) => void },
    extraClass = ''
  ) {
    const type = this.registry.get(section.type);
    const pinned = this._isPinned(section.id);
    return html`
      <zn-page-section-card
        class="${extraClass}"
        draggable="${pinned ? 'false' : 'true'}"
        tabindex="0"
        label="${section.label ?? type?.label ?? section.type}"
        summary="${type ? sectionSummary(section, type) : `Unknown type "${section.type}"`}"
        icon="${ifDefined(type?.icon)}"
        icon-library="${ifDefined(type?.iconLibrary)}"
        color="${ifDefined(type?.color)}"
        ?selected="${this._selectedId === section.id}"
        ?unknown="${!type}"
        ?locked="${pinned}"
        @click="${(e: Event) => {
          e.stopPropagation();
          this._select(section.id);
        }}"
        @keydown="${(e: KeyboardEvent) => this._onCardKeydown(e, section.id)}"
        @dragstart="${(e: DragEvent) => this._onCardDragStart(e, section.id)}"
        @dragover="${drop.over}"
        @drop="${drop.drop}"
        @page-card-duplicate="${() => this._duplicateSection(section.id)}"
        @page-card-remove="${() => this._removeSection(section.id)}"></zn-page-section-card>`;
  }

  private _renderCard(section: PageSection, index: number) {
    return this._renderNode(section, {
      over: e => this._onZoneDragOver(e, index + 1),
      drop: e => this._onZoneDrop(e, index + 1),
    });
  }

  /**
   * A card, or — for a container — its card plus its own cell grid. Shared by the
   * top-level section list and container-cell stacks, so nesting renders at every level.
   */
  private _renderNode(
    section: PageSection,
    drop: { over: (e: DragEvent) => void; drop: (e: DragEvent) => void },
    extraClass = ''
  ): TemplateResult {
    const type = this.registry.get(section.type);
    const card = this._renderSectionCard(section, drop, extraClass);
    if (!isContainer(type)) return card;
    return html`
      <div class="container">
        ${card}
        ${this._renderCells(section, type)}
      </div>`;
  }

  /** A container's cell grid: one track per width, one stack per cell. */
  private _renderCells(container: PageSection, type: PageSectionType | undefined): TemplateResult {
    const widths = containerWidths(container, type);
    const cells = containerCells(container, type);
    const grow = containerGrow(container, type);
    // A growable container never persists a trailing empty row, so the extra
    // row of drop targets is added here at render time.
    const rendered = grow ? [...cells, ...Array.from({ length: widths.length }, () => [] as PageSection[])] : cells;
    return html`
      <div class="cells" style="grid-template-columns:${widths.map(w => `${w}fr`).join(' ')}">
        ${rendered.map((stack, cellIndex) => this._renderCell(container, stack, cellIndex))}
      </div>`;
  }

  private _renderCell(container: PageSection, stack: PageSection[], cellIndex: number): TemplateResult {
    const active = this._cellDragOver?.containerId === container.id
      && this._cellDragOver.cellIndex === cellIndex;
    const pickerOpen = this._cellPicker?.containerId === container.id
      && this._cellPicker.cellIndex === cellIndex;
    return html`
      <div
        class="cell ${active ? 'cell--active' : ''} ${stack.length ? '' : 'cell--empty'}"
        @dragover="${(e: DragEvent) => this._onCellDragOver(e, container.id, cellIndex, stack.length)}"
        @dragleave="${() => {
          if (this._cellDragOver?.containerId === container.id && this._cellDragOver.cellIndex === cellIndex) {
            this._cellDragOver = null;
          }
        }}"
        @drop="${(e: DragEvent) => this._onCellDrop(e, container.id, cellIndex, stack.length)}"
        @click="${(e: Event) => {
          e.stopPropagation();
          this._cellPicker = pickerOpen ? null : { containerId: container.id, cellIndex };
        }}">
        ${stack.map((child, i) => html`
          ${this._renderCellStrip(container, cellIndex, i)}
          ${this._renderNode(child, {
            over: e => this._onCellDragOver(e, container.id, cellIndex, i),
            drop: e => this._onCellDrop(e, container.id, cellIndex, i),
          }, 'cell__card')}
        `)}
        ${this._renderCellStrip(container, cellIndex, stack.length)}
        ${stack.length === 0 ? html`<zn-icon src="add" size="16"></zn-icon>` : ''}
        ${pickerOpen
          ? this._renderTypePicker(this._cellTypes(container), t => this.addSectionToCell(t, container.id, cellIndex))
          : ''}
      </div>`;
  }

  /** Thin insertion target between two cards in a stack. */
  private _renderCellStrip(container: PageSection, cellIndex: number, insertIndex: number) {
    const active = this._cellDragOver?.containerId === container.id
      && this._cellDragOver.cellIndex === cellIndex
      && this._cellDragOver.insertIndex === insertIndex;
    return html`
      <div
        class="cell__strip ${active ? 'cell__strip--active' : ''}"
        @dragover="${(e: DragEvent) => this._onCellDragOver(e, container.id, cellIndex, insertIndex)}"
        @drop="${(e: DragEvent) => this._onCellDrop(e, container.id, cellIndex, insertIndex)}"></div>`;
  }

  /** The one type-picker template both drop zones and container cells render. */
  private _renderTypePicker(types: PageSectionType[], pick: (type: string) => void) {
    return html`
      <div class="picker" @click="${(e: Event) => e.stopPropagation()}">
        ${types.map(type => html`
          <button
            type="button"
            class="picker__item"
            @click="${() => {
              this._pickerIndex = null;
              pick(type.type);
            }}">
            <zn-icon src="${type.icon ?? 'widgets'}" library="${ifDefined(type.iconLibrary)}" size="14"></zn-icon>
            ${type.label}
          </button>`)}
      </div>`;
  }

  private _renderDropZone(index: number) {
    return html`
      <div
        class="drop ${this._dragOverIndex === index ? 'drop--active' : ''} ${this._state.sections.length === 0 ? 'drop--solo' : ''}"
        @dragover="${(e: DragEvent) => this._onZoneDragOver(e, index)}"
        @dragleave="${() => {
          if (this._dragOverIndex === index) this._dragOverIndex = null;
        }}"
        @drop="${(e: DragEvent) => this._onZoneDrop(e, index)}">
        <button
          type="button"
          class="drop__add"
          title="Add section"
          @click="${(e: Event) => {
            e.stopPropagation();
            this._pickerIndex = this._pickerIndex === index ? null : index;
          }}">
          <zn-icon src="add" size="14"></zn-icon>
        </button>
        ${this._pickerIndex === index
          ? this._renderTypePicker(this.registry.all(), t => this.addSection(t, index))
          : ''}
      </div>`;
  }


  // --- Inspector --------------------------------------------------------------

  /**
   * Clones the selected type's config template into a live form and prefills each
   * `[name]` control from the section's data. The element is rendered directly by
   * Lit (`${this._form}`) so user-entered values survive unrelated re-renders.
   */
  private _buildInspectorForm() {
    this._form = null;
    const section = this._selectedSection();
    const type = section ? this.registry.get(section.type) : undefined;
    if (!section || !type?.configTemplate || type.renderConfig) return;

    const form = document.createElement('div');
    form.className = 'inspector__form';
    form.append(type.configTemplate.content.cloneNode(true));
    // Custom elements cloned out of a <template> are inert until they are
    // connected, so their accessors do not exist yet. Assigning `value` to one
    // would define an own property that permanently shadows the setter the
    // element defines on upgrade — Lit only replays properties it declares
    // reactive, so a hand-written `value` accessor (zn-icon-picker) would keep
    // its default and the control would render empty. Upgrade first.
    //
    // Toggles default to a stacked label, which reads badly in a narrow panel —
    // put the switch on the label's right unless the host asked for a position.
    // Set before the upgrade, while `label-position` can only be an authored
    // attribute and never one zn-toggle reflected from its own default.
    form.querySelectorAll<HTMLElement>('zn-toggle:not([label-position])').forEach(toggle => {
      toggle.setAttribute('label-position', 'left');
    });
    customElements.upgrade(form);
    form.querySelectorAll<HTMLElement>('[name]').forEach(control => {
      const name = control.getAttribute('name')!;
      const value = section.data[name];
      if (this._isBooleanControl(control, value)) {
        (control as HTMLInputElement).checked = Boolean(value);
      } else if (Array.isArray(value)) {
        // Multi-value controls (e.g. zn-select[multiple]) take the array as-is.
        (control as unknown as { value: unknown }).value = value;
      } else if (value !== undefined && value !== null) {
        (control as HTMLInputElement).value = String(value);
      }
    });
    // A content-free template stamps no controls — leave the form null so the
    // inspector shows its "no settings" hint rather than a blank gap.
    this._form = form.childElementCount ? form : null;
  }

  private _isBooleanControl(control: HTMLElement, value: unknown): boolean {
    return typeof value === 'boolean'
      || control.matches('zn-toggle, zn-checkbox, input[type="checkbox"]');
  }

  /** Handles change/input events bubbling from stamped form controls. */
  private _onInspectorInput = (e: Event) => {
    const section = this._selectedSection();
    if (!section) return;
    const control = e.target as HTMLElement & { value?: unknown; checked?: boolean };
    const name = control.getAttribute?.('name');
    if (!name) return;
    let value: unknown = this._isBooleanControl(control, section.data[name])
      ? Boolean(control.checked)
      : control.value;
    if (control.getAttribute('type') === 'number' && value !== '' && value !== null && value !== undefined) {
      value = Number(value);
    }
    if (typeof value === 'number' && Number.isNaN(value)) return;
    if (section.data[name] === value) return;
    this._updateSectionData(section.id, { [name]: value });
  };

  private _updateSectionData(id: string, patch: Record<string, unknown>) {
    this._pushHistory();
    this._commit({ sections: patchSection(this._state.sections, id, s => ({ ...s, data: { ...s.data, ...patch } })) });
  }

  private _renameSection(id: string, label: string) {
    this._pushHistory();
    this._commit({ sections: patchSection(this._state.sections, id, s => ({ ...s, label: label || undefined })) });
  }

  /** Replaces a container's layout, keeping cells consistent with it. */
  private _setLayout(
    id: string,
    next: (current: { widths: number[]; grow: boolean; cells: PageSection[][] }) => {
      widths: number[];
      grow: boolean;
      cells: PageSection[][];
    }
  ) {
    const container = findSection(this._state.sections, id);
    if (!container) return;
    const type = this.registry.get(container.type);
    const current = {
      widths: containerWidths(container, type),
      grow: containerGrow(container, type),
      cells: containerCells(container, type),
    };
    const { widths, grow, cells } = next(current);
    this._pushHistory();
    this._commit({
      sections: patchSection(this._state.sections, id, section => ({
        ...section,
        layout: { widths, grow },
        cells: normaliseCells(cells, widths.length, grow),
      })),
    });
  }

  private _setColumns(id: string, columns: number) {
    this._setLayout(id, current => {
      const count = Math.min(Math.max(Math.floor(columns) || 1, 1), MAX_COLUMNS);
      const widths = Array.from({ length: count }, (_, i) => current.widths[i] ?? 1);
      return { widths, grow: current.grow, cells: recolumnCells(current.cells, count) };
    });
  }

  private _setWidth(id: string, column: number, width: number) {
    const container = findSection(this._state.sections, id);
    if (!container) return;
    const columns = containerWidths(container, this.registry.get(container.type)).length;
    if (column < 0 || column >= columns) return;
    this._setLayout(id, current => {
      const widths = [...current.widths];
      widths[column] = Math.min(Math.max(Math.floor(width) || 1, 1), MAX_WIDTH);
      return { ...current, widths };
    });
  }

  private _setGrow(id: string, grow: boolean) {
    this._setLayout(id, current => ({ ...current, grow }));
  }

  /** Pads with empty rows, or trims trailing empty rows down to the last occupied one. */
  private _setRows(id: string, rows: number) {
    this._setLayout(id, current => {
      const columns = current.widths.length;
      const wanted = Math.max(Math.floor(rows) || 1, 1);
      const target = wanted * columns;
      const cells = trimTrailingEmptyCells(current.cells);
      while (cells.length < target) cells.push([]);
      return { ...current, cells };
    });
  }

  private _renderLayoutGroup(section: PageSection, type: PageSectionType | undefined) {
    if (!isContainer(type)) return '';
    const widths = containerWidths(section, type);
    const grow = containerGrow(section, type);
    const rows = containerCells(section, type).length / widths.length;
    return html`
      <div class="layout-group" @click="${(e: Event) => e.stopPropagation()}">
        <div class="layout-group__title">Layout</div>
        <zn-input
          class="layout-group__columns"
          type="number"
          label="Columns"
          min="1"
          max="${MAX_COLUMNS}"
          .value="${String(widths.length)}"
          @zn-change="${(e: Event) => this._setColumns(section.id, Number((e.target as ZnInput).value))}"></zn-input>
        <div class="layout-group__widths">
          <span class="layout-group__label">Widths</span>
          <div class="layout-group__weights">
            ${widths.map((width, column) => html`
              <zn-input
                type="number"
                min="1"
                max="${MAX_WIDTH}"
                aria-label="Column ${column + 1} width"
                .value="${String(width)}"
                @zn-change="${(e: Event) => this._setWidth(section.id, column, Number((e.target as ZnInput).value))}"></zn-input>`)}
          </div>
        </div>
        <zn-toggle
          label="Keep adding rows"
          label-position="left"
          description="Offers a new row as the last one fills."
          ?checked="${grow}"
          @zn-input="${(e: Event) => this._setGrow(section.id, Boolean((e.target as HTMLInputElement).checked))}"></zn-toggle>
        ${grow ? '' : html`
          <zn-input
            type="number"
            label="Rows"
            min="1"
            .value="${String(rows)}"
            @zn-change="${(e: Event) => this._setRows(section.id, Number((e.target as ZnInput).value))}"></zn-input>`}
      </div>`;
  }

  private _renderInspector() {
    const section = this._selectedSection();
    if (!section) return html``;
    const type = this.registry.get(section.type);
    const hasConfig = Boolean(type?.renderConfig) || this._form !== null;
    const title = section.label ?? type?.label ?? section.type;
    const typeLabel = type?.label ?? section.type;
    return html`
      <aside part="inspector" class="inspector">
        <div part="inspector-header" class="inspector-head">
          <span
            class="inspector-head__icon"
            style="--section-accent:${type?.color ?? 'rgb(var(--zn-color-primary))'}">
            <zn-icon src="${type?.icon ?? 'widgets'}" library="${ifDefined(type?.iconLibrary)}" size="18"></zn-icon>
          </span>
          <div class="inspector-head__text">
            <div class="inspector-head__title">${title}</div>
            ${title === typeLabel ? '' : html`
              <div class="inspector-head__type">${typeLabel}</div>`}
          </div>
          <button
            type="button"
            class="inspector-close"
            title="Close section settings"
            aria-label="Close section settings"
            @click="${() => this._select(null)}">
            <zn-icon src="x@lu" size="18"></zn-icon>
          </button>
        </div>
        <div
          part="inspector-body"
          class="inspector-body"
          @change="${this._onInspectorInput}"
          @zn-change="${this._onInspectorInput}"
          @input="${this._onInspectorInput}"
          @zn-input="${this._onInspectorInput}">
          ${this._renderLayoutGroup(section, type)}
          <zn-input
            class="inspector__rename"
            label="Section name"
            .value="${section.label ?? type?.label ?? ''}"
            @zn-change="${(e: Event) => this._renameSection(section.id, String((e.target as ZnInput).value ?? ''))}"></zn-input>
          ${type?.renderConfig
            ? type.renderConfig(section, data => this._updateSectionData(section.id, data))
            : this._form}
          ${hasConfig ? '' : html`
            <p class="inspector-hint">This section type has no settings.</p>`}
        </div>
      </aside>`;
  }

  render() {
    const hasHeader = this._hasSlot.test('header-left') || this._hasSlot.test('header-right');
    return html`
      <div
        part="base"
        class="builder ${this._selectedId ? 'builder--inspecting' : ''} ${this.paletteCollapsed ? 'builder--palette-collapsed' : ''} ${this.inspectorCollapsed ? 'builder--inspector-collapsed' : ''}"
        @dragend="${() => {
          this._dragOverIndex = null;
          this._cellDragOver = null;
          this._draggingId = null;
        }}">
        <header part="header" class="header" ?hidden="${!hasHeader}">
          <div class="header__group">
            <slot name="header-left"></slot>
          </div>
          <div class="header__group">
            <slot name="header-right"></slot>
          </div>
        </header>
        ${this._renderPalette()}
        ${this._renderCanvas()}
        ${this._renderInspector()}
        <slot name="config" class="declarations" @slotchange="${this._registerSlottedTemplates}"></slot>
      </div>
    `;
  }
}
