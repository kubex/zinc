import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-order-table>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-order-table></zn-order-table> `);

    expect(el).to.exist;
  });
});
