import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-simple-chart>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-simple-chart></zn-simple-chart> `);

    expect(el).to.exist;
  });
});
