import {
  BRANCH_SPREAD,
  type FlowConnection,
  type FlowNodeInstance,
  type FlowNodeType,
  type FlowState,
  loopConnections,
  NODE_WIDTH,
  nodeOutputs,
  snapToGrid,
} from './flow.types';

/** Horizontal gap between node origins within a layer. */
export const LAYOUT_H_GAP = NODE_WIDTH + 80;
/** Vertical gap between layers — clears the bus, a branch pill, and the wire run-in. */
export const LAYOUT_V_GAP = 300;
const MARGIN = 40;

const avg = (ns: number[]) => ns.reduce((a, b) => a + b, 0) / ns.length;

/**
 * "Untangle" auto-layout: assigns every node a position in a layered, top-down
 * flow. Layers come from the longest path back to a root (the graph is a DAG —
 * connects are cycle-guarded), ordering within a layer follows where each node's
 * parents sit (barycenter, respecting the parents' output-port order), and the
 * coordinate passes centre children under the branch anchors they hang from.
 * Returns the new positions; the caller applies them.
 */
export function untangledPositions(
  state: FlowState,
  typeOf: (type: string) => FlowNodeType | undefined
): Map<string, { x: number; y: number }> {
  const out = new Map<string, { x: number; y: number }>();
  const nodes = state.nodes;
  if (!nodes.length) return out;

  const byId = new Map(nodes.map(n => [n.id, n] as const));
  const incoming = new Map<string, FlowConnection[]>(nodes.map(n => [n.id, []]));
  const outgoing = new Map<string, FlowConnection[]>(nodes.map(n => [n.id, []]));
  for (const c of state.connections) {
    if (!byId.has(c.source.node) || !byId.has(c.target.node)) continue;
    incoming.get(c.target.node)!.push(c);
    outgoing.get(c.source.node)!.push(c);
  }

  // 1. Loops are allowed in the flow, but layering needs a DAG: ignore each
  //    cycle's back-edge. Longest-path layering then puts roots (and isolated
  //    nodes) at 0 and every other node one layer below its deepest parent —
  //    loop wires simply travel back up.
  const backEdges = loopConnections(nodes, state.connections);

  const layerOf = new Map<string, number>();
  const layerFor = (id: string): number => {
    const known = layerOf.get(id);
    if (known !== undefined) return known;
    const ins = incoming.get(id)!.filter(c => !backEdges.has(c));
    const layer = ins.length ? Math.max(...ins.map(c => layerFor(c.source.node))) + 1 : 0;
    layerOf.set(id, layer);
    return layer;
  };
  nodes.forEach(n => layerFor(n.id));

  const layers: FlowNodeInstance[][] = Array.from(
    {length: Math.max(...layerOf.values()) + 1},
    () => []
  );
  nodes.forEach(n => layers[layerOf.get(n.id)!].push(n));

  // The canvas-space x offset of a connection's branch anchor from its source
  // node's origin (branches spread symmetrically around the bottom centre).
  const branchOffset = (c: FlowConnection): number => {
    const parent = byId.get(c.source.node)!;
    const outputs = nodeOutputs(parent, typeOf(parent.type));
    const count = Math.max(outputs.length, 1);
    const idx = Math.max(outputs.findIndex(p => p.id === c.source.port), 0);
    return count === 1 ? 0 : (idx - (count - 1) / 2) * BRANCH_SPREAD;
  };

  // 2. Ordering: roots keep their left-to-right order; deeper layers sort by the
  //    mean of their parents' order (nudged by which output port they hang from),
  //    which keeps siblings in port order and reduces wire crossings.
  const orderIdx = new Map<string, number>();
  layers[0].sort((a, b) => a.x - b.x).forEach((n, i) => orderIdx.set(n.id, i));
  for (let l = 1; l < layers.length; l++) {
    const bary = (n: FlowNodeInstance) => {
      // Forward parents only — loops don't influence ordering.
      const ordered = incoming.get(n.id)!.filter(c => !backEdges.has(c) && orderIdx.has(c.source.node));
      if (!ordered.length) return 0;
      return avg(ordered.map(c => {
        const parent = byId.get(c.source.node)!;
        const outputs = nodeOutputs(parent, typeOf(parent.type));
        const count = Math.max(outputs.length, 1);
        const idx = Math.max(outputs.findIndex(p => p.id === c.source.port), 0);
        return orderIdx.get(parent.id)! + (idx + 1) / (count + 1) - 0.5;
      }));
    };
    layers[l].sort((a, b) => bary(a) - bary(b)).forEach((n, i) => orderIdx.set(n.id, i));
  }

  // 3. Coordinates: place a layer at each node's desired x, resolving overlaps
  //    left-to-right, then shift the layer back so it stays centred on the wish.
  const xs = new Map<string, number>();
  const place = (layer: FlowNodeInstance[], desired: (n: FlowNodeInstance) => number | null) => {
    const wishes = layer.map(n => desired(n) ?? xs.get(n.id) ?? 0);
    let prev = -Infinity;
    const placed = wishes.map(w => (prev = Math.max(w, prev + LAYOUT_H_GAP)));
    const shift = avg(placed.map((x, i) => x - wishes[i]));
    layer.forEach((n, i) => xs.set(n.id, placed[i] - shift));
  };

  const parentWish = (n: FlowNodeInstance): number | null => {
    // Forward parents only, and only ones already placed (a loop's back-edge
    // parent sits in a deeper layer).
    const ins = incoming.get(n.id)!.filter(c => !backEdges.has(c) && xs.has(c.source.node));
    return ins.length ? avg(ins.map(c => xs.get(c.source.node)! + branchOffset(c))) : null;
  };
  const childWish = (n: FlowNodeInstance): number | null => {
    const outs = outgoing.get(n.id)!.filter(c => !backEdges.has(c) && xs.has(c.target.node));
    return outs.length ? avg(outs.map(c => xs.get(c.target.node)! - branchOffset(c))) : null;
  };

  layers[0].forEach((n, i) => xs.set(n.id, i * LAYOUT_H_GAP));
  for (let l = 1; l < layers.length; l++) place(layers[l], parentWish);   // down
  for (let l = layers.length - 2; l >= 0; l--) place(layers[l], childWish); // up: recentre over children
  for (let l = 1; l < layers.length; l++) place(layers[l], parentWish);   // settle

  // Safety net: never emit a non-finite coordinate — a NaN here would leave
  // nodes unpositioned (stacked at the origin).
  const finite = [...xs.values()].filter(Number.isFinite);
  const minX = finite.length ? Math.min(...finite) : 0;
  nodes.forEach(n => {
    const raw = xs.get(n.id);
    out.set(n.id, {
      x: snapToGrid(Number.isFinite(raw) ? (raw as number) - minX + MARGIN : MARGIN),
      y: MARGIN + layerOf.get(n.id)! * LAYOUT_V_GAP,
    });
  });
  return out;
}
