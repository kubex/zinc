import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-inline-edit>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-inline-edit></zn-inline-edit> `);

    expect(el).to.exist;
  });
});
