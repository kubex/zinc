import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {guard} from 'lit/directives/guard.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnFlowBranchConditions from './modules/flow-branch-conditions';
import ZnFlowCanvas from './modules/flow-canvas';
import ZnFlowStepGroup from './modules/flow-step-group';
import ZnIcon from '../icon';
import ZnInput from '../input';
import ZnNavbar from '../navbar';
import ZnTabs from '../tabs';

import {
  branchConditions,
  branchDropXs,
  cardCollides,
  DEFAULT_OUTPUT,
  descendantIds,
  emptyDragImage,
  emptyFlowState,
  firstInputId,
  FLOW_TYPE_MIME,
  type FlowBranchConditions,
  type FlowBranchFilter,
  type FlowConnection,
  type FlowFilterField,
  type FlowFilterOption,
  type FlowGroup,
  type FlowNodeInstance,
  type FlowNodeType,
  type FlowPort,
  type FlowState,
  GRID_SIZE,
  loopConnections,
  NEW_OUTPUT_PORT,
  NODE_HEIGHT,
  NODE_WIDTH,
  nodeInputs,
  nodeOutputs,
  pillsCollide,
  snapToGrid,
  typeInputs,
  typeOutputs,
} from './flow.types';
import {FlowRegistry} from './flow-registry';
import {HasSlotController} from '../../internal/slot';
import {LAYOUT_V_GAP, untangledPositions} from './flow-layout';

import styles from './flow-builder.scss';

const HISTORY_LIMIT = 50;
const TYPE_MIME = FLOW_TYPE_MIME;

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

const TABS: { group: FlowGroup; label: string }[] = [
  {group: 'entrypoint', label: 'Entrypoint'},
  {group: 'trigger', label: 'Triggers'},
  {group: 'action', label: 'Actions'},
  {group: 'rule', label: 'Rules'},
];

interface PickerTarget { kind: 'wire'; connectionId: string }

/**
 * @summary A drag-and-drop visual flow builder: steps panel, pan/zoom canvas, and a config inspector.
 * @documentation https://zinc.style/components/flow-builder
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 * @dependency zn-input
 * @dependency zn-tabs
 * @dependency zn-navbar
 * @dependency zn-flow-branch-conditions
 * @dependency zn-flow-canvas
 * @dependency zn-flow-node
 *
 * @event zn-flow-change - Emitted whenever the flow state changes. `event.detail.state` is the new FlowState.
 * @event zn-flow-selection-change - Emitted when the selected node changes. `event.detail.nodeId`.
 * @event zn-flow-connect - Emitted when a connection is created. `event.detail.connection`.
 *
 * @slot - `<zn-flow-step>` type declarations; never displayed, each `group`/`category` routes the
 *   step into the right tab and collapsible grouping of the rendered panel. A step may nest
 *   `<zn-flow-filter>` declarations (each holding `<zn-flow-filter-field>`s, whose operator /
 *   option choices are nested `<zn-flow-operator>` / `<zn-flow-option>` elements) — or set a
 *   `branch-filters` JSON attribute — to drive the built-in branch conditions editor.
 * @slot header-left - Actions shown on the left of the header bar (e.g. Close / Undo All Changes).
 * @slot header-right - Actions shown on the right of the header bar (e.g. Apply Changes).
 * @slot sidebar - Extra right-panel content (status, version history), below the configuration errors.
 *
 * @csspart base - The grid wrapper.
 * @csspart header - The full-width header action bar (only rendered when header slots are filled).
 * @csspart steps - The left steps panel.
 * @csspart inspector - The right panel while a node or branch is selected.
 */
