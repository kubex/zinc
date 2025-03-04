import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-checkbox>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-checkbox></zn-checkbox> `);

    expect(el).to.exist;
  });
});
