import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-confirm-modal>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-confirm-modal></zn-confirm-modal> `);

    expect(el).to.exist;
  });
});
