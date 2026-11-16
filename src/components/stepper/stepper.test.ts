import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnStepper from './stepper.component';

describe('<zn-stepper>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-stepper></zn-stepper> `);

    expect(el).to.exist;
  });

  it('marks reached steps and the current step', async () => {
    const el = await fixture<ZnStepper>(html` <zn-stepper steps="4" value="2"></zn-stepper> `);
    const steps = [...el.shadowRoot!.querySelectorAll('.step')];

    expect(steps.map(s => s.classList.contains('step--complete'))).to.deep.equal([true, true, false, false]);
    expect(steps.findIndex(s => s.classList.contains('step--current'))).to.equal(1);
  });

  it('clamps an overflowing value and exposes it as a progressbar', async () => {
    const el = await fixture<ZnStepper>(html` <zn-stepper caption="Setup" steps="5" value="7" show-progress></zn-stepper> `);
    const bar = el.shadowRoot!.querySelector('[role="progressbar"]')!;

    expect(bar.getAttribute('aria-valuenow')).to.equal('5');
    expect(bar.getAttribute('aria-valuemax')).to.equal('5');
    expect(bar.getAttribute('aria-label')).to.equal('Setup');
    expect(el.shadowRoot!.querySelector('.progress')!.textContent).to.equal('5 / 5 steps');
  });
});
