import type {TemplateResult} from 'lit';

/** Which steps-panel tab a node type appears under. */
export type FlowGroup = 'entrypoint' | 'trigger' | 'action' | 'rule';

/** A single connection point on a node (input or output). */
export interface FlowPort {
  id: string;
  /** Branch name shown on the wire pill (outputs). */
  label?: string;
  /** Branch configuration (filters / conditions for taking this path), edited via the branch editor. */
  data?: Record<string, unknown>;
}

/** A choice in a filter field's operator or value dropdown. */
export interface FlowFilterOption {
  value: string;
  /** Display text; defaults to the value. */
  label?: string;
}

/** One control row of a branch filter (e.g. "[in the last ▾] [6] [month(s) ▾]"). */
export interface FlowFilterField {
  id: string;
  /** Leading text shown before the controls. */
  label?: string;
  /** The value control. Defaults to 'select' when `options` are given, else 'text'. */
  type?: 'select' | 'number' | 'text';
  /** Operator choices shown before the value (e.g. "at least" / "in the last" / "is equal to"). */
  operators?: FlowFilterOption[];
  /** Value choices for a 'select' field. */
  options?: FlowFilterOption[];
  /** Choices for an adjustable trailing unit dropdown (e.g. day(s) / month(s)); shown instead of `suffix`. */
  units?: FlowFilterOption[];
  /** Trailing unit text (e.g. "time(s)") when the unit isn't adjustable. */
  suffix?: string;
  placeholder?: string;
  /** Initial value when the filter is added to a condition. */
  value?: string | number;
}

/**
 * Default display labels for well-known operator keys, used when a declaration
 * provides a value but no text (e.g. `<zn-flow-operator value="gte">`).
 */
const OPERATOR_LABELS: Record<string, string> = {
  eq: 'Is Equal To',
  neq: 'Is Not Equal To',
  gt: 'Greater Than',
  gte: 'Greater Than or Equal To',
  lt: 'Less Than',
  lte: 'Less Than or Equal To',
  is: 'Is',
  'is-not': 'Is Not',
  in: 'Is One Of',
  'not-in': 'Is Not One Of',
  contains: 'Contains',
  'not-contains': 'Does Not Contain',
  'starts-with': 'Starts With',
  'ends-with': 'Ends With',
  empty: 'Is Empty',
  'not-empty': 'Is Not Empty',
  within: 'Within the Last',
  before: 'Before the Last',
  between: 'Between',
  matches: 'Matches',
};

/** An operator's display label: its own, a well-known default for its value, else the value itself. */
export function operatorLabel(option: FlowFilterOption): string {
  return option.label ?? OPERATOR_LABELS[option.value] ?? option.value;
}

/** A filter offered by the built-in branch conditions editor. */
export interface FlowBranchFilter {
  id: string;
  label: string;
  description?: string;
  fields: FlowFilterField[];
}

/** One configured condition: a filter plus its per-field operator / value / unit entries. */
export interface FlowBranchCondition {
  /** The `FlowBranchFilter` id this condition uses. */
  filter: string;
  values: Record<string, { operator?: string; value?: string | number; unit?: string }>;
}

/**
 * A branch's full condition set as persisted on the output port's
 * `data.conditions`: the outer array is OR-ed, each inner group AND-ed.
 */
export type FlowBranchConditions = FlowBranchCondition[][];

const NO_CONDITIONS: FlowBranchConditions = [];

/** Read the conditions persisted on an output port (`port.data.conditions`). */
export function branchConditions(port: FlowPort): FlowBranchConditions {
  const raw = port.data?.conditions;
  return Array.isArray(raw) ? (raw as FlowBranchConditions) : NO_CONDITIONS;
}

/**
 * Describes a kind of node that can be placed on the canvas. Consumers register
 * these with the builder to extend it — the steps panel and inspector are driven
 * entirely by the registered types, so no library changes are needed to add a
 * new custom component.
 */
