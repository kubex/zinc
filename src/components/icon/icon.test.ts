import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-icon>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-icon></zn-icon> `);

    expect(el).to.exist;
  });
});
