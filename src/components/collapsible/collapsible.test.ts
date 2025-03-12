import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-collapsible>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-collapsible></zn-collapsible> `);

    expect(el).to.exist;
  });
});
