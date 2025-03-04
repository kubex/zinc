import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-alert>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-alert></zn-alert> `);

    expect(el).to.exist;
  });
});
