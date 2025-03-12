import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-menu-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-menu-item></zn-menu-item> `);

    expect(el).to.exist;
  });
});
