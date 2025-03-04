import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-accordion>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-accordion></zn-accordion> `);

    expect(el).to.exist;
  });
});
