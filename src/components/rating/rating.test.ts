import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-rating>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-rating></zn-rating> `);

    expect(el).to.exist;
  });
});
