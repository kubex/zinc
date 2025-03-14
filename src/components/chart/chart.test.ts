import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-chart>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-chart></zn-chart> `);

    expect(el).to.exist;
  });
});
