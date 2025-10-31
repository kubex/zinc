import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-filter-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-filter-container></zn-filter-container> `);

    expect(el).to.exist;
  });
});
