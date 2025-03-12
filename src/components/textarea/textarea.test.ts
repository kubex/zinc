import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-text-area>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-text-area></zn-text-area> `);

    expect(el).to.exist;
  });
});
