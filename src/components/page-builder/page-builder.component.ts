import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {
  emptyPageState,
  generateSectionId,
  PAGE_SECTION_MIME,
  PAGE_TYPE_MIME,
  type PageSection,
  type PageSectionType,
  type PageState,
  sectionChildren,
  sectionSummary,
} from './page.types';
import {HasSlotController} from '../../internal/slot';
import {ifDefined} from 'lit/directives/if-defined.js';
import {PageSectionRegistry} from './page-registry';
import {property, state} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import ZnCollapsible from '../collapsible';
import ZnIcon from '../icon';
import ZnInput from '../input';
import ZnPagePaletteItem from './modules/page-palette-item';
import ZnPageSectionCard from './modules/page-section-card';

import styles from './page-builder.scss';

const HISTORY_LIMIT = 50;
/** Sections beyond this are dropped (with a warning) when external state is applied. */
const MAX_SECTIONS = 500;
/** Per-container children beyond this are dropped when external state is applied. */
const MAX_CHILDREN = 24;
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
 *   (type, label, icon, icon-library, color, category, description, slots, accepts) declare a
 *   palette entry and its content declares the inspector form for that type. `slots` makes the
 *   section a container with that many child slots; `accepts` is a comma-separated list of the
 *   type keys its slots allow.
 * @slot header-left - Actions shown on the left of the header bar.
 * @slot header-right - Actions shown on the right of the header bar.
 *
 * @csspart base - The grid wrapper.
 * @csspart header - The full-width header action bar (only rendered when header slots are filled).
 * @csspart palette - The left palette panel.
 * @csspart canvas - The centre section-card canvas.
 * @csspart inspector - The right panel while a section is selected.
 */
