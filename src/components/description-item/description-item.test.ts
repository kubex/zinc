import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-description-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-description-item></zn-description-item> `);

    expect(el).to.exist;
  });
});
