import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-input>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-input></zn-input> `);

    expect(el).to.exist;
  });
});