export default class ZnPageBuilder extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-collapsible': ZnCollapsible,
    'zn-icon': ZnIcon,
    'zn-input': ZnInput,
    'zn-page-palette-item': ZnPagePaletteItem,
    'zn-page-section-card': ZnPageSectionCard,
  };

  /** The page state as a JSON string. Parsed on set; invalid JSON is ignored with a warning. */
  @property() config = '';

  @property({reflect: true}) heading = '';
  @property({reflect: true}) subheading = '';

  /** Section types to make available, registered into the internal registry. */
  @property({attribute: false}) sectionTypes: PageSectionType[] = [];

  /** Collapses the left palette. Auto-set when the builder becomes narrow. */
  @property({type: Boolean, reflect: true, attribute: 'palette-collapsed'}) paletteCollapsed = false;

  /** Collapses the inspector while a section is selected. */
  @property({type: Boolean, reflect: true, attribute: 'inspector-collapsed'}) inspectorCollapsed = false;

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
  /** The container slot a drag is currently over, if any. */
  @state() private _slotDragOver: {containerId: string; index: number} | null = null;
  /** The container slot whose "+" type picker is open, if any. */
  @state() private _slotPicker: {containerId: string; index: number} | null = null;
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

  @watch('config')
  handleConfigChange() {
    if (!this.config) return;
    try {
      this._applyExternalState(JSON.parse(this.config) as PageState);
    } catch {
      console.warn('<zn-page-builder> invalid config JSON');
    }
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
  @state() private _restorePrompt: {savedAt: number} | null = null;

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
    if (!this._state.sections.length) return;
    try {
      localStorage.setItem(this._autoSaveKey, JSON.stringify({savedAt: Date.now(), state: this._state}));
      this._lastSavedAt = Date.now();
      this._justSaved = true;
      if (this._justSavedTimer !== null) clearTimeout(this._justSavedTimer);
      this._justSavedTimer = window.setTimeout(() => (this._justSaved = false), 2500);
    } catch {
      /* storage unavailable / full */
    }
  };

  /** The stored auto-save, purging it when past its TTL (or unreadable). */
  private _readAutoSave(): {savedAt: number; state: PageState} | null {
    try {
      const raw = localStorage.getItem(this._autoSaveKey);
      if (!raw) return null;
      const saved = JSON.parse(raw) as {savedAt: number; state: PageState};
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
      ? {savedAt: saved.savedAt}
      : null;
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('_selectedId')) this._buildInspectorForm();
    if (changed.has('autoSave')) this._restartAutoSave();
  }

  // --- Slotted templates define section types --------------------------------

  private _typeFromTemplate(el: HTMLTemplateElement): PageSectionType | null {
    const type = el.getAttribute('type');
    if (!type) return null;
    const slots = parseInt(el.getAttribute('slots') ?? '', 10);
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
    const seen = new Set<string>();
    let clippedChildren = false;
    // Nesting is one level deep by design — grandchildren in malformed input are
    // dropped, which also bounds the recursion. Duplicate ids get regenerated so
    // selection/patching can never target two sections at once, and children are
    // capped (slots are single-digit by design; MAX_SECTIONS alone would still
    // admit one section with a huge children array).
    const normalise = (s: PageSection, depth: number): PageSection => {
      const id = !s.id || seen.has(s.id) ? generateSectionId() : s.id;
      seen.add(id);
      if (depth === 0 && (s.children?.length ?? 0) > MAX_CHILDREN) clippedChildren = true;
      return {
        id,
        type: s.type,
        label: s.label,
        data: structuredClone(s.data ?? {}),
        ...(s.children && depth === 0
          ? {children: s.children.slice(0, MAX_CHILDREN).map(c => (c && typeof c.type === 'string' ? normalise(c, depth + 1) : null))}
          : {}),
      };
    };
    const incoming = (next?.sections ?? []).filter(s => s && typeof s.type === 'string');
    if (incoming.length > MAX_SECTIONS) {
      console.warn(`<zn-page-builder> config has ${incoming.length} sections; keeping the first ${MAX_SECTIONS}`);
    }
    const sections = incoming.slice(0, MAX_SECTIONS).map(s => normalise(s, 0));
    if (clippedChildren) {
      console.warn(`<zn-page-builder> some sections had more than ${MAX_CHILDREN} children; extras were dropped`);
    }
    this._history = [];
    this._redoStack = [];
    this._state = {sections};
    this._selectedId = null;
    this._pickerIndex = null;
    this._offerRestoreIfNewer();
  }

  /** Finds a section by id, searching top-level sections and slotted children. */
  private _findSection(id: string | null): PageSection | undefined {
    if (!id) return undefined;
    for (const s of this._state.sections) {
      if (s.id === id) return s;
      const child = s.children?.find(c => c?.id === id);
      if (child) return child;
    }
    return undefined;
  }

  /** New sections array with the section patched wherever it lives (top level or slot). */
  private _patchSection(id: string, patch: (s: PageSection) => PageSection): PageSection[] {
    return this._state.sections.map(s => {
      if (s.id === id) return patch(s);
      if (s.children?.some(c => c?.id === id)) {
        return {...s, children: s.children.map(c => (c?.id === id ? patch(c) : c))};
      }
      return s;
    });
  }

  /** Detaches a section wherever it lives: removed from the top level, or its slot nulled. */
  private _extract(id: string): [PageSection | undefined, PageSection[]] {
    let removed: PageSection | undefined;
    const sections: PageSection[] = [];
    for (const s of this._state.sections) {
      if (s.id === id) {
        removed = s;
        continue;
      }
      const slot = s.children?.findIndex(c => c?.id === id) ?? -1;
      if (slot !== -1) {
        removed = s.children![slot] ?? undefined;
        sections.push({...s, children: s.children!.map((c, i) => (i === slot ? null : c))});
      } else {
        sections.push(s);
      }
    }
    return [removed, sections];
  }

  /** Installs a new state from a user edit and notifies listeners. */
  private _commit(next: PageState) {
    this._state = next;
    this.emit('zn-page-change', {detail: {state: this.state}});
  }

  private _selectedSection(): PageSection | undefined {
    return this._findSection(this._selectedId);
  }

  private _select(id: string | null) {
    if (this._selectedId === id) return;
    this._selectedId = id;
    this._pickerIndex = null;
    this._slotPicker = null;
    this.emit('zn-page-selection-change', {detail: {sectionId: id}});
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

  /** Adds a section of a registered type at `index` (default: end). Returns null for unknown types. */
  addSection(type: string, index?: number): PageSection | null {
    if (!this.registry.has(type)) return null;
    this._pushHistory();
    const section: PageSection = {id: generateSectionId(), type, data: {}};
    const sections = [...this._state.sections];
    sections.splice(index ?? sections.length, 0, section);
    this._commit({sections});
    this._select(section.id);
    return section;
  }

  /** Adds a new section of a registered type into a container's slot. Returns null if not allowed. */
  addSectionToSlot(type: string, containerId: string, slotIndex: number): PageSection | null {
    const sectionType = this.registry.get(type);
    const container = this._findSection(containerId);
    const containerType = container ? this.registry.get(container.type) : undefined;
    if (!sectionType || sectionType.slots || !container || !containerType?.slots) return null;
    if (slotIndex < 0 || slotIndex >= containerType.slots) return null;
    if (containerType.accepts && !containerType.accepts.includes(type)) return null;
    const children = sectionChildren(container, containerType);
    if (children[slotIndex]) return null;
    const section: PageSection = {id: generateSectionId(), type, data: {}};
    children[slotIndex] = section;
    this._pushHistory();
    this._commit({sections: this._patchSection(containerId, s => ({...s, children}))});
    this._select(section.id);
    return section;
  }

  private _removeSection(id: string) {
    const [removed, sections] = this._extract(id);
    if (!removed) return;
    this._pushHistory();
    // Clear selection for the removed section AND anything inside it.
    if (this._selectedId === id || removed.children?.some(c => c?.id === this._selectedId)) {
      this._select(null);
    }
    this._commit({sections});
  }

  private _duplicateSection(id: string) {
    const index = this._state.sections.findIndex(s => s.id === id);
    if (index !== -1) {
      this._pushHistory();
      const copy = structuredClone(this._state.sections[index]);
      copy.id = generateSectionId();
      copy.children = copy.children?.map(c => (c ? {...c, id: generateSectionId()} : null));
      const sections = [...this._state.sections];
      sections.splice(index + 1, 0, copy);
      this._commit({sections});
      this._select(copy.id);
      return;
    }
    // A slotted child duplicates into its container's next empty slot, if any.
    for (const s of this._state.sections) {
      const slot = s.children?.findIndex(c => c?.id === id) ?? -1;
      if (slot === -1) continue;
      const type = this.registry.get(s.type);
      if (!type?.slots) return;
      const children = sectionChildren(s, type);
      const empty = children.findIndex(c => !c);
      if (empty === -1) return;
      const copy = structuredClone(children[slot]!);
      copy.id = generateSectionId();
      children[empty] = copy;
      this._pushHistory();
      this._commit({sections: this._patchSection(s.id, x => ({...x, children}))});
      this._select(copy.id);
      return;
    }
  }

  /** Moves a section (top-level or slotted) to a top-level position. */
  private _moveSection(id: string, index: number) {
    const from = this._state.sections.findIndex(s => s.id === id);
    if (from !== -1) {
      const to = index > from ? index - 1 : index;
      if (to === from) return;
      this._pushHistory();
      const sections = [...this._state.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      this._commit({sections});
      return;
    }
    const [moved, sections] = this._extract(id);
    if (!moved) return;
    this._pushHistory();
    sections.splice(index, 0, moved);
    this._commit({sections});
  }

  /**
   * Moves a section into a container's slot. Dropping onto an occupied slot swaps
   * the two children (slot-to-slot reordering); top-level sections and containers
   * only enter empty slots / never enter slots respectively.
   */
  private _moveToSlot(id: string, containerId: string, slotIndex: number) {
    const moved = this._findSection(id);
    const container = this._findSection(containerId);
    const containerType = container ? this.registry.get(container.type) : undefined;
    if (!moved || !container || !containerType?.slots || id === containerId) return;
    if (this.registry.get(moved.type)?.slots) return; // no containers inside slots
    if (containerType.accepts && !containerType.accepts.includes(moved.type)) return;
    if (slotIndex < 0 || slotIndex >= containerType.slots) return;

    const target = container.children?.[slotIndex] ?? null;
    if (target?.id === id) return;
    const fromTop = this._state.sections.some(s => s.id === id);
    if (target && fromTop) return; // top-level sections only drop on empty slots

    this._pushHistory();
    const sections = structuredClone(this._state.sections);
    const containerRef = sections.find(s => s.id === containerId)!;
    containerRef.children = Array.from({length: containerType.slots}, (_, i) => containerRef.children?.[i] ?? null);
    const movedCopy = structuredClone(moved);

    if (fromTop) {
      sections.splice(sections.findIndex(s => s.id === id), 1);
    } else {
      // Swap: the occupant (or null) takes the source slot.
      for (const s of sections) {
        const slot = s.children?.findIndex(c => c?.id === id) ?? -1;
        if (slot !== -1) {
          s.children![slot] = target ? structuredClone(target) : null;
          break;
        }
      }
    }
    containerRef.children[slotIndex] = movedCopy;
    this._commit({sections});
  }

  // --- Canvas drag & drop -----------------------------------------------------

  private _onCardDragStart(e: DragEvent, id: string) {
    if (!e.dataTransfer) return;
    e.stopPropagation(); // a child card's drag must not also start its container's
    e.dataTransfer.setData(PAGE_SECTION_MIME, id);
    e.dataTransfer.effectAllowed = 'move';
  }

  /** Whether a drag carries one of the builder's own payloads. */
  private _isPageDrag(e: DragEvent): boolean {
    const types = e.dataTransfer ? Array.from(e.dataTransfer.types) : [];
    return types.includes(PAGE_TYPE_MIME) || types.includes(PAGE_SECTION_MIME);
  }

  private _onSlotDragOver(e: DragEvent, containerId: string, index: number) {
    if (!this._isPageDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    this._dragOverIndex = null;
    this._slotDragOver = {containerId, index};
  }

  private _onSlotDrop(e: DragEvent, containerId: string, index: number) {
    e.preventDefault();
    e.stopPropagation();
    this._slotDragOver = null;
    const typeKey = e.dataTransfer?.getData(PAGE_TYPE_MIME);
    const sectionId = e.dataTransfer?.getData(PAGE_SECTION_MIME);
    if (typeKey) this.addSectionToSlot(typeKey, containerId, index);
    else if (sectionId) this._moveToSlot(sectionId, containerId, index);
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
      const matches = query ? types.filter(t=>t.label.toLowerCase().includes(query)) : types;
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
          @zn-input="${(e: Event)=>(this._search = String((e.target as ZnInput).value ?? ''))}"></zn-input>
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
          ${this._renderDropZone(i)}
          ${this._renderCard(section, i)}
        `)}
          ${this._renderDropZone(sections.length)}
        </main>
      </div>`;
  }

  /** The one card template both the page list and slot cells render. */
  private _renderSectionCard(
    section: PageSection,
    drop: {over: (e: DragEvent) => void; drop: (e: DragEvent) => void},
    extraClass = ''
  ) {
    const type = this.registry.get(section.type);
    return html`
      <zn-page-section-card
        class="${extraClass}"
        draggable="true"
        tabindex="0"
        label="${section.label ?? type?.label ?? section.type}"
        summary="${type ? sectionSummary(section, type) : `Unknown type "${section.type}"`}"
        icon="${ifDefined(type?.icon)}"
        icon-library="${ifDefined(type?.iconLibrary)}"
        color="${ifDefined(type?.color)}"
        ?selected="${this._selectedId === section.id}"
        ?unknown="${!type}"
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
    const type = this.registry.get(section.type);
    const card = this._renderSectionCard(section, {
      over: e => this._onZoneDragOver(e, index + 1),
      drop: e => this._onZoneDrop(e, index + 1),
    });
    if (!type?.slots) return card;
    return html`
      <div class="container">
        ${card}
        <div class="slots">
          ${sectionChildren(section, type).map((child, i) => this._renderSlot(section, child, i))}
        </div>
      </div>`;
  }

  private _renderSlot(container: PageSection, child: PageSection | null, index: number) {
    if (child) {
      return this._renderSectionCard(child, {
        over: e => this._onSlotDragOver(e, container.id, index),
        drop: e => this._onSlotDrop(e, container.id, index),
      }, 'slot__card');
    }
    const active = this._slotDragOver?.containerId === container.id && this._slotDragOver.index === index;
    const pickerOpen = this._slotPicker?.containerId === container.id && this._slotPicker.index === index;
    return html`
      <div
        class="slot slot--empty ${active ? 'slot--active' : ''}"
        @dragover="${(e: DragEvent) => this._onSlotDragOver(e, container.id, index)}"
        @dragleave="${() => {
          if (this._slotDragOver?.containerId === container.id && this._slotDragOver.index === index) {
            this._slotDragOver = null;
          }
        }}"
        @drop="${(e: DragEvent) => this._onSlotDrop(e, container.id, index)}"
        @click="${(e: Event) => {
          e.stopPropagation();
          this._slotPicker = pickerOpen ? null : {containerId: container.id, index};
        }}">
        <zn-icon src="add" size="16"></zn-icon>
        ${pickerOpen
          ? this._renderTypePicker(this._slotTypes(container), t => this.addSectionToSlot(t, container.id, index))
          : ''}
      </div>`;
  }

  /** Types allowed in a container's slots: non-containers, filtered by its accepts list. */
  private _slotTypes(container: PageSection): PageSectionType[] {
    const containerType = this.registry.get(container.type);
    return this.registry.all().filter(t =>
      !t.slots && (!containerType?.accepts || containerType.accepts.includes(t.type)));
  }

  /** The one type-picker template both drop zones and slot cells render. */
  private _renderTypePicker(types: PageSectionType[], pick: (type: string) => void) {
    return html`
      <div class="picker" @click="${(e: Event) => e.stopPropagation()}">
        ${types.map(type => html`
          <button
            type="button"
            class="picker__item"
            @click="${() => {
              this._pickerIndex = null;
              this._slotPicker = null;
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
    form.querySelectorAll<HTMLElement>('[name]').forEach(control => {
      const name = control.getAttribute('name')!;
      const value = section.data[name];
      if (this._isBooleanControl(control, value)) {
        (control as HTMLInputElement).checked = Boolean(value);
      } else if (Array.isArray(value)) {
        // Multi-value controls (e.g. zn-select[multiple]) take the array as-is.
        (control as unknown as {value: unknown}).value = value;
      } else if (value !== undefined && value !== null) {
        (control as HTMLInputElement).value = String(value);
      }
    });
    this._form = form;
  }

  private _isBooleanControl(control: HTMLElement, value: unknown): boolean {
    return typeof value === 'boolean'
      || control.matches('zn-toggle, zn-checkbox, input[type="checkbox"]');
  }

  /** Handles change/input events bubbling from stamped form controls. */
  private _onInspectorInput = (e: Event) => {
    const section = this._selectedSection();
    if (!section) return;
    const control = e.target as HTMLElement & {value?: unknown; checked?: boolean};
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
    this._updateSectionData(section.id, {[name]: value});
  };

  private _updateSectionData(id: string, patch: Record<string, unknown>) {
    this._pushHistory();
    this._commit({sections: this._patchSection(id, s => ({...s, data: {...s.data, ...patch}}))});
  }

  private _renameSection(id: string, label: string) {
    this._pushHistory();
    this._commit({sections: this._patchSection(id, s => ({...s, label: label || undefined}))});
  }

  private _renderInspector() {
    const section = this._selectedSection();
    if (!section) return html``;
    const type = this.registry.get(section.type);
    return html`
      <aside part="inspector" class="inspector">
        <zn-input
          class="inspector__rename"
          label="Section name"
          .value="${section.label ?? type?.label ?? ''}"
          @zn-change="${(e: Event) => this._renameSection(section.id, String((e.target as ZnInput).value ?? ''))}"></zn-input>
        <div
          class="inspector__body"
          @change="${this._onInspectorInput}"
          @zn-change="${this._onInspectorInput}"
          @input="${this._onInspectorInput}"
          @zn-input="${this._onInspectorInput}">
          ${type?.renderConfig
            ? type.renderConfig(section, data => this._updateSectionData(section.id, data))
            : this._form}
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
          this._slotDragOver = null;
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
