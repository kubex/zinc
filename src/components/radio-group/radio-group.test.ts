import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-radio-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-radio-group></zn-radio-group> `);

    expect(el).to.exist;
  });

  it('propagates contained and square to its radios', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-radio-group contained square>
        <zn-radio value="one">One</zn-radio>
        <zn-radio value="two">Two</zn-radio>
      </zn-radio-group>
    `);
    await new Promise(resolve => requestAnimationFrame(resolve));

    el.querySelectorAll('zn-radio').forEach(child => {
      expect(child).to.have.attribute('contained');
      expect(child).to.have.attribute('square');
    });
  });
});
