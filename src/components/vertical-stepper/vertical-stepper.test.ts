import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnVerticalStepper from './vertical-stepper.component';

describe('<zn-vertical-stepper>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-vertical-stepper></zn-vertical-stepper> `);

    expect(el).to.exist;
  });

  it('hides the content, suffix and actions containers when nothing is slotted', async () => {
    const el = await fixture<ZnVerticalStepper>(html` <zn-vertical-stepper caption="Step"></zn-vertical-stepper> `);

    expect(el.shadowRoot!.querySelector('.vs__content')!.hasAttribute('hidden')).to.be.true;
    expect(el.shadowRoot!.querySelector('.vs__suffix')!.hasAttribute('hidden')).to.be.true;
    expect(el.shadowRoot!.querySelector('.vs__actions')!.hasAttribute('hidden')).to.be.true;
  });

  it('shows slotted content, suffix and actions', async () => {
    const el = await fixture<ZnVerticalStepper>(html`
      <zn-vertical-stepper caption="Version 3">
        <span slot="suffix">Live</span>
        <span>Published 12 Oct 2026</span>
        <button slot="actions">View</button>
      </zn-vertical-stepper>
    `);

    expect(el.shadowRoot!.querySelector('.vs__content')!.hasAttribute('hidden')).to.be.false;
    expect(el.shadowRoot!.querySelector('.vs__suffix')!.hasAttribute('hidden')).to.be.false;
    expect(el.shadowRoot!.querySelector('.vs__actions')!.hasAttribute('hidden')).to.be.false;
  });

  it('reflects selected, dashed and highlight-line', async () => {
    const el = await fixture<ZnVerticalStepper>(html` <zn-vertical-stepper></zn-vertical-stepper> `);
    el.selected = true;
    el.dashed = true;
    el.highlightLine = true;
    await el.updateComplete;

    expect(el.hasAttribute('selected')).to.be.true;
    expect(el.hasAttribute('dashed')).to.be.true;
    expect(el.hasAttribute('highlight-line')).to.be.true;
  });
});
