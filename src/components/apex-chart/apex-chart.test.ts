import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-apex-chart>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-apex-chart></zn-apex-chart> `);

    expect(el).to.exist;
  });
});
