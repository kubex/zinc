import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-action-bar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-action-bar></zn-action-bar> `);

    expect(el).to.exist;
  });
});
