import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnCollapsible from '../../../collapsible/collapsible.component';
import type ZnFlowStepGroup from './flow-step-group.component';

async function collapsibleOf(el: ZnFlowStepGroup): Promise<ZnCollapsible> {
  const collapsible = el.shadowRoot!.querySelector<ZnCollapsible>('zn-collapsible')!;
  await collapsible.updateComplete;
  return collapsible;
}

describe('<zn-flow-step-group>', () => {
  it('should render a collapsible with its caption', async () => {
    const el = await fixture<ZnFlowStepGroup>(html`
      <zn-flow-step-group caption="Contacts"></zn-flow-step-group>`);
    const collapsible = await collapsibleOf(el);
    expect(collapsible.caption).to.equal('Contacts');
    expect(collapsible.expanded).to.equal(true);
  });

  it('should start closed when collapsed', async () => {
    const el = await fixture<ZnFlowStepGroup>(html`
      <zn-flow-step-group caption="Contacts" collapsed></zn-flow-step-group>`);
    expect((await collapsibleOf(el)).expanded).to.equal(false);
  });
});
