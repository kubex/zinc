import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-skeleton>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-skeleton></zn-skeleton> `);

    expect(el).to.exist;
  });
});
