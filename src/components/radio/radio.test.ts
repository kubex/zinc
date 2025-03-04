import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-radio>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-radio></zn-radio> `);

    expect(el).to.exist;
  });
});
