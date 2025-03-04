import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-dropdown>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-dropdown></zn-dropdown> `);

    expect(el).to.exist;
  });
});
