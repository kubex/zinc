import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-option>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-option></zn-option> `);

    expect(el).to.exist;
  });
});
