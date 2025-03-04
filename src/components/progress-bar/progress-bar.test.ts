import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-progress-bar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-progress-bar></zn-progress-bar> `);

    expect(el).to.exist;
  });
});
