import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-confirm-content>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-confirm-content></zn-confirm-content> `);

    expect(el).to.exist;
  });
});
