import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-copy-button>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-copy-button></zn-copy-button> `);

    expect(el).to.exist;
  });
});
