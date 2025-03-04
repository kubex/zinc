import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-popup>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-popup></zn-popup> `);

    expect(el).to.exist;
  });
});
