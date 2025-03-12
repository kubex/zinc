import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-action-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-action-item></zn-action-item> `);

    expect(el).to.exist;
  });
});
