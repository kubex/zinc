import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-sp>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-sp></zn-sp> `);

    expect(el).to.exist;
  });
});
