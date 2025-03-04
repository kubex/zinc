import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-chip>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-chip></zn-chip> `);

    expect(el).to.exist;
  });
});
