import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-data-table-sort>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-data-table-sort></zn-data-table-sort> `);

    expect(el).to.exist;
  });
});
