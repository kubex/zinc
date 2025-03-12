import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-dialog>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-dialog></zn-dialog> `);

    expect(el).to.exist;
  });
});
