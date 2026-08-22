import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-checkbox-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-checkbox-group></zn-checkbox-group> `);

    expect(el).to.exist;
  });

  it('propagates contained and square to its checkboxs', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-checkbox-group contained square>
        <zn-checkbox value="one">One</zn-checkbox>
        <zn-checkbox value="two">Two</zn-checkbox>
      </zn-checkbox-group>
    `);
    await new Promise(resolve => requestAnimationFrame(resolve));

    el.querySelectorAll('zn-checkbox').forEach(child => {
      expect(child).to.have.attribute('contained');
      expect(child).to.have.attribute('square');
    });
  });
});
