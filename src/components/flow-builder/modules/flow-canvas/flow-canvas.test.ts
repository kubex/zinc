import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import {FlowRegistry} from '../../flow-registry';
import type {FlowNodeInstance} from '../../flow.types';
import type ZnFlowCanvas from './flow-canvas.component';

describe('<zn-flow-canvas>', () => {
  it('should render a component', async () => {
    const el = await fixture<ZnFlowCanvas>(html`
      <zn-flow-canvas></zn-flow-canvas>`);
    expect(el).to.exist;
    expect(el.shadowRoot?.querySelector('.toolbar--zoom')).to.exist;
  });

  it('should render one flow node per node in the model', async () => {
    const registry = new FlowRegistry();
    registry.register({type: 'a', label: 'A', group: 'action'});
    const nodes: FlowNodeInstance[] = [
      {id: 'n1', type: 'a', x: 0, y: 0, data: {}},
      {id: 'n2', type: 'a', x: 100, y: 100, data: {}},
    ];
    const el = await fixture<ZnFlowCanvas>(html`
      <zn-flow-canvas></zn-flow-canvas>`);
    el.registry = registry;
    el.nodes = nodes;
    await el.updateComplete;

    expect(el.shadowRoot?.querySelectorAll('zn-flow-node')?.length).to.equal(2);
  });

  it('should map screen coordinates to canvas space at the default transform', async () => {
    const el = await fixture<ZnFlowCanvas>(html`
      <zn-flow-canvas></zn-flow-canvas>`);
    const rect = el.getBoundingClientRect();
    const pt = el.screenToCanvas(rect.left + 50, rect.top + 80);
    expect(pt.x).to.be.closeTo(50, 0.5);
    expect(pt.y).to.be.closeTo(80, 0.5);
  });
});