export interface FlowNodeType {
  /** Unique key, persisted on every placed node. */
  type: string;
  label: string;
  /** Steps-panel tab the type is listed under. */
  group: FlowGroup;
  /** Collapsible category within the tab (e.g. "Contacts"). */
  category?: string;
  /** zn-icon `src` (e.g. "mail" or "mail@lu"). */
  icon?: string;
  /** zn-icon `library`, when not encoded in `icon`. */
  iconLibrary?: string;
  /** Accent color for the icon tile / ports — any CSS color. */
  color?: string;
  description?: string;
  /** Input ports. Defaults to a single unlabelled input. Pass `[]` for a trigger. */
  inputs?: FlowPort[];
  /** Output ports. Defaults to a single unlabelled output. e.g. TRUE/FALSE for a split. */
  outputs?: FlowPort[];
  /** Initial `data` for a freshly placed node. */
  defaultData?: Record<string, unknown>;
  /**
   * Filters offered by the built-in branch conditions editor for this type's
   * output branches (AND/OR groups persisted on the port's `data.conditions`).
   * Ignored when `renderBranchConfig` is set.
   */
  branchFilters?: FlowBranchFilter[];
  /** Renders the inspector body for a selected node of this type. */
  renderConfig?: (node: FlowNodeInstance, update: (data: Record<string, unknown>) => void) => TemplateResult;
  /** Renders the branch editor body (filters / conditions) for one of this type's output branches. */
  renderBranchConfig?: (
    node: FlowNodeInstance,
    port: FlowPort,
    update: (patch: Partial<FlowPort>) => void
  ) => TemplateResult;
}

/** A node placed on the canvas. */
export interface FlowNodeInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  /** Overrides the type label when set. */
  label?: string;
  /** Per-instance input ports; overrides the type's when set (user-configurable). */
  inputs?: FlowPort[];
  /** Per-instance output ports; overrides the type's when set (user-configurable). */
  outputs?: FlowPort[];
  data: Record<string, unknown>;
}

export interface FlowEndpoint {
  node: string;
  port: string;
}

export interface FlowConnection {
  id: string;
  source: FlowEndpoint;
  target: FlowEndpoint;
}

export interface FlowNote {
  id: string;
  x: number;
  y: number;
  text: string;
  width?: number;
  height?: number;
}

/** The complete serialisable state of a flow. */
export interface FlowState {
  nodes: FlowNodeInstance[];
  connections: FlowConnection[];
  notes: FlowNote[];
}

export const DEFAULT_INPUT: FlowPort = {id: 'in'};
export const DEFAULT_OUTPUT: FlowPort = {id: 'out'};

/**
 * Sentinel port id for the extra "+" a fully-connected node always offers.
 * Using it (attaching a stray branch, dropping a step, or moving a node onto it)
 * materialises a real output port on the node first.
 */
export const NEW_OUTPUT_PORT = '__new__';

/** Drag-and-drop MIME used to carry a node type id from the steps panel to the canvas. */
export const FLOW_TYPE_MIME = 'application/x-zn-flow-type';

let _emptyDragImage: HTMLImageElement | undefined;

/**
 * A cached 1×1 transparent image. Pass it to `dataTransfer.setDragImage()` to
 * suppress the browser's default drag image — the builder renders its own
 * in-canvas drop preview instead.
 */
