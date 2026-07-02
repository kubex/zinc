import {type CSSResultGroup, html, type PropertyValues, svg, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnButton from '../../../button';
import ZnFlowNode from '../flow-node';
import ZnIcon from '../../../icon';

import {
  branchDropXs,
  BUS_OFFSET,
  firstInputId,
  FLOW_TYPE_MIME,
  type FlowConnection,
  type FlowNodeInstance,
  type FlowNote,
  GRID_SIZE,
  loopConnections,
  NEW_OUTPUT_PORT,
  NODE_HEIGHT,
  NODE_WIDTH,
  nodeInputs,
  nodeOutputs,
  nodesCollide,
  NOTE_HEIGHT,
  NOTE_MIN_HEIGHT,
  NOTE_MIN_WIDTH,
  NOTE_WIDTH,
  PILL_DROP,
  pillSize,
  portAnchor,
  snapToGrid,
} from '../../flow.types';
import type {FlowRegistry} from '../../flow-registry';

import styles from './flow-canvas.scss';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.15;
// Gap from the bus (or a branch's label pill) down to its "+" add-point.
const ADD_POINT_OFFSET = 40;
// Wire routing: a short stub leaving an exit, the vertical run-in above a target
// input, and how far a detour clears a node card when routing around it. All
// whole grid units so wire runs sit on grid lines.
const WIRE_STUB = 20;
const WIRE_APPROACH = 20;
const WIRE_DETOUR = 40;
// Vertical spacing between the horizontal runs of wires heading to different
// targets, so unrelated wires never share a line (which reads as a join).
const WIRE_LANE_STEP = 20;
const TYPE_MIME = FLOW_TYPE_MIME;

type DragState =
  | { kind: 'pan'; ox: number; oy: number; px: number; py: number }
  | { kind: 'node'; id: string; offX: number; offY: number }
  | { kind: 'note'; id: string; offX: number; offY: number }
  | { kind: 'note-resize'; id: string };

/**
 * @summary The pannable, zoomable surface that renders flow nodes and the connections between them.
 * @documentation https://zinc.style/components/flow-canvas
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 * @dependency zn-flow-node
 *
 * @event flow-interaction-start - A drag (node/note move or resize) has begun; the builder snapshots for undo.
 * @event flow-change-commit - A drag or operation finished and the state should be persisted/emitted.
 * @event flow-output-assign - A step was dropped on an open output's "+".
 * @event flow-output-move-target - An open output's "+" was chosen as the destination while moving a node.
 * @event flow-link-assign - A stray branch (started from an output's "+") was attached to an existing node.
 * @event flow-wire-pick - An existing wire's "+" was clicked; the builder opens the step picker to insert.
 * @event flow-wire-assign - A step was dropped on a wire's "+" to insert a step.
 * @event flow-branch-pick - A branch pill was clicked; the builder opens the branch editor.
 * @event flow-branch-delete - A branch pill's delete button was clicked; the builder removes the branch.
 * @event flow-undo - The undo toolbar button was pressed.
 * @event flow-redo - The redo toolbar button was pressed.
 * @event flow-add-note - The add-note toolbar button was pressed.
 * @event flow-untangle - The untangle toolbar button was pressed; the builder auto-arranges the nodes.
 * @event flow-note-change - A note's text was edited.
 * @event flow-note-delete - A note was removed.
 *
 * @csspart base - The canvas viewport.
 * @csspart toolbar - The floating toolbar.
 */
export default class ZnFlowCanvas extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-button': ZnButton,
    'zn-icon': ZnIcon,
    'zn-flow-node': ZnFlowNode,
  };

  @property({attribute: false}) nodes: FlowNodeInstance[] = [];
  @property({attribute: false}) connections: FlowConnection[] = [];
  @property({attribute: false}) notes: FlowNote[] = [];
  @property({attribute: false}) registry: FlowRegistry;
  @property({attribute: 'selected-node'}) selectedNodeId: string | null = null;
  @property({attribute: false}) errorNodes: Set<string> = new Set();
  /** When set, the canvas is in "move" mode: open "+" slots act as drop targets for this node. */
  @property({attribute: 'moving-node'}) movingNodeId: string | null = null;
  /** The node type being dragged from the steps panel, used to render the drop preview. */
  @property({attribute: 'drag-type'}) dragType: string | null = null;
  /** The branch being edited, as `nodeId:portId` — highlights its pill. */
  @property({attribute: 'selected-branch'}) selectedBranch: string | null = null;

  @state() private zoom = 1;
  @state() private panX = 0;
  @state() private panY = 0;
  @state() private drag: DragState | null = null;
  /** Canvas-space top-left where a step, if dropped now, would be placed. */
  @state() private _dropGhost: { x: number; y: number } | null = null;
  /** The stray branch being drawn from an output port until it attaches or cancels. */
  @state() private _linking: { nodeId: string; port: string } | null = null;
  @state() private _linkPos: { x: number; y: number } | null = null;
  /** The valid node under the cursor while linking — the preview snaps to its input. */
  @state() private _linkTarget: string | null = null;

  private _dragMoved = false;
  /** Centre the flow when it first arrives; any earlier user interaction opts out. */
  private _viewInitialised = false;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('flow-node-grab', this._onNodeGrab as EventListener);
    this.addEventListener('flow-node-select', this._onNodeSelect as EventListener);
    this.addEventListener('flow-port-click', this._onPortClick as EventListener);
    // Wheel must be non-passive to keep the page from scrolling underneath.
    this.addEventListener('wheel', this._onWheel, {passive: false});
  }

  disconnectedCallback() {
    this.removeEventListener('flow-node-grab', this._onNodeGrab as EventListener);
    this.removeEventListener('flow-node-select', this._onNodeSelect as EventListener);
    this.removeEventListener('flow-port-click', this._onPortClick as EventListener);
    this.removeEventListener('wheel', this._onWheel);
    this._cancelLink();
    this._teardownWindow();
    super.disconnectedCallback();
  }

  /**
   * Wheel navigation: scroll pans vertically, side-scroll (or Shift+scroll)
   * pans horizontally, and Ctrl/Cmd+scroll — including trackpad pinch — zooms
   * toward the cursor.
   */
  private _onWheel = (e: WheelEvent) => {
    // Let a note's textarea scroll its own content.
    if (e.composedPath().some(el => el instanceof HTMLTextAreaElement)) return;
    e.preventDefault();
    this._viewInitialised = true;

    // Normalise line/page deltas (Firefox) to pixels.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
    const dX = e.deltaX * unit;
    const dY = e.deltaY * unit;

    if (e.ctrlKey || e.metaKey) {
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.zoom * Math.exp(-dY * 0.0015)));
      if (next === this.zoom) return;
      // Keep the canvas point under the cursor stationary while zooming.
      const rect = this.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const cx = (px - this.panX) / this.zoom;
      const cy = (py - this.panY) / this.zoom;
      this.zoom = +next.toFixed(3);
      this.panX = Math.round(px - cx * this.zoom);
      this.panY = Math.round(py - cy * this.zoom);
      return;
    }

    // Shift converts a plain vertical scroll into a horizontal pan.
    const horizontal = e.shiftKey && !dX ? dY : dX;
    const vertical = e.shiftKey && !dX ? 0 : dY;
    this.panX -= Math.round(horizontal);
    this.panY -= Math.round(vertical);
  };

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this.style.setProperty('--flow-zoom', String(this.zoom));
    // The step drag ended (builder cleared drag-type) — drop the preview.
    if (changed.has('dragType') && !this.dragType) this._dropGhost = null;
    // First load with content: centre the flow (once the canvas has a size).
    if (!this._viewInitialised && this.nodes.length) {
      const rect = this.getBoundingClientRect();
      if (rect.width && rect.height) {
        this._viewInitialised = true;
        this._resetView();
      }
    }
  }

  private _emit(name: string, detail?: Record<string, unknown>) {
    this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true, detail}));
  }

  /** Convert a client (screen) coordinate to canvas space, accounting for pan/zoom. */
  screenToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.panX) / this.zoom,
      y: (clientY - rect.top - this.panY) / this.zoom,
    };
  }

  private _typeFor(node: FlowNodeInstance) {
    return this.registry?.get(node.type);
  }

  // --- Drag lifecycle ---------------------------------------------------------

  private _setupWindow(cursor = '') {
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    // Force the cursor for the whole drag — pointer capture means the pointer can
    // leave the element, and body-level override also crosses shadow boundaries.
    if (cursor) document.body.style.cursor = cursor;
  }

  private _teardownWindow() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    document.body.style.cursor = '';
  }

  private _onBackgroundPointerDown = (e: PointerEvent) => {
    // Middle-drag pans from anywhere — nodes included — without touching
    // selection or an in-flight branch.
    if (e.button === 1) {
      e.preventDefault(); // suppress the browser's middle-click autoscroll
      this._viewInitialised = true;
      this.drag = {kind: 'pan', ox: e.clientX, oy: e.clientY, px: this.panX, py: this.panY};
      this._setupWindow('grabbing');
      return;
    }
    if (e.button !== 0) return;
    this._viewInitialised = true;
    if (this._linking) {
      // Clicking while snapped onto a target attaches; anywhere else cancels.
      const link = this._linking;
      const target = this._linkTarget;
      this._cancelLink();
      if (target) {
        this._emit('flow-link-assign', {nodeId: link.nodeId, port: link.port, targetId: target});
        return;
      }
    }
    this._emit('flow-node-select', {nodeId: null});
    this.drag = {kind: 'pan', ox: e.clientX, oy: e.clientY, px: this.panX, py: this.panY};
    this._setupWindow('grabbing');
  };

  private _onNodeGrab = (e: CustomEvent<{ nodeId: string; clientX: number; clientY: number }>) => {
    // While a branch is in progress, clicking a node attaches it instead of dragging.
    if (this._linking) {
      const link = this._linking;
      this._cancelLink();
      if (link.nodeId !== e.detail.nodeId) {
        this._emit('flow-link-assign', {nodeId: link.nodeId, port: link.port, targetId: e.detail.nodeId});
      }
      return;
    }
    const node = this.nodes.find(n => n.id === e.detail.nodeId);
    if (!node) return;
    const p = this.screenToCanvas(e.detail.clientX, e.detail.clientY);
    this.drag = {kind: 'node', id: node.id, offX: p.x - node.x, offY: p.y - node.y};
    this._dragMoved = false;
    this._setupWindow('grabbing');
  };

  /** While linking, a node click attaches the branch — swallow the selection. */
  private _onNodeSelect = (e: CustomEvent<{ nodeId: string | null }>) => {
    if (this._linking && e.detail.nodeId) e.stopPropagation();
  };

  // --- Stray-branch linking -----------------------------------------------------

  /**
   * A node's output stem port was clicked. If a branch is already in flight from
   * another node, attach it here; otherwise start one — from the node's first
   * open output if it has one, else as a brand-new branch (materialised by the
   * builder on attach).
   */
  private _onPortClick = (e: CustomEvent<{ nodeId: string }>) => {
    const {nodeId} = e.detail;
    if (this._linking && this._linking.nodeId !== nodeId) {
      const link = this._linking;
      this._cancelLink();
      this._emit('flow-link-assign', {nodeId: link.nodeId, port: link.port, targetId: nodeId});
      return;
    }
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const open = nodeOutputs(node, this._typeFor(node)).find(
      p => !this.connections.some(c => c.source.node === nodeId && c.source.port === p.id)
    );
    this._startLink(nodeId, open?.id ?? NEW_OUTPUT_PORT);
  };

  private _startLink(nodeId: string, port: string) {
    this._linking = {nodeId, port};
    this._linkPos = null;
    window.addEventListener('pointermove', this._onLinkPointerMove);
    window.addEventListener('keydown', this._onLinkKeyDown);
    window.addEventListener('blur', this._cancelLink);
  }

  private _onLinkPointerMove = (e: PointerEvent) => {
    const p = this.screenToCanvas(e.clientX, e.clientY);
    this._linkPos = p;
    const linking = this._linking;
    if (!linking) return;
    // Snap onto a valid target under the cursor: any node that takes inputs
    // (loops back to earlier steps are allowed; only the source itself isn't).
    const M = 12;
    const target = this.nodes.find(n =>
      n.id !== linking.nodeId
      && p.x >= n.x - M && p.x <= n.x + NODE_WIDTH + M
      && p.y >= n.y - M && p.y <= n.y + NODE_HEIGHT + M
      && nodeInputs(n, this._typeFor(n)).length > 0
    );
    this._linkTarget = target?.id ?? null;
  };

  private _onLinkKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._cancelLink();
  };

  private _cancelLink = () => {
    if (!this._linking) return;
    this._linking = null;
    this._linkPos = null;
    this._linkTarget = null;
    window.removeEventListener('pointermove', this._onLinkPointerMove);
    window.removeEventListener('keydown', this._onLinkKeyDown);
    window.removeEventListener('blur', this._cancelLink);
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (!this.drag) return;
    if (this.drag.kind === 'pan') {
      this.panX = this.drag.px + (e.clientX - this.drag.ox);
      this.panY = this.drag.py + (e.clientY - this.drag.oy);
      return;
    }
    const p = this.screenToCanvas(e.clientX, e.clientY);
    if (this.drag.kind === 'node') {
      const node = this.nodes.find(n => n.id === (this.drag as { id: string }).id);
      if (node) {
        // Snap to the grid, and refuse positions where any part of the node's
        // footprint (card or branch pills) would overlap another's — falling
        // back to one axis at a time so the node slides along edges.
        const desired = {x: snapToGrid(p.x - this.drag.offX), y: snapToGrid(p.y - this.drag.offY)};
        const others = this.nodes.filter(o => o.id !== node.id);
        const fits = (pos: { x: number; y: number }) => {
          const moved = {...node, ...pos};
          return !others.some(o =>
            nodesCollide(moved, o, t => this.registry?.get(t), this.nodes, this.connections));
        };
        const next = fits(desired) ? desired
          : fits({x: desired.x, y: node.y}) ? {x: desired.x, y: node.y}
            : fits({x: node.x, y: desired.y}) ? {x: node.x, y: desired.y}
              : null;
        if (next && (next.x !== node.x || next.y !== node.y)) {
          if (!this._dragMoved) this._beginMove();
          node.x = next.x;
          node.y = next.y;
          this.requestUpdate();
        }
      }
    } else if (this.drag.kind === 'note') {
      const note = this.notes.find(n => n.id === (this.drag as { id: string }).id);
      if (note) {
        if (!this._dragMoved) this._beginMove();
        note.x = snapToGrid(p.x - this.drag.offX);
        note.y = snapToGrid(p.y - this.drag.offY);
        this.requestUpdate();
      }
    } else if (this.drag.kind === 'note-resize') {
      const note = this.notes.find(n => n.id === (this.drag as { id: string }).id);
      if (note) {
        if (!this._dragMoved) this._beginMove();
        note.width = Math.max(NOTE_MIN_WIDTH, snapToGrid(p.x - note.x));
        note.height = Math.max(NOTE_MIN_HEIGHT, snapToGrid(p.y - note.y));
        this.requestUpdate();
      }
    }
  };

  private _onPointerUp = () => {
    const drag = this.drag;
    this.drag = null;
    this._teardownWindow();
    if (!drag) return;

    if ((drag.kind === 'node' || drag.kind === 'note' || drag.kind === 'note-resize') && this._dragMoved) {
      this._emit('flow-change-commit');
    }
  };

  private _beginMove() {
    this._dragMoved = true;
    this._emit('flow-interaction-start');
  }

  // --- Output fork geometry ---------------------------------------------------

  /**
   * A node's outputs all leave from a single bottom-centre stem and fan out along a
   * shared horizontal bus — one branch per output. Each branch drops on the source's
   * own side (so fan-in branches from different nodes never stack their pills), then
   * routes to its connected child or ends in a "+" add-point (open).
   */
  private _outputLayout(node: FlowNodeInstance) {
    const outputs = nodeOutputs(node, this._typeFor(node));
    const cx = node.x + NODE_WIDTH / 2;
    const by = node.y + NODE_HEIGHT;
    const busY = by + BUS_OFFSET;
    // Drop positions prefer a straight line above each branch's child.
    const dropXs = branchDropXs(node, t => this.registry?.get(t), this.nodes, this.connections);
    const branches = outputs.map((port, i) => {
      const conn = this.connections.find(c => c.source.node === node.id && c.source.port === port.id);
      const child = conn ? this.nodes.find(n => n.id === conn.target.node) : undefined;
      const x = dropXs[i];
      // Labelled outputs show their branch pill on the drop; the wire continues
      // from below it. Long names wrap, so the pill height (and the exit where
      // the +/child wire begins) grows with the text.
      const pillTop = port.label ? busY + PILL_DROP : null;
      const pillH = port.label ? pillSize(port.label).h : 0;
      const exitY = pillTop === null ? busY : pillTop + pillH;
      return {port, conn, child, x, pillTop, pillH, exitY};
    });
    return {cx, by, busY, branches};
  }

  /** Canvas-space anchor of a node's input port for an incoming connection. */
  private _inputAnchor(child: FlowNodeInstance, targetPort: string) {
    const inputs = nodeInputs(child, this._typeFor(child));
    const idx = Math.max(inputs.findIndex(p => p.id === targetPort), 0);
    return {x: portAnchor(child, 'in', idx, inputs.length).x, y: child.y};
  }

  /**
   * Per-connection nudges for elbow horizontals. An elbow runs at the exact
   * midpoint of its gap (equal drop and approach) unless wires to *different*
   * targets would share the same line — those read as a merge, so each
   * conflicting target gets its own grid-step offset. Wires fanning in to the
   * same input keep sharing a line: their join is real.
   */
  private _elbowMidOffsets(): Map<string, number> {
    const groups = new Map<number, Map<string, string[]>>(); // baseMid -> target -> conn ids
    for (const node of this.nodes) {
      const {branches} = this._outputLayout(node);
      for (const b of branches) {
        if (!b.conn || !b.child) continue;
        const {x: tx, y: ty} = this._inputAnchor(b.child, b.conn.target.port);
        if (tx === b.x || ty - WIRE_APPROACH < b.exitY) continue; // straight / detour
        const baseMid = snapToGrid((b.exitY + ty) / 2);
        const target = `${b.conn.target.node}:${b.conn.target.port}`;
        const group = groups.get(baseMid) ?? new Map<string, string[]>();
        groups.set(baseMid, group);
        group.set(target, [...(group.get(target) ?? []), b.conn.id]);
      }
    }
    const offsets = new Map<string, number>();
    for (const group of groups.values()) {
      if (group.size < 2) continue; // no conflict — perfectly symmetric elbows
      const targets = [...group.keys()].sort();
      targets.forEach((target, i) => {
        const offset = (i - Math.floor((targets.length - 1) / 2)) * WIRE_LANE_STEP;
        group.get(target)!.forEach(id => offsets.set(id, offset));
      });
    }
    return offsets;
  }

  /** Whether an orthogonal segment passes through any node card (with margin). */
  private _segmentBlocked(a: { x: number; y: number }, b: { x: number; y: number }, ignore: Set<string>): boolean {
    const M = 8;
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);
    return this.nodes.some(n =>
      !ignore.has(n.id)
      && minX < n.x + NODE_WIDTH + M && maxX > n.x - M
      && minY < n.y + NODE_HEIGHT + M && maxY > n.y - M
    );
  }

  private _routeClear(points: { x: number; y: number }[], ignore: Set<string>): boolean {
    for (let i = 0; i < points.length - 1; i++) {
      if (this._segmentBlocked(points[i], points[i + 1], ignore)) return false;
    }
    return true;
  }

  /**
   * Orthogonal waypoints from a branch exit to a child's input. The wire always
   * enters the input from above (arrow pointing down), and never passes through
   * a node card: each candidate route is checked against every card, scanning
   * alternative lanes / side-steps / detours until one is clear.
   */
  private _routePoints(
    from: { x: number; y: number },
    child: FlowNodeInstance,
    targetPort: string,
    midOffset = 0,
    sourceId?: string,
    loop = false
  ) {
    const {x: tx, y: ty} = this._inputAnchor(child, targetPort);
    const ignore = new Set(sourceId ? [child.id, sourceId] : [child.id]);

    if (ty - WIRE_APPROACH >= from.y) {
      // The exact midpoint, not grid-snapped: both endpoints sit on the grid,
      // so the midpoint is always a half-tile multiple — snapping it to full
      // tiles made the two verticals grow alternately as a node was dragged.
      const base = Math.round((from.y + ty) / 2) + midOffset;
      // The horizontal run stays within the middle half of the gap, so the
      // drop and the final approach grow in proportion to the distance —
      // lane offsets can't shove the run right up against either end.
      const span = ty - from.y;
      const lo = Math.min(ty - 12, Math.ceil((from.y + span / 4) / GRID_SIZE) * GRID_SIZE);
      const hi = Math.max(lo, Math.floor((ty - span / 4) / GRID_SIZE) * GRID_SIZE);
      const clampY = (v: number) => Math.max(lo, Math.min(hi, v));
      let fallback: { x: number; y: number }[] | null = null;

      if (tx === from.x) {
        const straight = [from, {x: tx, y: ty}];
        if (this._routeClear(straight, ignore)) return straight;
        fallback = straight;
      } else {
        // Elbow: try the lane midY first, then scan outward for a clear line.
        for (let step = 0; step <= 20; step++) {
          for (const cand of step === 0 ? [base] : [base + step * GRID_SIZE, base - step * GRID_SIZE]) {
            const my = clampY(cand);
            if (my !== cand && step > 0) continue; // out of range
            const route = [from, {x: from.x, y: my}, {x: tx, y: my}, {x: tx, y: ty}];
            fallback ??= route;
            if (this._routeClear(route, ignore)) return route;
          }
        }
      }

      // No simple route is clear (e.g. a card sits right under the exit) —
      // side-step: drop to m1, jog sideways to sx, descend, and approach the
      // input from above. The drop and the final approach share one run-in
      // depth (equal lengths by construction); scan that depth and the jog.
      const half = Math.floor(span / 2 / 10) * 10;
      const baseDepth = Math.max(10, Math.round(span / 4 / 10) * 10);
      for (let dStep = 0; dStep <= 12; dStep++) {
        for (const depth of dStep === 0 ? [baseDepth] : [baseDepth + dStep * 10, baseDepth - dStep * 10]) {
          if (depth < 10 || depth > half) continue;
          const m1 = from.y + depth;
          const m2 = ty - depth;
          if (m2 < m1) continue;
          for (let sStep = 1; sStep <= 14; sStep++) {
            for (const dir of [1, -1]) {
              const sx = from.x + dir * sStep * GRID_SIZE;
              const route = [
                from,
                {x: from.x, y: m1},
                {x: sx, y: m1},
                {x: sx, y: m2},
                {x: tx, y: m2},
                {x: tx, y: ty},
              ];
              if (this._routeClear(route, ignore)) return route;
            }
          }
        }
      }
      return fallback!;
    }

    // Child is beside/above: stub down, clear the card, rise above the input,
    // then approach it from the top — widening the detour until nothing is
    // crossed.
    const stubY = from.y + WIRE_STUB;
    const overY = ty - WIRE_APPROACH;
    let rightSide: boolean;
    let baseDetour: number;
    if (loop) {
      // Loop-backs travel around the OUTSIDE of everything they span
      // vertically, instead of squeezing through corridors inside the flow —
      // on whichever side costs less horizontal travel.
      const spanned = this.nodes.filter(
        n => n.y + NODE_HEIGHT > overY - GRID_SIZE && n.y < stubY + GRID_SIZE
      );
      const rightEdge = Math.max(...spanned.map(n => n.x + NODE_WIDTH)) + WIRE_DETOUR;
      const leftEdge = Math.min(...spanned.map(n => n.x)) - WIRE_DETOUR;
      const costRight = Math.abs(rightEdge - from.x) + Math.abs(rightEdge - tx);
      const costLeft = Math.abs(from.x - leftEdge) + Math.abs(tx - leftEdge);
      rightSide = costRight <= costLeft;
      baseDetour = rightSide ? rightEdge : leftEdge;
    } else {
      rightSide = from.x >= child.x + NODE_WIDTH / 2;
      baseDetour = rightSide ? child.x + NODE_WIDTH + WIRE_DETOUR : child.x - WIRE_DETOUR;
    }
    let fallback: { x: number; y: number }[] | null = null;
    for (let step = 0; step <= 20; step++) {
      const dx = baseDetour + (rightSide ? 1 : -1) * step * GRID_SIZE;
      const route = [from, {x: from.x, y: stubY}, {x: dx, y: stubY}, {x: dx, y: overY}, {x: tx, y: overY}, {x: tx, y: ty}];
      fallback ??= route;
      if (this._routeClear(route, ignore)) return route;
    }
    return fallback!;
  }

  private static _pathFrom(points: { x: number; y: number }[]): string {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  /**
   * Open output slots ("+" add-points) across all nodes — only rendered while
   * they're meaningful targets (dragging a step in, or moving a node). Idle
   * canvases show no stray stubs; branches start from the node's output port.
   */
  private _addPoints() {
    if (!this.movingNodeId && !this.dragType) return [];
    const points: { nodeId: string; port: string; px: number; py: number }[] = [];
    for (const node of this.nodes) {
      const {branches} = this._outputLayout(node);
      branches.forEach(b => {
        if (b.conn) return;
        points.push({nodeId: node.id, port: b.port.id, px: b.x, py: b.exitY + ADD_POINT_OFFSET});
      });
    }
    return points;
  }

  /** Midpoint "+" insert-points on each connected branch (hidden while moving). */
  private _wirePoints() {
    if (this.movingNodeId) return [];
    const midOffsets = this._elbowMidOffsets();
    const loops = loopConnections(this.nodes, this.connections);
    const points: { connectionId: string; px: number; py: number }[] = [];
    for (const node of this.nodes) {
      const {branches} = this._outputLayout(node);
      branches.forEach(b => {
        if (!b.conn || !b.child) return;
        // Sit the "+" on the route's longest segment so it stays on the wire
        // whatever shape the routing took.
        const offset = midOffsets.get(b.conn.id) ?? 0;
        const pts = this._routePoints(
          {x: b.x, y: b.exitY}, b.child, b.conn.target.port, offset, node.id, loops.has(b.conn));
        let seg = 0;
        let best = -1;
        for (let i = 0; i < pts.length - 1; i++) {
          const len = Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
          if (len > best) {
            best = len;
            seg = i;
          }
        }
        points.push({
          connectionId: b.conn.id,
          px: (pts[seg].x + pts[seg + 1].x) / 2,
          py: (pts[seg].y + pts[seg + 1].y) / 2,
        });
      });
    }
    return points;
  }

  /** Convert a canvas-space point to screen coordinates (for anchoring popovers). */
  private _screenFromCanvas(cx: number, cy: number) {
    const rect = this.getBoundingClientRect();
    return {clientX: rect.left + this.panX + cx * this.zoom, clientY: rect.top + this.panY + cy * this.zoom};
  }

  private _onAddClick(e: Event, nodeId: string, port: string) {
    e.stopPropagation();
    if (this.movingNodeId) {
      this._emit('flow-output-move-target', {nodeId, port});
      return;
    }
    // Start a stray branch from this output; it follows the cursor until it
    // attaches to a node or is cancelled (empty canvas click / Escape / blur).
    this._startLink(nodeId, port);
  }

  private _onWireAddClick(e: Event, connectionId: string, px: number, py: number) {
    e.stopPropagation();
    this._emit('flow-wire-pick', {connectionId, ...this._screenFromCanvas(px, py)});
  }

  // --- Step drop preview ---------------------------------------------------

  private _onViewportDragOver = (e: DragEvent) => {
    if (!e.dataTransfer?.types.includes(TYPE_MIME)) return;
    this._viewInitialised = true;
    e.preventDefault();
    // The preview follows the cursor everywhere; the cursor only shows the
    // add/"+" (copy) affordance when actually over a "+" slot, otherwise move.
    const overAddPoint = e.composedPath().some(el => el instanceof Element && el.classList.contains('add-point'));
    e.dataTransfer.dropEffect = overAddPoint ? 'copy' : 'move';
    const p = this.screenToCanvas(e.clientX, e.clientY);
    this._dropGhost = {x: snapToGrid(p.x - NODE_WIDTH / 2), y: snapToGrid(p.y - NODE_HEIGHT / 2)};
  };

  private _onViewportDragLeave = (e: DragEvent) => {
    const r = this.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      this._dropGhost = null;
    }
  };

  private _clearDropGhost = () => {
    this._dropGhost = null;
  };

  // A drop target must preventDefault on its own dragover to accept the drop.
  // No stopPropagation, so the viewport handler still tracks the preview.
  private _onAddPointDragOver = (e: DragEvent) => {
    if (!e.dataTransfer?.types.includes(TYPE_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  private _onAddDrop(e: DragEvent, nodeId: string, port: string) {
    const type = e.dataTransfer?.getData(TYPE_MIME);
    if (!type) return;
    e.preventDefault();
    e.stopPropagation();
    this._emit('flow-output-assign', {nodeId, port, type});
  }

  private _onWireDrop(e: DragEvent, connectionId: string) {
    const type = e.dataTransfer?.getData(TYPE_MIME);
    if (!type) return;
    e.preventDefault();
    e.stopPropagation();
    this._emit('flow-wire-assign', {connectionId, type});
  }

  // --- Toolbar ----------------------------------------------------------------

  private _zoomBy(delta: number) {
    this._viewInitialised = true;
    this.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(this.zoom + delta).toFixed(2)));
  }

  /** Canvas-space bounding box of the whole flow: nodes, branch drops, and notes. */
  private _contentBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.nodes.length && !this.notes.length) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const node of this.nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x + NODE_WIDTH);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y + NODE_HEIGHT);
      for (const b of this._outputLayout(node).branches) {
        minX = Math.min(minX, b.x - 70); // half a typical pill
        maxX = Math.max(maxX, b.x + 70);
        maxY = Math.max(maxY, b.exitY + ADD_POINT_OFFSET + 14);
      }
    }
    for (const note of this.notes) {
      minX = Math.min(minX, note.x);
      maxX = Math.max(maxX, note.x + (note.width ?? NOTE_WIDTH));
      minY = Math.min(minY, note.y);
      maxY = Math.max(maxY, note.y + (note.height ?? NOTE_HEIGHT));
    }
    return {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
  }

  /** Reset zoom and centre the flow in the viewport, zooming out to fit if needed. */
  private _resetView() {
    const rect = this.getBoundingClientRect();
    const bounds = this._contentBounds();
    if (!bounds || !rect.width || !rect.height) {
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
      return;
    }
    const PAD = 60;
    const fit = Math.min(
      1,
      (rect.width - PAD * 2) / bounds.width,
      (rect.height - PAD * 2) / bounds.height
    );
    this.zoom = Math.max(ZOOM_MIN, +fit.toFixed(2));
    this.panX = Math.round((rect.width - bounds.width * this.zoom) / 2 - bounds.x * this.zoom);
    this.panY = Math.round((rect.height - bounds.height * this.zoom) / 2 - bounds.y * this.zoom);
  }

  // --- Rendering --------------------------------------------------------------

  private _viewportCursorClass(): string {
    if (!this.drag) return '';
    if (this.drag.kind === 'note-resize') return 'resizing';
    return 'grabbing';
  }

  private _renderConnections() {
    const transform = `translate(${this.panX} ${this.panY}) scale(${this.zoom})`;
    const midOffsets = this._elbowMidOffsets();
    const loops = loopConnections(this.nodes, this.connections);
    const paths = [];

    // Open (unconnected, unlabelled) branches draw nothing while idle — their
    // stubs and "+" targets only appear mid-move/drag, since branches are
    // started from the node's output port.
    const showOpen = !!(this.movingNodeId || this.dragType);

    for (const node of this.nodes) {
      const {cx, by, busY, branches} = this._outputLayout(node);
      const active = branches.filter(b => (b.conn && b.child) || b.pillTop !== null || showOpen);
      if (!active.length) continue;

      // Stem from the node's bottom-centre down to the bus.
      paths.push(svg`<path class="wire" d="M ${cx} ${by} L ${cx} ${busY}"></path>`);

      // Horizontal bus spanning the visible branch endpoints.
      const xs = [cx, ...active.map(b => b.x)];
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      if (maxX - minX > 0.5) {
        paths.push(svg`<path class="wire" d="M ${minX} ${busY} L ${maxX} ${busY}"></path>`);
      }

      // One branch per output. Labelled outputs drop from the bus into a pill
      // (arrowhead), then continue from the pill to the child / open "+".
      active.forEach(b => {
        if (b.pillTop !== null) {
          paths.push(svg`<path class="wire" d="M ${b.x} ${busY} L ${b.x} ${b.pillTop}" marker-end="url(#flow-arrow)"></path>`);
        }
        if (b.conn && b.child) {
          const offset = midOffsets.get(b.conn.id) ?? 0;
          const loop = loops.has(b.conn);
          const pts = this._routePoints({x: b.x, y: b.exitY}, b.child, b.conn.target.port, offset, node.id, loop);
          paths.push(svg`<path
            class="wire ${loop ? 'wire--loop' : ''}"
            d="${ZnFlowCanvas._pathFrom(pts)}"
            marker-end="url(#${loop ? 'flow-arrow-loop' : 'flow-arrow'})"
          ></path>`);
        } else if (showOpen) {
          // Stub down to the contextual "+" target (only shown mid-move/drag).
          paths.push(svg`<path class="wire wire--stub" d="M ${b.x} ${b.exitY} L ${b.x} ${b.exitY + ADD_POINT_OFFSET - 11}"></path>`);
        }
      });
    }

    // The in-progress branch follows the cursor from the node's bottom port,
    // snapping onto the hovered target's input until it attaches or cancels.
    if (this._linking && this._linkPos) {
      const src = this.nodes.find(n => n.id === this._linking!.nodeId);
      if (src) {
        const from = {x: src.x + NODE_WIDTH / 2, y: src.y + NODE_HEIGHT};
        const target = this._linkTarget ? this.nodes.find(n => n.id === this._linkTarget) : undefined;
        const end = target
          ? this._inputAnchor(target, firstInputId(target, this._typeFor(target)) ?? '')
          : this._linkPos;
        paths.push(svg`<path class="wire wire--preview" d="M ${from.x} ${from.y} L ${end.x} ${end.y}" marker-end="url(#flow-arrow)"></path>`);
      }
    }

    return html`
      <svg class="connections" part="connections">
        <defs>
          <marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"
                  markerUnits="userSpaceOnUse">
            <path d="M0,0 L7,3 L0,6 Z"></path>
          </marker>
          <marker id="flow-arrow-loop" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"
                  markerUnits="userSpaceOnUse">
            <path d="M0,0 L7,3 L0,6 Z"></path>
          </marker>
        </defs>
        <g transform="${transform}">${paths}</g>
      </svg>
    `;
  }

  /**
   * Output labels (branch names) render as a clickable pill on their branch;
   * hovering slides out a delete button that removes the branch (and its wire).
   * Keyed by node+port so deleting one never hands its DOM (with its hovered,
   * visible delete button) to a different pill — which flickered on screen.
   */
  private _renderBranchPills() {
    const loops = loopConnections(this.nodes, this.connections);
    const items: {
      key: string; nodeId: string; portId: string; label: string; x: number; top: number; height: number; loop: boolean;
    }[] = [];
    for (const node of this.nodes) {
      const {branches} = this._outputLayout(node);
      for (const b of branches) {
        if (b.pillTop === null) continue;
        items.push({
          key: `${node.id}:${b.port.id}`,
          nodeId: node.id,
          portId: b.port.id,
          label: b.port.label ?? '',
          x: b.x,
          top: b.pillTop,
          height: b.pillH,
          loop: !!b.conn && loops.has(b.conn),
        });
      }
    }
    return repeat(
      items,
      i => i.key,
      i => html`
        <div
          class="branch-pill-wrap"
          style="left:${i.x}px;top:${i.top}px;height:${i.height}px"
        >
          <button
            class="branch-pill ${i.key === this.selectedBranch ? 'branch-pill--selected' : ''} ${i.loop ? 'branch-pill--loop' : ''}"
            title="Configure branch"
            @pointerdown="${(e: PointerEvent) => e.button === 0 && e.stopPropagation()}"
            @click="${(e: Event) => {
              e.stopPropagation();
              this._emit('flow-branch-pick', {nodeId: i.nodeId, port: i.portId});
            }}"
          >${i.label}</button>
          <button
            class="branch-pill-delete"
            title="Delete branch"
            @pointerdown="${(e: PointerEvent) => e.button === 0 && e.stopPropagation()}"
            @click="${(e: Event) => {
              e.stopPropagation();
              this._emit('flow-branch-delete', {nodeId: i.nodeId, port: i.portId});
            }}"
          >
            <zn-icon src="x@lu" size="14"></zn-icon>
          </button>
        </div>
      `
    );
  }

  private _renderAddPoints() {
    const moving = !!this.movingNodeId;
    return this._addPoints().map(
      p => html`
        <button
          class="add-point ${moving ? 'add-point--target' : ''}"
          style="transform:translate(${p.px}px, ${p.py}px)"
          title="${moving ? 'Move here' : 'Start a branch'}"
          @pointerdown="${(e: PointerEvent) => e.button === 0 && e.stopPropagation()}"
          @click="${(e: Event) => this._onAddClick(e, p.nodeId, p.port)}"
          @dragover="${this._onAddPointDragOver}"
          @drop="${(e: DragEvent) => this._onAddDrop(e, p.nodeId, p.port)}"
        >
          <zn-icon src="plus@lu" size="16"></zn-icon>
        </button>
      `
    );
  }

  private _renderWireAddPoints() {
    return this._wirePoints().map(
      p => html`
        <button
          class="add-point add-point--wire"
          style="transform:translate(${p.px}px, ${p.py}px)"
          title="Insert a step here"
          @pointerdown="${(e: PointerEvent) => e.button === 0 && e.stopPropagation()}"
          @click="${(e: Event) => this._onWireAddClick(e, p.connectionId, p.px, p.py)}"
          @dragover="${this._onAddPointDragOver}"
          @drop="${(e: DragEvent) => this._onWireDrop(e, p.connectionId)}"
        >
          <zn-icon src="plus@lu" size="14"></zn-icon>
        </button>
      `
    );
  }

  private _renderDropGhost() {
    if (!this._dropGhost) return '';
    const type = this.dragType ? this.registry?.get(this.dragType) : undefined;
    return html`
      <div
        class="drop-ghost"
        style="transform:translate(${this._dropGhost.x}px, ${this._dropGhost.y}px);width:${NODE_WIDTH}px;height:${NODE_HEIGHT}px"
      >
        <div class="drop-ghost__icon" style="--node-accent:${type?.color ?? 'rgb(var(--zn-color-primary))'}">
          <zn-icon src="${type?.icon ?? 'circle'}" library="${ifDefined(type?.iconLibrary)}" size="20"></zn-icon>
        </div>
        <span class="drop-ghost__label">${type?.label ?? 'New step'}</span>
      </div>
    `;
  }

  private _startNoteGrab(e: PointerEvent, note: FlowNote) {
    if (e.button !== 0) return;
    e.stopPropagation();
    const p = this.screenToCanvas(e.clientX, e.clientY);
    this.drag = {kind: 'note', id: note.id, offX: p.x - note.x, offY: p.y - note.y};
    this._dragMoved = false;
    this._setupWindow('grabbing');
  }

  private _startNoteResize(e: PointerEvent, note: FlowNote) {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    this.drag = {kind: 'note-resize', id: note.id};
    this._dragMoved = false;
    this._setupWindow('nwse-resize');
  }

  private _renderNotes() {
    return repeat(
      this.notes,
      n => n.id,
      note => html`
        <div
          class="note"
          style="left:${note.x}px;top:${note.y}px;width:${note.width ?? NOTE_WIDTH}px;height:${note.height ?? NOTE_HEIGHT}px"
        >
          <div class="note__bar" @pointerdown="${(e: PointerEvent) => this._startNoteGrab(e, note)}">
            <button
              class="note__close"
              @click="${() => this._emit('flow-note-delete', {noteId: note.id})}"
            >×
            </button>
          </div>
          <textarea
            class="note__text"
            .value="${note.text}"
            placeholder="Add a note…"
            @pointerdown="${(e: Event) => e.stopPropagation()}"
            @change="${(e: Event) => this._emit('flow-note-change', {
              noteId: note.id,
              text: (e.target as HTMLTextAreaElement).value
            })}"
          ></textarea>
          <span class="note__resize" @pointerdown="${(e: PointerEvent) => this._startNoteResize(e, note)}"></span>
        </div>
      `
    );
  }

  render() {
    const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    return html`
      <div
        part="base"
        class="viewport ${this._viewportCursorClass()} ${this.movingNodeId ? 'moving' : ''} ${this.dragType ? 'step-dragging' : ''} ${this._linking ? 'linking' : ''}"
        @pointerdown="${this._onBackgroundPointerDown}"
        @dragover="${this._onViewportDragOver}"
        @dragleave="${this._onViewportDragLeave}"
        @drop="${this._clearDropGhost}"
      >
        ${this._renderConnections()}

        <div class="layer" style="transform:${transform}">
          ${repeat(
      this.nodes,
      n => n.id,
      node => html`
              <div class="node-pos" style="transform:translate(${node.x}px, ${node.y}px)">
                <zn-flow-node
                  .node="${node}"
                  .type="${this._typeFor(node)}"
                  ?selected="${node.id === this.selectedNodeId}"
                  ?error="${this.errorNodes.has(node.id)}"
                  ?dragging="${this.drag?.kind === 'node' && this.drag.id === node.id}"
                  ?link-target="${node.id === this._linkTarget}"
                ></zn-flow-node>
              </div>
            `
    )}
          ${this._renderDropGhost()}
          ${this._renderBranchPills()}
          ${this._renderAddPoints()}
          ${this._renderWireAddPoints()}
          ${this._renderNotes()}
        </div>

        <div part="toolbar" class="toolbar toolbar--history" @pointerdown="${(e: Event) => e.stopPropagation()}">
          <zn-button icon="undo@lu" icon-size="18" icon-button="small" plain
                     @click="${() => this._emit('flow-undo')}"></zn-button>
          <zn-button icon="redo@lu" icon-size="18" icon-button="small" plain
                     @click="${() => this._emit('flow-redo')}"></zn-button>
          <zn-button icon="sticky-note@lu" icon-size="18" icon-button="small" plain
                     @click="${() => this._emit('flow-add-note')}"></zn-button>
          <zn-button icon="network@lu" icon-size="18" icon-button="small" plain title="Untangle"
                     @click="${() => this._emit('flow-untangle')}"></zn-button>
        </div>

        <div part="toolbar" class="toolbar toolbar--zoom" @pointerdown="${(e: Event) => e.stopPropagation()}">
          <zn-button icon="plus@lu" icon-size="18" icon-button="small" plain
                     @click="${() => this._zoomBy(ZOOM_STEP)}"></zn-button>
          <zn-button icon="locate-fixed@lu" icon-size="18" icon-button="small" plain
                     @click="${() => this._resetView()}"></zn-button>
          <zn-button icon="minus@lu" icon-size="18" icon-button="small" plain
                     @click="${() => this._zoomBy(-ZOOM_STEP)}"></zn-button>
        </div>
      </div>
    `;
  }
}
