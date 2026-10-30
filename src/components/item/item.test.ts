import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-item></zn-item> `);

    expect(el).to.exist;
  });

  it('right aligns content when align-end is set', async () => {
    const el = await fixture(html` <zn-item align-end caption="Total">$100.00</zn-item> `);
    const content = el.shadowRoot?.querySelector<HTMLElement>('.item__content-inner');

    expect(content).to.exist;
    expect(getComputedStyle(content!).textAlign).to.equal('right');
  });
});
