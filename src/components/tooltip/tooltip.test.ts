import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-tooltip>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-tooltip></zn-tooltip> `);

    expect(el).to.exist;
  });
});
