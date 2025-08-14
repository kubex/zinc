import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-content-block>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-content-block></zn-content-block> `);

    expect(el).to.exist;
  });
});
