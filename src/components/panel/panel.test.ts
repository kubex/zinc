import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-panel>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-panel></zn-panel> `);

    expect(el).to.exist;
  });
});