export function emptyDragImage(): HTMLImageElement {
  if (!_emptyDragImage) {
    _emptyDragImage = new Image();
    _emptyDragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  return _emptyDragImage;
}

/**
 * Fixed node geometry. Cards are a uniform size so the canvas can compute exact
 * port coordinates from a node's position alone — no DOM measurement, which
 * keeps connection rendering and hit-testing reliable under pan/zoom.
 */
// Node cards and the branch geometry hanging off them are whole grid units
// (GRID_SIZE multiples), so ports, buses, and pills always land on the grid.
export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 60;

/**
 * Horizontal spacing between the branches of a multi-output node. Matches the
 * untangle layer gap (card width + 80) so two sibling children fit side by side
 * directly under their drops — straight downward wires, no elbows.
 */
export const BRANCH_SPREAD = NODE_WIDTH + 80;

// Branch geometry below a node: outputs fork from a stem onto a horizontal bus,
// and labelled outputs drop from it into a name pill.
export const BUS_OFFSET = 40;
export const PILL_DROP = 40;
export const PILL_HEIGHT = 40;
export const PILL_MAX_WIDTH = 240;
/** Extra pill height per wrapped line (matches the pill's CSS line-height). */
export const PILL_LINE_HEIGHT = 20;

/** Wire clearance kept between a branch pill's exit and the child card it feeds. */
const PILL_APPROACH = 20;
/** The least wire kept above a sole output's pill in a tight gap. */
const PILL_MIN_STUB = 20;

/**
 * Canvas y of a branch pill's top edge. A pill on a wire to a child below is
 * centred along the run from its node's bottom to the child's top — equal wire
 * above and below, however long or tight. A sole output's wire is a straight
 * stem with no bus to respect, so its pill may rise above the bus line to stay
 * centred; fan branches stop at the bus. Open branches and loop/side wires
 * keep the fixed drop below the bus.
 */
export function branchPillTop(
  node: Pick<FlowNodeInstance, 'y'>,
  pillH: number,
  child?: Pick<FlowNodeInstance, 'y'>,
  soleOutput = false
): number {
  const bottom = node.y + NODE_HEIGHT;
  const busY = bottom + BUS_OFFSET;
  if (child && child.y >= bottom) {
    const minTop = soleOutput ? bottom + PILL_MIN_STUB : busY;
    const centered = Math.round((bottom + child.y) / 2 - pillH / 2);
    return Math.max(minTop, Math.min(centered, child.y - PILL_APPROACH - pillH));
  }
  return busY + PILL_DROP;
}

/**
 * Estimated pill box for a branch name: sizes to the text up to the max width,
 * then hard-wraps — the height grows a grid unit per extra line. The pill DOM
 * sizes itself from its content (fixed padding); this estimate drives the wire
 * geometry and collision footprints, so it uses the same ~7.2px/char metric.
 */
export function pillSize(label: string): { w: number; h: number } {
  const textWidth = label.length * 7.2;
  const lines = Math.max(1, Math.ceil(textWidth / (PILL_MAX_WIDTH - 36)));
  return {
    w: Math.min(PILL_MAX_WIDTH, Math.round(36 + textWidth)),
    h: PILL_HEIGHT + (lines - 1) * PILL_LINE_HEIGHT,
  };
}

/** The grid everything on the canvas snaps to (matches the dotted background). */
export const GRID_SIZE = 20;

export function snapToGrid(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

// Clearance margins per obstacle kind — two cards keep 2 × CARD_MARGIN apart,
// while pills allow tighter packing.
const CARD_MARGIN = 10;
const PILL_MARGIN = 4;
/**
 * Extra height a pill's footprint claims below itself: room for the wire "+"
 * between the pill and its child's input port. Keeps drags from compressing a
 * branch past the point where the "+" fits (with the grid, the tightest
 * card-to-card gap across a pill becomes 120).
 */
const PILL_PLUS_ROOM = 20;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Clearance this rect claims around itself. */
  m: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  const gap = a.m + b.m;
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap
    && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}

/** A function resolving a node type key to its registered type. */
export type FlowTypeOf = (type: string) => FlowNodeType | undefined;

/**
 * Canvas x for each of a node's branch drops: the natural fan position under
 * the source. Pills never shift sideways to chase their child — the wire into
 * a pill is always a straight vertical, and any lateral offset to the child is
 * taken up by the elbow below the pill (which still enters the child from
 * straight above).
 */
export function branchDropXs(node: FlowNodeInstance, typeOf: FlowTypeOf): number[] {
  const outputs = nodeOutputs(node, typeOf(node.type));
  const cx = node.x + NODE_WIDTH / 2;
  return outputs.map((_, i) =>
    Math.round(cx + (outputs.length === 1 ? 0 : (i - (outputs.length - 1) / 2) * BRANCH_SPREAD)));
}

/**
 * The rects a node occupies on the canvas: its card plus each branch-name pill,
 * at the exact positions the canvas draws them.
 */
export function nodeObstacles(
  node: FlowNodeInstance,
  typeOf: FlowTypeOf,
  nodes: FlowNodeInstance[],
  connections: FlowConnection[]
): Rect[] {
  const rects: Rect[] = [{x: node.x, y: node.y, w: NODE_WIDTH, h: NODE_HEIGHT, m: CARD_MARGIN}];
  const ports = nodeOutputs(node, typeOf(node.type));
  const xs = branchDropXs(node, typeOf);
  ports.forEach((port, i) => {
    if (!port.label) return;
    const size = pillSize(port.label);
    const conn = connections.find(c => c.source.node === node.id && c.source.port === port.id);
    const child = conn ? nodes.find(n => n.id === conn.target.node) : undefined;
    rects.push({
      x: xs[i] - size.w / 2,
      y: branchPillTop(node, size.h, child, ports.length === 1),
      w: size.w,
      h: size.h + PILL_PLUS_ROOM,
      m: PILL_MARGIN,
    });
  });
  return rects;
}

/** Whether two nodes' footprints (cards and branch pills) would overlap. */
export function nodesCollide(
  a: FlowNodeInstance,
  b: FlowNodeInstance,
  typeOf: FlowTypeOf,
  nodes: FlowNodeInstance[],
  connections: FlowConnection[]
): boolean {
  const rectsA = nodeObstacles(a, typeOf, nodes, connections);
  return nodeObstacles(b, typeOf, nodes, connections).some(rb => rectsA.some(ra => rectsOverlap(ra, rb)));
}

/**
 * Whether any of `node`'s branch pills overlap another node's footprint. A
 * pill centres between its node and the connected child, so moving the CHILD
 * moves the pill — drags use this to check the moved node's parents, whose
 * displaced pills could land on a third node.
 */
export function pillsCollide(
  node: FlowNodeInstance,
  typeOf: FlowTypeOf,
  nodes: FlowNodeInstance[],
  connections: FlowConnection[]
): boolean {
  const pills = nodeObstacles(node, typeOf, nodes, connections).slice(1);
  if (!pills.length) return false;
  return nodes.some(o =>
    o.id !== node.id
    && nodeObstacles(o, typeOf, nodes, connections).some(rb => pills.some(ra => rectsOverlap(ra, rb))));
}

/** Whether a bare card placed at `pos` would hit any of `node`'s footprint. */
export function cardCollides(
  pos: { x: number; y: number },
  node: FlowNodeInstance,
  typeOf: FlowTypeOf,
  nodes: FlowNodeInstance[],
  connections: FlowConnection[]
): boolean {
  const card: Rect = {x: pos.x, y: pos.y, w: NODE_WIDTH, h: NODE_HEIGHT, m: CARD_MARGIN};
  return nodeObstacles(node, typeOf, nodes, connections).some(r => rectsOverlap(card, r));
}

export const NOTE_WIDTH = 200;
export const NOTE_HEIGHT = 120;
export const NOTE_MIN_WIDTH = 120;
export const NOTE_MIN_HEIGHT = 80;

/** Canvas-space coordinate of a port anchor on a node of the given size. */
export function portAnchor(
  node: Pick<FlowNodeInstance, 'x' | 'y'>,
  side: 'in' | 'out',
  index: number,
  count: number
): { x: number; y: number } {
  return {
    x: node.x + (NODE_WIDTH * (index + 1)) / (count + 1),
    y: node.y + (side === 'in' ? 0 : NODE_HEIGHT),
  };
}

export function emptyFlowState(): FlowState {
  return {nodes: [], connections: [], notes: []};
}

/** Resolve a type's inputs, falling back to a single default input. */
export function typeInputs(type: FlowNodeType | undefined): FlowPort[] {
  if (!type) return [DEFAULT_INPUT];
  return type.inputs ?? [DEFAULT_INPUT];
}

/** Resolve a type's outputs, falling back to a single default output. */
export function typeOutputs(type: FlowNodeType | undefined): FlowPort[] {
  if (!type) return [DEFAULT_OUTPUT];
  return type.outputs ?? [DEFAULT_OUTPUT];
}

/** A node's effective inputs — its per-instance override, else the type's. */
export function nodeInputs(node: FlowNodeInstance, type: FlowNodeType | undefined): FlowPort[] {
  return node.inputs ?? typeInputs(type);
}

/** A node's effective outputs — its per-instance override, else the type's. */
export function nodeOutputs(node: FlowNodeInstance, type: FlowNodeType | undefined): FlowPort[] {
  return node.outputs ?? typeOutputs(type);
}

/** A node's first input id, or null when it accepts no inputs (an entrypoint). */
export function firstInputId(node: FlowNodeInstance, type: FlowNodeType | undefined): string | null {
  return nodeInputs(node, type)[0]?.id ?? null;
}

// --- Graph helpers -----------------------------------------------------------
// Every output port holds at most one downstream connection, but a node may
// receive any number of incoming connections (fan-in), and branches may loop
// back to earlier steps — the flow is a general directed graph. Traversals
// guard against revisiting, so cycles are safe.

/** The connection occupying a given output port, if any. */
export function connectionAt(state: FlowState, nodeId: string, port: string): FlowConnection | undefined {
  return state.connections.find(c => c.source.node === nodeId && c.source.port === port);
}

/** Whether an output port has no downstream connection (shows a "+"). */
export function isOpenOutput(state: FlowState, nodeId: string, port: string): boolean {
  return !connectionAt(state, nodeId, port);
}

/** All node ids reachable downstream from a node (excluding the node itself). */
export function descendantIds(state: FlowState, nodeId: string): Set<string> {
  const seen = new Set<string>();
  const walk = (id: string) => {
    for (const c of state.connections) {
      if (c.source.node === id && !seen.has(c.target.node)) {
        seen.add(c.target.node);
        walk(c.target.node);
      }
    }
  };
  walk(nodeId);
  return seen;
}

/**
 * Whether connecting `sourceNode`'s output to `targetNode` would create a cycle —
 * i.e. the target is the source itself or already downstream of it. The builder
 * allows loops, but consumers can use this to validate flows that must stay acyclic.
 */
export function wouldCreateCycle(state: FlowState, sourceNode: string, targetNode: string): boolean {
  return sourceNode === targetNode || descendantIds(state, targetNode).has(sourceNode);
}

/**
 * The connections that close loops: each cycle's back-edge in a DFS forest
 * grown from the roots (every cycle contains exactly one such edge). Used to
 * render loop wires distinctly and to keep the untangle layering acyclic.
 */
export function loopConnections(
  nodes: FlowNodeInstance[],
  connections: FlowConnection[]
): Set<FlowConnection> {
  const ids = new Set(nodes.map(n => n.id));
  const outgoing = new Map<string, FlowConnection[]>(nodes.map(n => [n.id, []]));
  const hasIncoming = new Set<string>();
  for (const c of connections) {
    if (!ids.has(c.source.node) || !ids.has(c.target.node)) continue;
    outgoing.get(c.source.node)!.push(c);
    hasIncoming.add(c.target.node);
  }
  const back = new Set<FlowConnection>();
  const visited = new Set<string>();
  const onStack = new Set<string>();
  const dfs = (id: string) => {
    visited.add(id);
    onStack.add(id);
    for (const c of outgoing.get(id) ?? []) {
      if (onStack.has(c.target.node)) back.add(c);
      else if (!visited.has(c.target.node)) dfs(c.target.node);
    }
    onStack.delete(id);
  };
  nodes.filter(n => !hasIncoming.has(n.id)).forEach(n => dfs(n.id));
  nodes.forEach(n => {
    if (!visited.has(n.id)) dfs(n.id); // components with no root (pure cycles)
  });
  return back;
}
