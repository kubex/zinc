import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnFlowSteps from './flow-steps.component';

describe('<zn-flow-steps>', () => {
  it('should render a search box and slot its content', async () => {
    const el = await fixture<ZnFlowSteps>(html`
      <zn-flow-steps>
        <zn-flow-step type="a">Apple</zn-flow-step>
        <zn-flow-step type="b">Banana</zn-flow-step>
      </zn-flow-steps>`);
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('.search')).to.exist;
    expect(el.querySelectorAll('zn-flow-step')).to.have.length(2);
  });
});
