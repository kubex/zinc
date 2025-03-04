import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-pagination>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-pagination></zn-pagination> `);

    expect(el).to.exist;
  });
});
