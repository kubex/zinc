import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-table>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-table></zn-table> `);

    expect(el).to.exist;
  });
});
