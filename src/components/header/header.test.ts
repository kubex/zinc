import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-header>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-header></zn-header> `);

    expect(el).to.exist;
  });
});
