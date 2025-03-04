import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-defined-label>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-defined-label></zn-defined-label> `);

    expect(el).to.exist;
  });
});
