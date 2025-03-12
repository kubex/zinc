import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-empty-state>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-empty-state></zn-empty-state> `);

    expect(el).to.exist;
  });
});
