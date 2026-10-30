import {
  BRANCH_SPREAD,
  branchDropXs,
  branchPillTop,
  BUS_OFFSET,
  type FlowConnection,
  type FlowNodeInstance,
  type FlowNodeType,
  NODE_HEIGHT,
  NODE_WIDTH,
} from './flow.types';
import {expect} from '@open-wc/testing';

const TRIPLE: FlowNodeType = {
  type: 'step',
  label: 'Step',
  group: 'action',
  outputs: [
    {id: 'success', label: 'Success'},
    {id: 'failure', label: 'Failure'},
    {id: 'skip', label: 'Skip'},
  ],
};

const typeOf = () => TRIPLE;

const node = (id: string, x: number, y = 0): FlowNodeInstance => ({id, type: 'step', x, y, data: {}});

const wire = (from: string, port: string, to = 'child'): FlowConnection =>
  ({id: `c-${from}-${port}`, source: {node: from, port}, target: {node: to, port: 'in'}});

const centreOf = (n: FlowNodeInstance) => n.x + NODE_WIDTH / 2;

describe('flow branch geometry', () => {
  it('should keep a fully wired fan on the classic spread', () => {
    const source = node('n1', 400);
    const xs = branchDropXs(source, typeOf, [
      wire('n1', 'success', 'a'), wire('n1', 'failure', 'b'), wire('n1', 'skip', 'c'),
    ]);

    expect(xs).to.deep.equal([
      centreOf(source) - BRANCH_SPREAD,
      centreOf(source),
      centreOf(source) + BRANCH_SPREAD,
    ]);
  });

  it('should run a lone wired branch straight down, whatever else the step declares', () => {
    const source = node('n1', 400);
    const xs = branchDropXs(source, typeOf, [wire('n1', 'success')]);

    // Success is wired, so it keeps the node's centre line and its child sits
    // directly below; the two spare branches tuck in beside it.
    expect(xs[0]).to.equal(centreOf(source));
    expect(xs[1]).to.be.greaterThan(xs[0]);
    expect(xs[2]).to.be.greaterThan(xs[1]);
  });

  it('should give a spare branch its pill\'s width, not a whole child lane', () => {
    const source = node('n1', 400);
    const wired = branchDropXs(source, typeOf, [
      wire('n1', 'success', 'a'), wire('n1', 'failure', 'b'), wire('n1', 'skip', 'c'),
    ]);
    const spare = branchDropXs(source, typeOf, [wire('n1', 'success')]);

    // Same three branches, two of them unused: the fan collapses to well under
    // half of what three child lanes claim.
    expect(spare[2] - spare[0]).to.be.lessThan((wired[2] - wired[0]) / 2 + 1);
    expect(spare[1] - spare[0]).to.be.lessThan(BRANCH_SPREAD);
    expect(spare[2] - spare[1]).to.be.lessThan(BRANCH_SPREAD);
  });

  it('should centre two wired branches on the node with a spare branch declared', () => {
    const source = node('n1', 400);
    const xs = branchDropXs(source, typeOf, [wire('n1', 'success', 'a'), wire('n1', 'failure', 'b')]);

    expect((xs[0] + xs[1]) / 2).to.equal(centreOf(source));
    expect(xs[1] - xs[0]).to.equal(BRANCH_SPREAD);
  });

  it('should centre a pill along a short wire to the next row', () => {
    const source = node('n1', 0, 0);
    const child = node('n2', 0, NODE_HEIGHT + 160);

    const top = branchPillTop(source, 40, child);
    expect(top).to.be.greaterThan(source.y + NODE_HEIGHT);
    expect(top).to.be.lessThan(child.y);
  });

  it('should keep a pill under its own node when the wire skips past a row', () => {
    const source = node('n1', 0, 0);
    const near = node('n2', 0, NODE_HEIGHT + 160);
    const far = node('n3', 0, NODE_HEIGHT + 800);

    // A long branch must not park its pill halfway down, in among the rows it
    // passes — that is what stacked two nodes' pills on top of each other. It
    // sits on the bus, leaving the gap below clear for the wire to route.
    const top = branchPillTop(source, 40, far);
    expect(top).to.equal(source.y + NODE_HEIGHT + BUS_OFFSET);
    expect(top).to.be.lessThan(near.y);
  });
});
