import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-data-table-filter>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-data-table-filter></zn-data-table-filter> `);

    expect(el).to.exist;
  });
});
