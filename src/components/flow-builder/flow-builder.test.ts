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

  it('should round-trip state through getState/setState, keeping positions', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder></zn-flow-builder>`);
    const state: FlowState = {
      nodes: [{id: 'n1', type: 'webhook', x: 10, y: 20, data: {}}],
      connections: [],
      notes: [{id: 'note1', x: 300, y: 40, width: 220, height: 120, text: 'hi'}],
    };
    el.setState(state);
    await el.updateComplete;

    // Save (value) then load (value =) — positional data survives the trip.
    const json = el.value;
    el.setState({nodes: [], connections: [], notes: []});
    el.value = json;

    const loaded = el.getState();
    expect(loaded.nodes[0]).to.deep.include({id: 'n1', x: 10, y: 20});
    expect(loaded.notes[0]).to.deep.include({x: 300, y: 40, width: 220, height: 120});
  });

  it('should serialize to the full state via toJSON, ready for a POST body', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder heading="My Flow"></zn-flow-builder>`);
    el.setState({
      nodes: [{id: 'n1', type: 'webhook', x: 60, y: 80, data: {}}],
      connections: [],
      notes: [],
    });

    const body = JSON.parse(JSON.stringify(el)) as FlowState;
    expect(body.nodes[0]).to.deep.include({id: 'n1', x: 60, y: 80});
    expect(JSON.stringify(el)).to.equal(el.value);
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

  it('should tuck the side panels away via the edge chevrons', async () => {
    const el = await fixture<ZnFlowBuilder>(html`
      <zn-flow-builder></zn-flow-builder>`);
    const builder = el.shadowRoot!.querySelector('.builder')!;
    (el.shadowRoot!.querySelector('.panel-toggle--left') as HTMLButtonElement).click();
    (el.shadowRoot!.querySelector('.panel-toggle--right') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(builder.classList.contains('builder--steps-collapsed')).to.equal(true);
    expect(builder.classList.contains('builder--side-collapsed')).to.equal(true);

    // Selecting a node needs the inspector — the right panel comes back.
    el.setState({nodes: [{id: 'n1', type: 'webhook', x: 0, y: 0, data: {}}], connections: [], notes: []});
    el.dispatchEvent(new CustomEvent('flow-node-select', {detail: {nodeId: 'n1'}}));
    await el.updateComplete;
    expect(builder.classList.contains('builder--side-collapsed')).to.equal(false);
    expect(builder.classList.contains('builder--steps-collapsed')).to.equal(true);
  });

  describe('auto-save', () => {
    const KEY = 'zn-flow-builder:as-test';
    const STATE: FlowState = {
      nodes: [{id: 'n1', type: 'webhook', x: 40, y: 80, data: {}}],
      connections: [],
      notes: [],
    };
    const tick = (ms: number) => new Promise(r => setTimeout(r, ms));

    afterEach(() => localStorage.removeItem(KEY));

    it('should not auto-save without the attribute', async () => {
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder id="as-test"></zn-flow-builder>`);
      el.setState(STATE);
      expect(el.autoSave).to.equal(null);
      await tick(150);
      expect(localStorage.getItem(KEY)).to.equal(null);
    });

    it('should default a bare attribute to 5 minutes', async () => {
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder id="as-test" auto-save></zn-flow-builder>`);
      expect(el.autoSave).to.equal(5);
    });

    it('should save the state (with positions) on the interval', async () => {
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder id="as-test" auto-save="0.001"></zn-flow-builder>`);
      el.setState(STATE);
      await tick(150);

      const saved = JSON.parse(localStorage.getItem(KEY)!) as { savedAt: number; state: FlowState };
      expect(saved.savedAt).to.be.a('number');
      expect(saved.state.nodes[0]).to.deep.include({id: 'n1', x: 40, y: 80});
    });

    it('should show the status pill: a saved flash, then time since last save', async function (this: Mocha.Context) {
      this.timeout(6000); // outlasts the 2.5s "Auto-saved" flash
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder id="as-test" auto-save="0.001"></zn-flow-builder>`);
      expect(el.shadowRoot?.querySelector('.save-status')).to.equal(null);

      el.setState(STATE);
      await tick(150);
      await el.updateComplete;
      const status = el.shadowRoot?.querySelector('.save-status');
      expect(status?.textContent).to.contain('Auto-saved');
      expect(status?.classList.contains('save-status--saved')).to.equal(true);

      // Slow the schedule right down; once the flash runs out, the pill
      // reports how long since the last save.
      el.autoSave = 60;
      await tick(2700);
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('.save-status')?.textContent).to.contain('Last saved');
    });

    it('should offer to restore a differing auto-save on load', async () => {
      localStorage.setItem(KEY, JSON.stringify({savedAt: Date.now(), state: STATE}));
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder id="as-test" auto-save></zn-flow-builder>`);

      // Loading a different flow — the draft is offered.
      el.setState({nodes: [{id: 'other', type: 'webhook', x: 0, y: 0, data: {}}], connections: [], notes: []});
      await el.updateComplete;
      const banner = el.shadowRoot?.querySelector('.restore-banner');
      expect(banner?.textContent).to.contain('differs from this flow');

      (banner?.querySelector('.restore-banner__restore') as HTMLButtonElement).click();
      await el.updateComplete;
      expect(el.getState().nodes[0].id).to.equal('n1');
      expect(el.shadowRoot?.querySelector('.restore-banner')).to.equal(null);

      // Loading the same flow as the draft — nothing to offer.
      el.setState(JSON.parse(JSON.stringify(STATE)) as FlowState);
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('.restore-banner')).to.equal(null);
    });

    it('should restore a fresh auto-save and purge an expired one', async () => {
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder id="as-test"></zn-flow-builder>`);

      localStorage.setItem(KEY, JSON.stringify({savedAt: Date.now(), state: STATE}));
      expect(el.restoreAutoSave()).to.equal(true);
      expect(el.getState().nodes[0]).to.deep.include({id: 'n1', x: 40, y: 80});

      // Past the 1-day TTL: not restored, and cleaned out of storage.
      localStorage.setItem(KEY, JSON.stringify({savedAt: Date.now() - 25 * 60 * 60 * 1000, state: STATE}));
      expect(el.restoreAutoSave()).to.equal(false);
      expect(localStorage.getItem(KEY)).to.equal(null);
    });
  });

  describe('branch filters declared in markup', () => {
    const SPLIT_STATE: FlowState = {
      nodes: [{id: 'n1', type: 'split', x: 0, y: 0, data: {}}],
      connections: [],
      notes: [],
    };

    async function makeBuilder(): Promise<ZnFlowBuilder> {
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder>
          <zn-flow-step type="split" group="rule" label="Conditional Split"
                        outputs='[{"id":"true","label":"TRUE"},{"id":"false","label":"FALSE"}]'>
            <zn-flow-filter id="engagement" label="Email engagement">
              <zn-flow-filter-field id="count" type="number" value="2">
                <zn-flow-operator>at least</zn-flow-operator>
                <zn-flow-operator>at most</zn-flow-operator>
                <zn-flow-unit value="days">day(s)</zn-flow-unit>
                <zn-flow-unit value="months">month(s)</zn-flow-unit>
              </zn-flow-filter-field>
            </zn-flow-filter>
            <zn-flow-filter id="lost-reason" label="Lost reason">
              <zn-flow-filter-field id="reason" type="select" operators="Is equal to,Is not equal to">
                <zn-flow-option value="price">Price</zn-flow-option>
              </zn-flow-filter-field>
            </zn-flow-filter>
          </zn-flow-step>
        </zn-flow-builder>`);
      el.setState(SPLIT_STATE);
      await el.updateComplete;
      // Open the TRUE branch's editor, as clicking its pill would.
      el.dispatchEvent(new CustomEvent('flow-branch-pick', {detail: {nodeId: 'n1', port: 'true'}}));
      await el.updateComplete;
      return el;
    }

    it('should feed nested <zn-flow-filter> declarations to the branch conditions editor', async () => {
      const el = await makeBuilder();
      const editor = el.shadowRoot?.querySelector('zn-flow-branch-conditions');
      expect(editor).to.exist;
      expect(editor?.filters).to.have.length(2);
      expect(editor?.filters[0]).to.deep.include({id: 'engagement', label: 'Email engagement'});
      expect(editor?.filters[0].fields[0].operators).to.deep.equal([{value: 'at least'}, {value: 'at most'}]);
      expect(editor?.filters[0].fields[0].units).to.deep.equal(
        [{value: 'days', label: 'day(s)'}, {value: 'months', label: 'month(s)'}]);
      expect(editor?.filters[0].fields[0].value).to.equal(2);
      expect(editor?.filters[1].fields[0].options).to.deep.equal([{value: 'price', label: 'Price'}]);
    });

    it('should persist saved conditions on the output port', async () => {
      const el = await makeBuilder();
      const editor = el.shadowRoot?.querySelector('zn-flow-branch-conditions');
      const conditions = [[{filter: 'engagement', values: {count: {operator: 'at least', value: 3}}}]];
      editor?.dispatchEvent(new CustomEvent('flow-conditions-save', {
        bubbles: true,
        composed: true,
        detail: {conditions},
      }));
      await el.updateComplete;

      const port = el.getState().nodes[0].outputs?.find(p => p.id === 'true');
      expect(port?.data?.conditions).to.deep.equal(conditions);
      // Saving closes the branch editor.
      expect(el.shadowRoot?.querySelector('zn-flow-branch-conditions')).to.not.exist;
    });

    it('should parse the branch-filters JSON attribute', async () => {
      const el = await fixture<ZnFlowBuilder>(html`
        <zn-flow-builder>
          <zn-flow-step type="split" group="rule" label="Split"
                        outputs='[{"id":"true","label":"TRUE"}]'
                        branch-filters='[{"id":"plan","label":"Plan","fields":[{"id":"name","options":["Basic","Pro"]}]}]'>
          </zn-flow-step>
        </zn-flow-builder>`);
      el.setState(SPLIT_STATE);
      await el.updateComplete;
      el.dispatchEvent(new CustomEvent('flow-branch-pick', {detail: {nodeId: 'n1', port: 'true'}}));
      await el.updateComplete;

      const editor = el.shadowRoot?.querySelector('zn-flow-branch-conditions');
      expect(editor?.filters).to.deep.equal([
        {id: 'plan', label: 'Plan', fields: [{id: 'name', options: [{value: 'Basic'}, {value: 'Pro'}]}]},
      ]);
    });
  });
});
