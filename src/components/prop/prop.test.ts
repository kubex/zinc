import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-property>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-property></zn-property> `);

    expect(el).to.exist;
  });
});
