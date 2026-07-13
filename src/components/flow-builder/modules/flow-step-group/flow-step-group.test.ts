import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnFlowStepGroup from './flow-step-group.component';

describe('<zn-flow-step-group>', () => {
  it('should render a component with its caption', async () => {
    const el = await fixture<ZnFlowStepGroup>(html`
      <zn-flow-step-group caption="Contacts"></zn-flow-step-group>`);
    expect(el.shadowRoot?.querySelector('.header')?.textContent).to.contain('Contacts');
  });

  it('should toggle collapsed when the header is clicked', async () => {
    const el = await fixture<ZnFlowStepGroup>(html`
      <zn-flow-step-group caption="Contacts"></zn-flow-step-group>`);
    const header = el.shadowRoot?.querySelector('.header') as HTMLElement;
    header.click();
    await el.updateComplete;
    expect(el.collapsed).to.equal(true);
  });
});
