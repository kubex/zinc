import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-alert>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-alert></zn-alert> `);

    expect(el).to.exist;
  });

  it('tints an ai alert from the ai colour', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-alert level="ai" caption="Suggested" style="--zn-color-ai: 1, 2, 3">Drafted for you.</zn-alert>`);
    const wrapper = el.shadowRoot!.querySelector('.wrapper')!;

    expect(getComputedStyle(wrapper).borderTopColor).to.equal('rgb(1, 2, 3)');
  });
});
