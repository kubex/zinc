import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-progress-bar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-progress-bar></zn-progress-bar> `);

    expect(el).to.exist;
  });

  it('should support color variants', async () => {
    const variants = ['current', 'info', 'error', 'success', 'warning'];

    for (const color of variants) {
      const el = await fixture(html` <zn-progress-bar color=${color} value="50"></zn-progress-bar> `);
      const fill = el.shadowRoot?.querySelector('[part="fill"]');

      expect(el.getAttribute('color')).to.equal(color);
      expect(fill?.getAttribute('fill')).to.equal('var(--zn-progress-bar-color)');
    }
  });
});
