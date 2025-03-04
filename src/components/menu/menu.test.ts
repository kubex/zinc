import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-menu>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-menu></zn-menu> `);

    expect(el).to.exist;
  });
});
