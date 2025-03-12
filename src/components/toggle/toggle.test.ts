import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-toggle>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-toggle></zn-toggle> `);

    expect(el).to.exist;
  });
});
