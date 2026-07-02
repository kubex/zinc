import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type {FlowNodeInstance, FlowNodeType} from '../../flow.types';
import type ZnFlowNode from './flow-node.component';

const splitType: FlowNodeType = {
  type: 'split',
  label: 'Conditional Split',
  group: 'rule',
  outputs: [{id: 'true', label: 'TRUE'}, {id: 'false', label: 'FALSE'}],
};

const node: FlowNodeInstance = {id: 'n1', type: 'split', x: 0, y: 0, data: {}};

describe('<zn-flow-node>', () => {
  it('should render a component', async () => {
    const el = await fixture<ZnFlowNode>(html`
      <zn-flow-node></zn-flow-node>`);
    expect(el).to.exist;
  });

  it('should render the type label and one port per output', async () => {
    const el = await fixture<ZnFlowNode>(html`
      <zn-flow-node></zn-flow-node>`);
    el.node = node;
    el.type = splitType;
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('.title')?.textContent).to.contain('Conditional Split');
    expect(el.shadowRoot?.querySelectorAll('.port--out')?.length).to.equal(2);
    expect(el.shadowRoot?.querySelector('.port-label')?.textContent).to.contain('TRUE');
  });

  it('should emit flow-node-grab when the card body is pressed', async () => {
    const el = await fixture<ZnFlowNode>(html`
      <zn-flow-node></zn-flow-node>`);
    el.node = node;
    el.type = splitType;
    await el.updateComplete;

    let grabbedId = '';
    el.addEventListener('flow-node-grab', (e: Event) => {
      grabbedId = (e as CustomEvent<{ nodeId: string }>).detail.nodeId;
    });
    const card = el.shadowRoot?.querySelector('.card') as HTMLElement;
    card.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, button: 0}));

    expect(grabbedId).to.equal('n1');
  });
});
