import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-stat>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-stat></zn-stat> `);

    expect(el).to.exist;
    expect(el.shadowRoot).to.exist;
  });

  it('renders a positive delta in the success text colour', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-stat amount="110" previous="100" show-delta style="--zn-color-success-fg: rgb(1, 2, 3)"></zn-stat>`);
    const positive = el.shadowRoot!.querySelector('.positive')!;

    expect(positive).to.exist;
    expect(getComputedStyle(positive).color).to.equal('rgb(1, 2, 3)');
  });
});
