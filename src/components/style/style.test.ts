import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-style>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-style></zn-style> `);

    expect(el).to.exist;
  });
});