export default class ZnFlowBuilder extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-input': ZnInput,
    'zn-tabs': ZnTabs,
    'zn-navbar': ZnNavbar,
    'zn-flow-branch-conditions': ZnFlowBranchConditions,
    'zn-flow-canvas': ZnFlowCanvas,
    'zn-flow-step-group': ZnFlowStepGroup,
  };

  /** Node types to make available, registered into the internal registry. */
  @property({attribute: false}) nodeTypes: FlowNodeType[] = [];

  @property({reflect: true}) heading = '';
  @property({attribute: 'subheading', reflect: true}) subheading = '';

  /** Node ids flagged as having configuration errors (drives the red node styling). */
  @property({attribute: false}) errorNodes: string[] = [];

  /**
   * Auto-save the flow to localStorage (1-day TTL). Omit to disable. A bare
   * `auto-save` saves every 5 minutes; a numeric value sets the interval in
   * minutes (`auto-save="5"`). Restore with `restoreAutoSave()`.
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

  /** Optional hint shown beneath each steps-panel tab. */
  @property({attribute: 'entrypoints-hint'}) entrypointsHint = '';
  @property({attribute: 'triggers-hint'}) triggersHint = '';
  @property({attribute: 'actions-hint'}) actionsHint = '';
  @property({attribute: 'rules-hint'}) rulesHint = '';

  private registry = new FlowRegistry();

  @state() private _state: FlowState = emptyFlowState();
  @state() private _selectedNodeId: string | null = null;
  /** The output branch open in the branch editor, if any. */
  @state() private _selectedBranch: { nodeId: string; port: string } | null = null;
  @state() private _search = '';
  /** The steps-panel tab currently shown; the search only filters this tab. */
  @state() private _activeGroup: FlowGroup | null = null;

  private readonly _hasSlot = new HasSlotController(this, 'header-left', 'header-right');
  /** Side panels tucked away via their edge chevrons. */
  @state() private _stepsCollapsed = false;
  @state() private _sideCollapsed = false;
  /** The node being relocated via the MOVE menu action, if any. */
  @state() private _movingNodeId: string | null = null;
  /** The "+" picker popover target (an open output, or a wire to insert into), if open. */
  @state() private _picker: { x: number; y: number; target: PickerTarget } | null = null;
  /** The node type currently being dragged from the steps panel, for the canvas drop preview. */
  @state() private _draggingType: string | null = null;

  private _history: FlowState[] = [];
  private _redo: FlowState[] = [];
  private _seq = 0;
  private _untangleRaf: number | null = null;
  /** Applies the in-flight untangle's final positions; used when it's cut short. */
  private _untangleSettle: (() => void) | null = null;
  /**
   * Bumped whenever the state is replaced wholesale (undo / redo / setState) so the
   * guarded renderConfig / renderBranchConfig bodies rebuild against the fresh node
   * objects. Value edits don't bump it — the consumer's config DOM stays in place,
   * which is what lets its inputs commit live without losing focus.
   */
  private _configRevision = 0;

  private get _listeners(): [string, EventListener][] {
    return [
      ['flow-node-select', this._onSelect as EventListener],
      ['flow-node-action', this._onNodeAction as EventListener],
      ['flow-interaction-start', this._onInteractionStart as EventListener],
      ['flow-change-commit', this._commit as EventListener],
      ['flow-output-assign', this._onOutputAssign as EventListener],
      ['flow-link-assign', this._onLinkAssign as EventListener],
      ['flow-output-move-target', this._onOutputMoveTarget as EventListener],
      ['flow-wire-pick', this._onWirePick as EventListener],
      ['flow-wire-assign', this._onWireAssign as EventListener],
      ['flow-branch-pick', this._onBranchPick as EventListener],
      ['flow-branch-delete', this._onBranchDelete as EventListener],
      ['flow-step-drag', this._onStepDrag as EventListener],
      ['flow-step-drag-end', this._onDragEnd as EventListener],
      ['flow-undo', this.undo as EventListener],
      ['flow-redo', this.redo as EventListener],
      ['flow-untangle', this.untangle as EventListener],
      ['flow-add-note', this._onAddNote as EventListener],
      ['flow-note-change', this._onNoteChange as EventListener],
      ['flow-note-delete', this._onNoteDelete as EventListener],
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._listeners.forEach(([name, fn]) => this.addEventListener(name, fn));
    document.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    this._listeners.forEach(([name, fn]) => this.removeEventListener(name, fn));
    document.removeEventListener('keydown', this._onKeyDown);
    this._cancelUntangle();
    this._stopAutoSave();
    if (this._justSavedTimer !== null) {
      clearTimeout(this._justSavedTimer);
      this._justSavedTimer = null;
    }
    super.disconnectedCallback();
  }

  // --- Auto-save --------------------------------------------------------------

  private _autoSaveTimer: number | null = null;
  private _statusTimer: number | null = null;
  private _justSavedTimer: number | null = null;
  /** Guards the restore prompt from re-triggering on restoreAutoSave's own setState. */
  private _restoring = false;

  /** Epoch of the newest auto-save (also picked up from storage on start). */
  @state() private _lastSavedAt: number | null = null;
  /** Briefly true right after a save — flashes "Auto-saved" in the status pill. */
  @state() private _justSaved = false;
  /** Re-render clock for the "last saved Xm ago" label. */
  @state() private _statusNow = Date.now();
  /** A fresh auto-save differing from the loaded flow — offer to restore it. */
  @state() private _restorePrompt: { savedAt: number } | null = null;

  /** localStorage key for this builder's auto-saves — its id, else its heading. */
  private get _autoSaveKey(): string {
    return `zn-flow-builder:${this.id || this.heading || 'flow'}`;
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

  /** An empty canvas is never saved — it would clobber a stored flow with nothing. */
  private _autoSaveTick = () => {
    // While a restore is being offered, the stored draft is the user's only
    // copy — never overwrite it until they've decided.
    if (this._restorePrompt) return;
    const state = this.getState();
    if (!state.nodes.length && !state.connections.length && !state.notes.length) return;
    try {
      localStorage.setItem(this._autoSaveKey, JSON.stringify({savedAt: Date.now(), state}));
      this._lastSavedAt = Date.now();
      this._justSaved = true;
      if (this._justSavedTimer !== null) clearTimeout(this._justSavedTimer);
      this._justSavedTimer = window.setTimeout(() => (this._justSaved = false), 2500);
    } catch {
      /* storage unavailable / full */
    }
  };

  /** The stored auto-save, purging it when past its TTL (or unreadable). */
  private _readAutoSave(): { savedAt: number; state: FlowState } | null {
    try {
      const raw = localStorage.getItem(this._autoSaveKey);
      if (!raw) return null;
      const saved = JSON.parse(raw) as { savedAt: number; state: FlowState };
      if (!saved.state || Date.now() - saved.savedAt > AUTO_SAVE_TTL_MS) {
        localStorage.removeItem(this._autoSaveKey);
        return null;
      }
      return saved;
    } catch {
      return null;
    }
  }

  /** Load the auto-saved flow, if one exists within the 1-day TTL. */
  restoreAutoSave(): boolean {
    const saved = this._readAutoSave();
    if (!saved) return false;
    this._restoring = true;
    try {
      this.setState(saved.state);
    } finally {
      this._restoring = false;
    }
    this._restorePrompt = null;
    return true;
  }

  /**
   * A flow was just loaded — when a fresh auto-save differs from it, ask the
   * user whether to pick up their draft instead.
   */
  private _offerRestoreIfNewer() {
    if (this.autoSave === null || this._restoring) return;
    const saved = this._readAutoSave();
    this._restorePrompt = saved && JSON.stringify(saved.state) !== JSON.stringify(this._state)
      ? {savedAt: saved.savedAt}
      : null;
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && (this._movingNodeId || this._picker || this._selectedBranch)) {
      this._movingNodeId = null;
      this._picker = null;
      this._selectedBranch = null;
    }
  };

  protected willUpdate(changed: PropertyValues) {
    if (changed.has('nodeTypes') && this.nodeTypes?.length) {
      this.registry.registerAll(this.nodeTypes);
    }
    if (changed.has('autoSave')) {
      this._restartAutoSave();
    }
    super.willUpdate(changed);
  }

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this._registerSlottedTypes();
  }

  // --- Slotted steps define node types -------------------------------

  private static _parsePorts(attr: string | null): FlowPort[] | undefined {
    if (attr === null) return undefined; // omitted → use the default
    const trimmed = attr.trim();
    if (trimmed === '') return []; // present but empty → no ports
    try {
      // A JSON array of port ids ("a") and/or port objects ({id, label}).
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed)) return undefined;
      return parsed.map(p => (typeof p === 'string' ? {id: p} : (p as FlowPort)));
    } catch {
      return undefined;
    }
  }

  /** Parse an operator / option list: a JSON array (strings or `{value,label}`) or comma-separated values. */
  private static _parseFilterOptions(attr: string | null): FlowFilterOption[] | undefined {
    if (attr === null) return undefined;
    const trimmed = attr.trim();
    if (trimmed === '') return undefined;
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (!Array.isArray(parsed)) return undefined;
        return parsed.map(o => (typeof o === 'string' ? {value: o} : (o as FlowFilterOption)));
      } catch {
        return undefined;
      }
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean).map(value => ({value}));
  }

  /**
   * Option list declared as child elements — the tidy form. The element's text
   * is the label; a `value` attribute overrides the stored value:
   * `<zn-flow-operator value="gte">at least</zn-flow-operator>`.
   */
  private static _nestedFilterOptions(el: Element, tag: string): FlowFilterOption[] | undefined {
    const els = Array.from(el.querySelectorAll(`:scope > ${tag}`));
    if (!els.length) return undefined;
    return els.map(o => {
      const text = o.textContent?.trim() ?? '';
      const value = o.getAttribute('value');
      return value !== null && text ? {value, label: text} : {value: value ?? text};
    });
  }

  private static _filterFieldFromEl(el: Element): FlowFilterField | null {
    const id = el.getAttribute('id');
    if (!id) return null;
    const value = el.getAttribute('value');
    const type = el.getAttribute('type') as FlowFilterField['type'] | null;
    return {
      id,
      label: el.getAttribute('label') ?? undefined,
      type: type ?? undefined,
      operators: ZnFlowBuilder._nestedFilterOptions(el, 'zn-flow-operator')
        ?? ZnFlowBuilder._parseFilterOptions(el.getAttribute('operators')),
      options: ZnFlowBuilder._nestedFilterOptions(el, 'zn-flow-option')
        ?? ZnFlowBuilder._parseFilterOptions(el.getAttribute('options')),
      units: ZnFlowBuilder._nestedFilterOptions(el, 'zn-flow-unit')
        ?? ZnFlowBuilder._parseFilterOptions(el.getAttribute('units')),
      suffix: el.getAttribute('suffix') ?? undefined,
      placeholder: el.getAttribute('placeholder') ?? undefined,
      value: value === null ? undefined : type === 'number' ? Number(value) : value,
    };
  }

  /**
   * A step's branch filters: the `branch-filters` JSON attribute, or nested
   * `<zn-flow-filter>` declarations each holding `<zn-flow-filter-field>`s.
   */
  private static _parseBranchFilters(el: Element): FlowBranchFilter[] | undefined {
    // Option lists in the JSON may use the string shorthand — normalise to objects.
    const norm = (opts?: (string | FlowFilterOption)[]) =>
      opts?.map(o => (typeof o === 'string' ? {value: o} : o));
    const attr = el.getAttribute('branch-filters');
    if (attr) {
      try {
        const parsed = JSON.parse(attr) as unknown;
        if (Array.isArray(parsed)) {
          return (parsed as FlowBranchFilter[]).map(f => ({
            ...f,
            fields: (f.fields ?? []).map(field => ({
              ...field,
              ...(field.operators ? {operators: norm(field.operators)} : {}),
              ...(field.options ? {options: norm(field.options)} : {}),
              ...(field.units ? {units: norm(field.units)} : {}),
            })),
          }));
        }
      } catch {
        /* fall through to nested declarations */
      }
    }
    const filters = Array.from(el.querySelectorAll(':scope > zn-flow-filter'))
      .map((f): FlowBranchFilter | null => {
        const id = f.getAttribute('id') ?? f.getAttribute('label');
        if (!id) return null;
        return {
          id,
          label: f.getAttribute('label') ?? id,
          description: f.getAttribute('description') ?? undefined,
          fields: Array.from(f.querySelectorAll(':scope > zn-flow-filter-field'))
            .map(field => ZnFlowBuilder._filterFieldFromEl(field))
            .filter((field): field is FlowFilterField => !!field),
        };
      })
      .filter((f): f is FlowBranchFilter => !!f);
    return filters.length ? filters : undefined;
  }

  private _typeFromStep(el: Element): FlowNodeType | null {
    const type = el.getAttribute('type');
    if (!type) return null;
    // The label falls back to the step's own text only — not the text of
    // nested <zn-flow-filter> declarations.
    const ownText = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent ?? '')
      .join('')
      .trim();
    return {
      type,
      label: el.getAttribute('label') ?? (ownText || type),
      group: (el.getAttribute('group') as FlowGroup) ?? 'action',
      category: el.getAttribute('category') ?? undefined,
      icon: el.getAttribute('icon') ?? undefined,
      iconLibrary: el.getAttribute('icon-library') ?? undefined,
      color: el.getAttribute('color') ?? undefined,
      description: el.getAttribute('description') ?? undefined,
      inputs: ZnFlowBuilder._parsePorts(el.getAttribute('inputs')),
      outputs: ZnFlowBuilder._parsePorts(el.getAttribute('outputs')),
      branchFilters: ZnFlowBuilder._parseBranchFilters(el),
    };
  }

  /** Register a FlowNodeType for every slotted <zn-flow-step>. */
  private _registerSlottedTypes = () => {
    let added = false;
    this.querySelectorAll('zn-flow-step').forEach(el => {
      const type = this._typeFromStep(el);
      if (type && !this.registry.has(type.type)) {
        this.registry.register(type);
        added = true;
      }
    });
    if (added) this.requestUpdate();
  };

  // --- Public API -------------------------------------------------------------

  registerNodeType(type: FlowNodeType): this {
    this.registry.register(type);
    this.requestUpdate();
    return this;
  }

  registerNodeTypes(types: FlowNodeType[]): this {
    this.registry.registerAll(types);
    this.requestUpdate();
    return this;
  }

  getState(): FlowState {
    return this._clone(this._state);
  }

  setState(next: FlowState) {
    this._cancelUntangle();
    this._state = next;
    this._history = [];
    this._redo = [];
    this._selectedNodeId = null;
    this._configRevision++;
    this._offerRestoreIfNewer();
  }

  get value(): string {
    return JSON.stringify(this._state);
  }

  set value(json: string) {
    try {
      const parsed = JSON.parse(json) as Partial<FlowState>;
      this.setState({
        nodes: parsed.nodes ?? [],
        connections: parsed.connections ?? [],
        notes: parsed.notes ?? [],
      });
    } catch {
      /* ignore malformed JSON */
    }
  }

  /**
   * The full flow state — nodes with their positions, connections, branch
   * data, and notes — ready for persisting. Lets `JSON.stringify(builder)`
   * serialize the flow directly, e.g. as a POST body.
   */
  toJSON(): FlowState {
    return this.getState();
  }

  undo = () => {
    const prev = this._history.pop();
    if (!prev) return;
    this._cancelUntangle();
    this._redo.push(this._clone(this._state));
    this._state = prev;
    this._configRevision++;
    this._syncSelection();
    this._commit();
  };

  redo = () => {
    const next = this._redo.pop();
    if (!next) return;
    this._cancelUntangle();
    this._history.push(this._clone(this._state));
    this._state = next;
    this._configRevision++;
    this._syncSelection();
    this._commit();
  };

  /**
   * Auto-arrange the nodes into evenly spaced layers that follow the flow,
   * animating them into place (wires and pills track them since everything is
   * derived from the node coordinates). Undoable as a single step.
   */
  untangle = () => {
    if (!this._state.nodes.length) return;
    this._cancelUntangle();
    this._pushHistory();
    const positions = untangledPositions(this._state, t => this.registry.get(t));
    const moves = this._state.nodes
      .map(n => ({n, from: {x: n.x, y: n.y}, to: positions.get(n.id)}))
      .filter((m): m is typeof m & { to: { x: number; y: number } } => !!m.to);

    const settle = () => {
      moves.forEach(({n, to}) => {
        n.x = to.x;
        n.y = to.y;
      });
    };
    const finish = () => {
      this._untangleSettle = null;
      settle();
      this._commit();
    };
    this._untangleSettle = settle;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    const DURATION = 500;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const canvas = this.shadowRoot?.querySelector('zn-flow-canvas') as ZnFlowCanvas | null;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      if (t >= 1) {
        this._untangleRaf = null;
        finish();
        return;
      }
      const e = ease(t);
      moves.forEach(({n, from, to}) => {
        n.x = Math.round(from.x + (to.x - from.x) * e);
        n.y = Math.round(from.y + (to.y - from.y) * e);
      });
      canvas?.requestUpdate();
      this._untangleRaf = requestAnimationFrame(step);
    };
    this._untangleRaf = requestAnimationFrame(step);
  };

  private _cancelUntangle() {
    if (this._untangleRaf !== null) {
      cancelAnimationFrame(this._untangleRaf);
      this._untangleRaf = null;
    }
    // Never leave nodes mid-interpolation (off-grid) — snap them to their targets.
    this._untangleSettle?.();
    this._untangleSettle = null;
  }

  // --- State helpers ----------------------------------------------------------

  private _clone(s: FlowState): FlowState {
    return JSON.parse(JSON.stringify(s)) as FlowState;
  }

  private _pushHistory() {
    this._history.push(this._clone(this._state));
    if (this._history.length > HISTORY_LIMIT) this._history.shift();
    this._redo = [];
  }

  private _commit = () => {
    this._pruneConnections();
    // New array refs so the canvas (which receives nodes/connections/notes by
    // reference) re-renders on structural changes. Live drags mutate the node
    // objects in place and the canvas self-updates; this keeps them in sync.
    this._state = {
      nodes: [...this._state.nodes],
      connections: [...this._state.connections],
      notes: [...this._state.notes],
    };
    // Editing is choosing the loaded flow — stop offering the auto-saved draft.
    this._restorePrompt = null;
    this.emit('zn-flow-change', {detail: {state: this.getState()}});
  };

  /**
   * Drop connections whose endpoints reference ports that no longer exist — e.g.
   * after a user removes a node's output (branch) via its config.
   */
  private _pruneConnections() {
    const byId = new Map(this._state.nodes.map(n => [n.id, n] as const));
    this._state.connections = this._state.connections.filter(c => {
      const from = byId.get(c.source.node);
      const to = byId.get(c.target.node);
      if (!from || !to) return false;
      const hasSource = nodeOutputs(from, this.registry.get(from.type)).some(p => p.id === c.source.port);
      const hasTarget = nodeInputs(to, this.registry.get(to.type)).some(p => p.id === c.target.port);
      return hasSource && hasTarget;
    });
  }

  private _syncSelection() {
    if (this._selectedNodeId && !this._state.nodes.some(n => n.id === this._selectedNodeId)) {
      this._selectedNodeId = null;
    }
    if (this._selectedBranch && !this._branchSelection()) {
      this._selectedBranch = null;
    }
  }

  /** The node + output port of the branch open in the editor, if both still exist. */
  private _branchSelection(): { node: FlowNodeInstance; port: FlowPort } | null {
    if (!this._selectedBranch) return null;
    const node = this._state.nodes.find(n => n.id === this._selectedBranch!.nodeId);
    if (!node) return null;
    const port = nodeOutputs(node, this.registry.get(node.type)).find(p => p.id === this._selectedBranch!.port);
    return port ? {node, port} : null;
  }

  private _id(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${++this._seq}`;
  }

  // --- Node operations --------------------------------------------------------

  /**
   * Snap to the grid and, if another node's footprint (card or branch pills)
   * occupies the spot, walk outward in grid-step rings to the nearest free one.
   */
  private _freePosition(x: number, y: number, excludeId?: string): { x: number; y: number } {
    const parents = new Set(
      this._state.connections
        .filter(c => excludeId && c.target.node === excludeId && c.source.node !== excludeId)
        .map(c => c.source.node)
    );
    const collides = (px: number, py: number) => {
      // Test with the excluded node AT the candidate spot — its parents' pills
      // centre between the two, so they shift along with the move and must
      // land clear of everything as well.
      const nodes = excludeId
        ? this._state.nodes.map(n => (n.id === excludeId ? {...n, x: px, y: py} : n))
        : this._state.nodes;
      const typeOf = (t: string) => this.registry.get(t);
      if (nodes.some(n => n.id !== excludeId && cardCollides({x: px, y: py}, n, typeOf, nodes, this._state.connections))) {
        return true;
      }
      return [...parents].some(pid => {
        const parent = nodes.find(n => n.id === pid);
        return !!parent && pillsCollide(parent, typeOf, nodes, this._state.connections);
      });
    };
    x = snapToGrid(x);
    y = snapToGrid(y);
    if (!collides(x, y)) return {x, y};
    const step = GRID_SIZE * 2;
    for (let ring = 1; ring < 40; ring++) {
      for (let dy = -ring; dy <= ring; dy++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
          if (!collides(x + dx * step, y + dy * step)) {
            return {x: x + dx * step, y: y + dy * step};
          }
        }
      }
    }
    return {x, y};
  }

  private _addNode(typeKey: string, x: number, y: number) {
    const type = this.registry.get(typeKey);
    if (!type) return;
    this._pushHistory();
    const pos = this._freePosition(x, y);
    const node: FlowNodeInstance = {
      id: this._id('node'),
      type: typeKey,
      x: pos.x,
      y: pos.y,
      data: {...(type.defaultData ?? {})},
    };
    this._state.nodes.push(node);
    this._select(node.id);
    this._commit();
  }

  private _deleteNode(id: string) {
    this._pushHistory();
    this._state.nodes = this._state.nodes.filter(n => n.id !== id);
    this._state.connections = this._state.connections.filter(
      c => c.source.node !== id && c.target.node !== id
    );
    if (this._selectedNodeId === id) this._select(null);
    this._commit();
  }

  private _duplicateNode(id: string) {
    const node = this._state.nodes.find(n => n.id === id);
    if (!node) return;
    this._pushHistory();
    const pos = this._freePosition(node.x + GRID_SIZE * 2, node.y + GRID_SIZE * 2);
    const copy: FlowNodeInstance = {
      ...this._clone({nodes: [node], connections: [], notes: []}).nodes[0],
      id: this._id('node'),
      x: pos.x,
      y: pos.y,
    };
    this._state.nodes.push(copy);
    this._select(copy.id);
    this._commit();
  }

  /** Canvas position for a node newly placed off a source node's output. */
  private _positionBelowOutput(source: FlowNodeInstance, port: string): { x: number; y: number } {
    const outputs = nodeOutputs(source, this.registry.get(source.type));
    const idx = Math.max(outputs.findIndex(o => o.id === port), 0);
    // Centred under the branch drop (where the pill hangs), a full layer below
    // the source (same rhythm as untangle) — the child lands in a straight
    // line under the branch instead of being shoved sideways by collision.
    const x = branchDropXs(source, t => this.registry.get(t))[idx];
    return {x: Math.round(x - NODE_WIDTH / 2), y: source.y + LAYOUT_V_GAP};
  }

  /**
   * Resolve an output port id on a node: the "new branch" sentinel materialises a
   * fresh, labelled output port (per-instance), so it exists before connecting.
   */
  private _ensureOutput(node: FlowNodeInstance, port: string): string {
    if (port !== NEW_OUTPUT_PORT) return port;
    const outputs = nodeOutputs(node, this.registry.get(node.type)).map(p => ({...p}));
    const id = this._id('branch');
    outputs.push({id, label: 'Branch'});
    node.outputs = outputs;
    return id;
  }

  /**
   * Every connected output is a configurable branch — default its name so the
   * pill renders, however the connection was made (arrow, drop, or move).
   */
  private _ensureBranchLabel(node: FlowNodeInstance, port: string) {
    const outputs = nodeOutputs(node, this.registry.get(node.type)).map(p => ({...p}));
    const outPort = outputs.find(p => p.id === port);
    if (outPort && !outPort.label) {
      outPort.label = 'Branch';
      node.outputs = outputs;
    }
  }

  /** Create a node and attach it to an open output slot of an existing node. */
  private _addNodeAtOutput(sourceId: string, port: string, typeKey: string) {
    const source = this._state.nodes.find(n => n.id === sourceId);
    const type = this.registry.get(typeKey);
    if (!source || !type) return;
    const inPort = typeInputs(type)[0]?.id;
    if (!inPort) return; // an entrypoint takes no inputs, so it can't be attached
    this._pushHistory();
    port = this._ensureOutput(source, port);
    this._ensureBranchLabel(source, port);
    const below = this._positionBelowOutput(source, port);
    const pos = this._freePosition(below.x, below.y);
    const node: FlowNodeInstance = {
      id: this._id('node'),
      type: typeKey,
      x: pos.x,
      y: pos.y,
      data: {...(type.defaultData ?? {})},
    };
    const connection: FlowConnection = {
      id: this._id('conn'),
      source: {node: sourceId, port},
      target: {node: node.id, port: inPort},
    };
    this._state.nodes.push(node);
    this._state.connections.push(connection);
    this.emit('zn-flow-connect', {detail: {connection}});
    this._select(node.id);
    this._commit();
  }

  /**
   * Wire an open output to an existing node — targets its first input. Fan-in
   * and loops (a branch pointing back to an earlier step) are both allowed;
   * only wiring a node directly to itself is refused.
   */
  private _linkNodeAtOutput(sourceId: string, port: string, targetId: string) {
    const source = this._state.nodes.find(n => n.id === sourceId);
    const target = this._state.nodes.find(n => n.id === targetId);
    if (!source || !target || sourceId === targetId) return;
    const inPort = firstInputId(target, this.registry.get(target.type));
    if (inPort === null) return;
    this._pushHistory();
    port = this._ensureOutput(source, port);
    this._ensureBranchLabel(source, port);
    const connection: FlowConnection = {
      id: this._id('conn'),
      source: {node: sourceId, port},
      target: {node: targetId, port: inPort},
    };
    this._state.connections.push(connection);
    this.emit('zn-flow-connect', {detail: {connection}});
    this._select(null);
    this._selectedBranch = {nodeId: sourceId, port};
    this._commit();
  }

  /** Insert a new node in the middle of an existing connection (split the wire). */
  private _insertNodeOnWire(connectionId: string, typeKey: string) {
    const conn = this._state.connections.find(c => c.id === connectionId);
    const type = this.registry.get(typeKey);
    if (!conn || !type) return;
    const from = this._state.nodes.find(n => n.id === conn.source.node);
    const to = this._state.nodes.find(n => n.id === conn.target.node);
    if (!from || !to) return;

    const inPort = typeInputs(type)[0]?.id;
    if (!inPort) return; // an entrypoint can't be inserted mid-wire
    this._pushHistory();
    // The inserted node rejoins the original target via its own branch — make
    // sure its first output exists and is named so the pill renders.
    const outputs = typeOutputs(type).map(p => ({...p}));
    if (!outputs.length) outputs.push({id: this._id('branch')});
    if (!outputs[0].label) outputs[0].label = 'Branch';
    // Slot in aligned under the source's branch, a full layer down. Push the
    // original target (with its subtree) down first to make the room, so the
    // insert reads as a clean vertical chain rather than a squeeze.
    const below = this._positionBelowOutput(from, conn.source.port);
    const needY = below.y + LAYOUT_V_GAP;
    if (to.y < needY) {
      const delta = needY - to.y;
      const shifted = descendantIds(this._state, to.id);
      shifted.add(to.id);
      this._state.nodes.forEach(n => {
        if (shifted.has(n.id)) n.y += delta;
      });
    }
    const pos = this._freePosition(below.x, below.y);
    const node: FlowNodeInstance = {
      id: this._id('node'),
      type: typeKey,
      x: pos.x,
      y: pos.y,
      outputs,
      data: {...(type.defaultData ?? {})},
    };
    // Re-wire: source -> new, new -> original target (using the new node's first output).
    const originalTargetPort = conn.target.port;
    conn.target = {node: node.id, port: inPort};
    const downstream: FlowConnection = {
      id: this._id('conn'),
      source: {node: node.id, port: outputs[0].id},
      target: {node: to.id, port: originalTargetPort},
    };
    this._state.nodes.push(node);
    this._state.connections.push(downstream);
    this.emit('zn-flow-connect', {detail: {connection: downstream}});
    this._select(node.id);
    this._commit();
  }

  private _select(id: string | null) {
    this._selectedBranch = null;
    // A selection needs the inspector — bring the panel back if it's tucked away.
    if (id) this._sideCollapsed = false;
    if (this._selectedNodeId === id) return;
    this._selectedNodeId = id;
    this.emit('zn-flow-selection-change', {detail: {nodeId: id}});
  }

  private _onBranchPick = (e: CustomEvent<{ nodeId: string; port: string }>) => {
    this._select(null);
    this._sideCollapsed = false;
    this._selectedBranch = {nodeId: e.detail.nodeId, port: e.detail.port};
  };

  /** Remove an output branch and its wire. Undoable. */
  private _onBranchDelete = (e: CustomEvent<{ nodeId: string; port: string }>) => {
    const node = this._state.nodes.find(n => n.id === e.detail.nodeId);
    if (!node) return;
    this._pushHistory();
    const outputs = nodeOutputs(node, this.registry.get(node.type)).filter(p => p.id !== e.detail.port);
    // Deleting the last branch leaves a plain open output, so the node stays extensible.
    node.outputs = outputs.length ? outputs : [{...DEFAULT_OUTPUT}];
    // Sever the wire explicitly — the fallback output can share the deleted
    // port's id, in which case pruning alone would keep the connection alive.
    this._state.connections = this._state.connections.filter(
      c => !(c.source.node === node.id && c.source.port === e.detail.port)
    );
    if (this._selectedBranch?.nodeId === e.detail.nodeId && this._selectedBranch.port === e.detail.port) {
      this._selectedBranch = null;
    }
    this._commit();
  };

  // --- Event handlers ---------------------------------------------------------

  private _onSelect = (e: CustomEvent<{ nodeId: string | null }>) => {
    // A click on empty canvas cancels an in-progress move.
    if (e.detail.nodeId === null && this._movingNodeId) {
      this._movingNodeId = null;
      return;
    }
    this._select(e.detail.nodeId);
  };

  private _onNodeAction = (e: CustomEvent<{ nodeId: string; action: string }>) => {
    const {nodeId, action} = e.detail;
    if (action === 'delete') this._deleteNode(nodeId);
    else if (action === 'duplicate') this._duplicateNode(nodeId);
    else if (action === 'move') this._movingNodeId = nodeId;
  };

  private _onInteractionStart = () => {
    this._pushHistory();
  };

  private _onOutputAssign = (e: CustomEvent<{ nodeId: string; port: string; type: string }>) => {
    this._addNodeAtOutput(e.detail.nodeId, e.detail.port, e.detail.type);
  };

  /** A stray branch was attached to an existing node (fan-in). */
  private _onLinkAssign = (e: CustomEvent<{ nodeId: string; port: string; targetId: string }>) => {
    this._linkNodeAtOutput(e.detail.nodeId, e.detail.port, e.detail.targetId);
  };

  private _onWirePick = (e: CustomEvent<{ connectionId: string; clientX: number; clientY: number }>) => {
    this._picker = {
      x: e.detail.clientX,
      y: e.detail.clientY,
      target: {kind: 'wire', connectionId: e.detail.connectionId}
    };
  };

  private _onWireAssign = (e: CustomEvent<{ connectionId: string; type: string }>) => {
    this._insertNodeOnWire(e.detail.connectionId, e.detail.type);
  };

  /** Re-attach the node being moved to the chosen open output slot. */
  private _onOutputMoveTarget = (e: CustomEvent<{ nodeId: string; port: string }>) => {
    const movingId = this._movingNodeId;
    this._movingNodeId = null;
    if (!movingId) return;
    const slotOwner = e.detail.nodeId;
    if (slotOwner === movingId) return;

    const owner = this._state.nodes.find(n => n.id === slotOwner);
    const moving = this._state.nodes.find(n => n.id === movingId);
    if (!owner || !moving) return;
    const inPort = firstInputId(moving, this.registry.get(moving.type));
    if (inPort === null) return;

    this._pushHistory();
    const outPort = this._ensureOutput(owner, e.detail.port);
    this._ensureBranchLabel(owner, outPort);
    // Detach the moving node's current incoming connections, then attach to the new slot.
    this._state.connections = this._state.connections.filter(c => c.target.node !== movingId);
    const connection: FlowConnection = {
      id: this._id('conn'),
      source: {node: slotOwner, port: outPort},
      target: {node: movingId, port: inPort},
    };
    this._state.connections.push(connection);
    // Reposition the moved node below its new slot so it visually lands there.
    const below = this._positionBelowOutput(owner, outPort);
    const pos = this._freePosition(below.x, below.y, movingId);
    moving.x = pos.x;
    moving.y = pos.y;
    this.emit('zn-flow-connect', {detail: {connection}});
    this._commit();
  };

  private _onAddNote = () => {
    this._pushHistory();
    this._state.notes.push({id: this._id('note'), x: 80, y: 80, text: ''});
    this._commit();
  };

  private _onNoteChange = (e: CustomEvent<{ noteId: string; text: string }>) => {
    const note = this._state.notes.find(n => n.id === e.detail.noteId);
    if (!note) return;
    note.text = e.detail.text;
    this._commit();
  };

  private _onNoteDelete = (e: CustomEvent<{ noteId: string }>) => {
    this._pushHistory();
    this._state.notes = this._state.notes.filter(n => n.id !== e.detail.noteId);
    this._commit();
  };

  // --- Step drag/drop ------------------------------------------------------

  private _onDragStart(e: DragEvent, typeKey: string) {
    if (!e.dataTransfer) return;
    // dataTransfer payload isn't readable during `dragover`, so expose the type
    // separately for the canvas to render a meaningful drop preview.
    this._draggingType = typeKey;
    e.dataTransfer.setData(TYPE_MIME, typeKey);
    // 'copyMove' so the drop is accepted by both the canvas (move) and "+" targets (copy).
    e.dataTransfer.effectAllowed = 'copyMove';
    // Hide the native drag image — the canvas renders an in-canvas drop preview instead.
    e.dataTransfer.setDragImage(emptyDragImage(), 0, 0);
  }

  private _onDragEnd = () => {
    this._draggingType = null;
  };

  // Slotted <zn-flow-step>s report their type so the canvas can preview the drop.
  private _onStepDrag = (e: CustomEvent<{ type: string }>) => {
    this._draggingType = e.detail.type;
  };

  private _onCanvasDragOver = (e: DragEvent) => {
    // Allow the drop; the canvas's own dragover handler decides the cursor
    // (copy over a "+" slot, move elsewhere), so don't override dropEffect here.
    e.preventDefault();
  };

  private _onCanvasDrop = (e: DragEvent) => {
    const typeKey = e.dataTransfer?.getData(TYPE_MIME);
    if (!typeKey) return;
    e.preventDefault();
    const canvas = this.shadowRoot?.querySelector('zn-flow-canvas') as ZnFlowCanvas | null;
    const pt = canvas?.screenToCanvas(e.clientX, e.clientY) ?? {x: e.clientX, y: e.clientY};
    this._addNode(typeKey, pt.x - NODE_WIDTH / 2, pt.y - NODE_HEIGHT / 2);
  };

  // --- Rendering --------------------------------------------------------------

  private _renderSteps() {
    return html`
      <aside part="steps" class="steps">
        <div class="title-block">
          <div class="heading">${this.heading || 'Flow Builder'}</div>
          ${this.subheading ? html`
            <div class="subheading">${this.subheading}</div>` : ''}
        </div>

        ${this._renderStepsContent()}

        <!-- Node types are declared by <zn-flow-step> children (hidden); the steps panel
             above is rendered from them, tabbed by group (groups with no steps get no tab). -->
        <slot class="declarations" @slotchange="${this._registerSlottedTypes}"></slot>
      </aside>
    `;
  }

  private _hintFor(group: FlowGroup): string {
    if (group === 'entrypoint') return this.entrypointsHint;
    if (group === 'trigger') return this.triggersHint;
    if (group === 'action') return this.actionsHint;
    return this.rulesHint;
  }

  private _renderStep(type: FlowNodeType) {
    return html`
      <div
        class="step"
        draggable="true"
        @dragstart="${(e: DragEvent) => this._onDragStart(e, type.type)}"
        @dragend="${this._onDragEnd}"
      >
        <span class="step__icon" style="--node-accent:${type.color ?? 'rgb(var(--zn-color-primary))'}">
          <zn-icon src="${type.icon ?? 'circle'}" library="${ifDefined(type.iconLibrary)}" size="16"></zn-icon>
        </span>
        <span class="step__label">${type.label}</span>
      </div>
    `;
  }

  private _renderStepsContent() {
    // Only groups with registered types get a tab.
    const tabs = TABS.filter(tab => this.registry.byGroup(tab.group).length > 0);
    const activeGroup = tabs.find(t => t.group === this._activeGroup)?.group ?? tabs[0]?.group;

    return html`
      <div class="steps-content">
        <zn-input
          class="search"
          placeholder="Search by step name"
          clearable
          .value="${this._search}"
          @zn-input="${(e: Event) => (this._search = String((e.target as ZnInput).value ?? ''))}"
          @input="${(e: Event) => (this._search = String((e.target as ZnInput).value ?? ''))}"
        ></zn-input>

        ${tabs.length === 0
          ? html`<p class="steps-empty">No steps registered.</p>`
          : html`
            <zn-tabs flush>
              <zn-navbar slot="top">
                ${tabs.map((tab, i) => html`
                  <li tab="${i === 0 ? '' : tab.group}" @click="${() => (this._activeGroup = tab.group)}">
                    ${tab.label}
                  </li>`)}
              </zn-navbar>
              ${tabs.map((tab, i) => this._renderStepsPanel(tab.group, i === 0 ? '' : tab.group, tab.group === activeGroup))}
            </zn-tabs>`}
      </div>
    `;
  }

  private _renderStepsPanel(group: FlowGroup, panelId: string, active: boolean) {
    const term = active ? this._search.trim().toLowerCase() : '';
    const categories = this.registry.categories(group);
    const hint = this._hintFor(group);

    return html`
      <div id="${panelId}" class="steps-panel">
        ${hint ? html`<p class="steps-hint">${hint}</p>` : ''}
        <div class="steps-scroll">
          ${Array.from(categories.entries()).map(([name, types]) => {
            const items = types.filter(t => !term || t.label.toLowerCase().includes(term));
            if (!items.length) return '';
            const rows = items.map(type => this._renderStep(type));
            return name
              ? html`
                <zn-flow-step-group caption="${name}">${rows}</zn-flow-step-group>`
              : html`
                <div class="steps-uncategorized">${rows}</div>`;
          })}
        </div>
      </div>
    `;
  }

  // The selected node's configuration, shown in the right panel.
  private _renderInspector(node: FlowNodeInstance) {
    const type = this.registry.get(node.type);
    const renderConfig = type?.renderConfig;
    const update = (data: Record<string, unknown>) => {
      node.data = {...node.data, ...data};
      this._commit();
    };
    // The guard keeps the consumer's config DOM in place across value-only
    // re-renders (so live-typing inputs keep focus); it rebuilds when the node
    // changes, the state is replaced, or a branch is added / removed /
    // replaced (ids, not count — a swap like delete-last keeps the count).
    const configKey = [node.id, this._configRevision, nodeOutputs(node, type).map(p => p.id).join('|')];

    return html`
      <aside part="inspector" class="inspector">
        <div class="inspector-head">
          <span
            class="inspector-head__icon"
            style="--node-accent:${type?.color ?? 'rgb(var(--zn-color-primary))'}"
          >
            <zn-icon src="${type?.icon ?? 'circle'}" library="${ifDefined(type?.iconLibrary)}" size="18"></zn-icon>
          </span>
          <div class="inspector-head__text">
            <div class="inspector-head__title">${node.label ?? type?.label ?? node.type}</div>
            <div class="inspector-head__type">${type?.label ?? node.type}</div>
          </div>
          <button class="inspector-close" title="Close" @click="${() => this._select(null)}">
            <zn-icon src="x@lu" size="18"></zn-icon>
          </button>
        </div>

        <div class="inspector-body">
          ${renderConfig
            ? guard(configKey, () => renderConfig(node, update))
            : html`
              <zn-input
                label="Label"
                .value="${node.label ?? ''}"
                @input="${(e: Event) => {
                  node.label = String((e.target as ZnInput).value ?? '');
                  this._commit();
                }}"
              ></zn-input>
              <p class="inspector-hint">This step type has no custom configuration.</p>
            `}
        </div>
      </aside>
    `;
  }

  /** Replace one of the node's output ports (per-instance override), keeping its id. */
  private _updateBranch(node: FlowNodeInstance, portId: string, patch: Partial<FlowPort>) {
    const type = this.registry.get(node.type);
    node.outputs = nodeOutputs(node, type).map(p => (p.id === portId ? {...p, ...patch, id: p.id} : p));
    this._commit();
  }

  /** Persist the built-in conditions editor's draft onto the branch and close it. Undoable. */
  private _saveBranchConditions(node: FlowNodeInstance, port: FlowPort, conditions: FlowBranchConditions) {
    this._pushHistory();
    this._updateBranch(node, port.id, {data: {...port.data, conditions}});
    this._selectedBranch = null;
  }

  // The branch editor: rename an output branch and configure its conditions.
  private _renderBranchEditor(node: FlowNodeInstance, port: FlowPort) {
    const type = this.registry.get(node.type);
    const renderBranchConfig = type?.renderBranchConfig;
    const update = (patch: Partial<FlowPort>) => this._updateBranch(node, port.id, patch);
    // Stable while the branch name is live-typed; rebuilds (with the fresh port
    // object) when the branch, its condition data, or the state changes.
    const configKey = [node.id, port.id, this._configRevision, JSON.stringify(port.data ?? null)];
    // A loop branch's editor matches its amber pill and wire, and says so.
    const conn = this._state.connections.find(c => c.source.node === node.id && c.source.port === port.id);
    const isLoop = !!conn && loopConnections(this._state.nodes, this._state.connections).has(conn);
    const accent = isLoop ? 'rgb(var(--zn-color-warning))' : type?.color ?? 'rgb(var(--zn-color-primary))';
    const loopTarget = isLoop ? this._state.nodes.find(n => n.id === conn!.target.node) : undefined;
    const loopTargetLabel = loopTarget
      ? loopTarget.label ?? this.registry.get(loopTarget.type)?.label ?? loopTarget.type
      : '';

    return html`
      <aside part="inspector" class="inspector">
        <div class="inspector-head">
          <span
            class="inspector-head__icon"
            style="--node-accent:${accent}"
          >
            <zn-icon src="git-branch@lu" size="18"></zn-icon>
          </span>
          <div class="inspector-head__text">
            <div class="inspector-head__title-row">
              <span class="inspector-head__title">${port.label ?? port.id}</span>
              ${isLoop
                ? html`<span class="inspector-loop-tag"><zn-icon src="repeat@lu" size="12"></zn-icon>Loop</span>`
                : ''}
            </div>
            <div class="inspector-head__type">
              ${isLoop
                ? `Branch of ${node.label ?? type?.label ?? node.type} — loops back to ${loopTargetLabel}`
                : `Branch of ${node.label ?? type?.label ?? node.type}`}
            </div>
          </div>
          <button class="inspector-close" title="Close" @click="${() => (this._selectedBranch = null)}">
            <zn-icon src="x@lu" size="18"></zn-icon>
          </button>
        </div>

        <div class="inspector-body">
          <zn-input
            label="Branch name"
            .value="${port.label ?? ''}"
            @zn-input="${(e: Event) => update({label: String((e.target as ZnInput).value ?? '')})}"
            @input="${(e: Event) => update({label: String((e.target as ZnInput).value ?? '')})}"
          ></zn-input>
          ${renderBranchConfig
            ? guard(configKey, () => renderBranchConfig(node, port, update))
            : type?.branchFilters?.length
              ? html`
                <zn-flow-branch-conditions
                  .filters="${type.branchFilters}"
                  .value="${branchConditions(port)}"
                  @flow-conditions-save="${(e: CustomEvent<{ conditions: FlowBranchConditions }>) =>
                    this._saveBranchConditions(node, port, e.detail.conditions)}"
                  @flow-conditions-cancel="${() => (this._selectedBranch = null)}"
                ></zn-flow-branch-conditions>`
              : html`<p class="inspector-hint">This step type has no branch conditions.</p>`}
        </div>
      </aside>
    `;
  }

  // The right panel: branch editor or node inspector when something is selected,
  // otherwise the sidebar (status / errors / version history).
  private _renderRightPanel() {
    const branch = this._branchSelection();
    if (branch) return this._renderBranchEditor(branch.node, branch.port);
    const selected = this._state.nodes.find(n => n.id === this._selectedNodeId);
    return selected ? this._renderInspector(selected) : this._renderSidebar();
  }

  // Full-width action bar above the panels; only shown when actions are slotted.
  private _renderHeader() {
    const hasHeader = this._hasSlot.test('header-left') || this._hasSlot.test('header-right');
    return html`
      <header part="header" class="header" ?hidden="${!hasHeader}">
        <div class="header__group">
          <slot name="header-left"></slot>
        </div>
        <div class="header__group">
          <slot name="header-right"></slot>
        </div>
      </header>
    `;
  }

  // The right panel: a slot for version history / status, defaulting to a
  // configuration-errors summary derived from `errorNodes`.
  private _renderSidebar() {
    const errors = this.errorNodes
      .map(id => this._state.nodes.find(n => n.id === id))
      .filter((n): n is FlowNodeInstance => !!n);

    return html`
      <aside part="sidebar" class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section__head">
            <span>Configuration Errors</span>
            <span class="sidebar-count">${errors.length}</span>
          </div>
          ${errors.length === 0
            ? html`<p class="sidebar-empty">No configuration errors.</p>`
            : errors.map(n => {
              const type = this.registry.get(n.type);
              return html`
                <button class="sidebar-error" @click="${() => this._select(n.id)}">
                  <zn-icon src="triangle-alert@lu" size="16"></zn-icon>
                  <span>${n.label ?? type?.label ?? n.type}</span>
                </button>
              `;
            })}
        </div>
        <slot name="sidebar"></slot>
      </aside>
    `;
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

  // Offered when a loaded flow differs from a fresh auto-saved draft.
  private _renderRestorePrompt() {
    if (!this._restorePrompt) return '';
    return html`
      <div class="restore-banner">
        <zn-icon src="history@lu" size="16"></zn-icon>
        <span>An auto-saved draft from ${timeAgo(Date.now() - this._restorePrompt.savedAt)} differs from this flow.</span>
        <button class="restore-banner__restore" @click="${() => this.restoreAutoSave()}">Restore</button>
        <button class="restore-banner__dismiss" @click="${() => (this._restorePrompt = null)}">Dismiss</button>
      </div>
    `;
  }

  private _renderPicker() {
    if (!this._picker) return '';
    const {x, y} = this._picker;
    const groups = TABS.map(tab => ({tab, types: this.registry.byGroup(tab.group)})).filter(g => g.types.length);

    return html`
      <div class="picker-backdrop" @pointerdown="${() => (this._picker = null)}"></div>
      <div class="picker" style="left:${x}px;top:${y}px">
        ${groups.length === 0
          ? html`<p class="picker-empty">No steps registered.</p>`
          : groups.map(
            g => html`
              <div class="picker-group">${g.tab.label}</div>
              ${g.types.map(
                type => html`
                  <button class="picker-item" @click="${() => this._pickType(type.type)}">
                    <span
                      class="picker-item__icon"
                      style="--node-accent:${type.color ?? 'rgb(var(--zn-color-primary))'}"
                    >
                      <zn-icon src="${type.icon ?? 'circle'}" library="${ifDefined(type.iconLibrary)}"
                               size="16"></zn-icon>
                    </span>
                    <span>${type.label}</span>
                  </button>
                `
              )}
            `
          )}
      </div>
    `;
  }

  private _pickType(typeKey: string) {
    const picker = this._picker;
    if (!picker) return;
    this._picker = null;
    this._insertNodeOnWire(picker.target.connectionId, typeKey);
  }

  render() {
    return html`
      <div
        part="base"
        class="builder ${this._stepsCollapsed ? 'builder--steps-collapsed' : ''} ${this._sideCollapsed ? 'builder--side-collapsed' : ''}"
      >
        ${this._renderHeader()}
        ${this._renderSteps()}
        <div
          class="canvas-cell"
          @dragover="${this._onCanvasDragOver}"
          @drop="${this._onCanvasDrop}"
        >
          <button
            class="panel-toggle panel-toggle--left ${this._stepsCollapsed ? 'panel-toggle--tucked' : ''}"
            title="${this._stepsCollapsed ? 'Show steps panel' : 'Hide steps panel'}"
            @click="${() => (this._stepsCollapsed = !this._stepsCollapsed)}"
          >
            <zn-icon src="${this._stepsCollapsed ? 'chevron-right@lu' : 'chevron-left@lu'}" size="16"></zn-icon>
          </button>
          <button
            class="panel-toggle panel-toggle--right ${this._sideCollapsed ? 'panel-toggle--tucked' : ''}"
            title="${this._sideCollapsed ? 'Show panel' : 'Hide panel'}"
            @click="${() => (this._sideCollapsed = !this._sideCollapsed)}"
          >
            <zn-icon src="${this._sideCollapsed ? 'chevron-left@lu' : 'chevron-right@lu'}" size="16"></zn-icon>
          </button>
          <zn-flow-canvas
            .nodes="${this._state.nodes}"
            .connections="${this._state.connections}"
            .notes="${this._state.notes}"
            .registry="${this.registry}"
            .errorNodes="${new Set(this.errorNodes)}"
            selected-node="${this._selectedNodeId ?? ''}"
            moving-node="${this._movingNodeId ?? ''}"
            drag-type="${this._draggingType ?? ''}"
            selected-branch="${this._selectedBranch ? `${this._selectedBranch.nodeId}:${this._selectedBranch.port}` : ''}"
          ></zn-flow-canvas>
          ${this._movingNodeId
            ? html`
              <div class="move-banner">
                <zn-icon src="move@lu" size="16"></zn-icon>
                <span>Pick a <strong>+</strong> slot to move this step, or press Esc.</span>
                <button @click="${() => (this._movingNodeId = null)}">Cancel</button>
              </div>
            `
            : ''}
          ${this._renderAutoSaveStatus()}
          ${this._renderRestorePrompt()}
          ${this._renderPicker()}
        </div>
        ${this._renderRightPanel()}
      </div>
    `;
  }
}
