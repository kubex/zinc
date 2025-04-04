import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-item></zn-item> `);

    expect(el).to.exist;
  });
});
