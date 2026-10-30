import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnFlowStep from './flow-step.component';

describe('<zn-flow-step>', () => {
  it('should render a component', async () => {
    const el = await fixture<ZnFlowStep>(html`
      <zn-flow-step type="webhook">Webhook</zn-flow-step>`);
    expect(el).to.exist;
    expect(el.draggable).to.equal(true);
  });

  it('should put its type on the dataTransfer at dragstart', async () => {
    const el = await fixture<ZnFlowStep>(html`
      <zn-flow-step type="webhook">Webhook</zn-flow-step>`);

    const dt = new DataTransfer();
    el.dispatchEvent(new DragEvent('dragstart', {dataTransfer: dt, bubbles: true}));
    expect(dt.getData('application/x-zn-flow-type')).to.equal('webhook');
  });
});
