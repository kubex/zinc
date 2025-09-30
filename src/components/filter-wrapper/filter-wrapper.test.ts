import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-filter-wrapper>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-filter-wrapper></zn-filter-wrapper> `);

    expect(el).to.exist;
  });
});
