import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-scroll-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-scroll-container></zn-scroll-container> `);

    expect(el).to.exist;
  });
});
