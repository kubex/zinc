import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-slideout>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-slideout></zn-slideout> `);

    expect(el).to.exist;
  });
});
