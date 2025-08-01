import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-split-button>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-split-button></zn-split-button> `);

    expect(el).to.exist;
  });
});
