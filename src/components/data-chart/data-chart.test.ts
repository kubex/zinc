import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-data-chart>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-data-chart></zn-data-chart> `);

    expect(el).to.exist;
  });
});
