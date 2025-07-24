import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-page-nav>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-page-nav></zn-page-nav> `);

    expect(el).to.exist;
  });
});
