import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type {FlowNodeType, FlowState} from './flow.types';
import type ZnFlowBuilder from './flow-builder.component';

const TRIGGER: FlowNodeType = {type: 'webhook', label: 'Webhook', group: 'trigger', category: 'Contacts'};
const ACTION: FlowNodeType = {type: 'email', label: 'Send Email', group: 'action'};

describe('<zn-flow-builder>', () => {
  it('should render a component', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder></zn-flow-builder>`);
    expect(el).to.exist;
    expect(el.shadowRoot?.querySelector('zn-flow-canvas')).to.exist;
  });

  it('should list registered node types for the active tab', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder></zn-flow-builder>`);
    el.registerNodeTypes([TRIGGER, ACTION]);
    await el.updateComplete;

    // Each group renders its own zn-tabs panel; the default (Triggers) panel is first.
    const triggerPanel = el.shadowRoot?.querySelectorAll('.steps-panel')[0];
    const items = triggerPanel?.querySelectorAll('.step');
    expect(items?.length).to.equal(1); // only the trigger shows on the default Triggers tab
    expect(items?.[0].textContent).to.contain('Webhook');
  });

  it('should round-trip state through getState/setState', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder></zn-flow-builder>`);
    const state: FlowState = {
      nodes: [{id: 'n1', type: 'webhook', x: 10, y: 20, data: {}}],
      connections: [],
      notes: [],
    };
    el.setState(state);
    await el.updateComplete;

    expect(el.getState().nodes).to.have.length(1);
    expect(el.getState().nodes[0].id).to.equal('n1');
  });

  it('should parse the value attribute as JSON', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder></zn-flow-builder>`);
    el.value = JSON.stringify({nodes: [{id: 'a', type: 'x', x: 0, y: 0, data: {}}]});
    await el.updateComplete;
    expect(el.getState().nodes).to.have.length(1);
  });

  it('should treat undo as a no-op with empty history', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder></zn-flow-builder>`);
    expect(() => el.undo()).to.not.throw();
    expect(el.getState().nodes).to.have.length(0);
  });
});
