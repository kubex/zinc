import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-sidebar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-sidebar></zn-sidebar> `);

    expect(el).to.exist;
  });
});
