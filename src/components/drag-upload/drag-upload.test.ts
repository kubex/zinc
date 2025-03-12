import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-drag-upload>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-drag-upload></zn-drag-upload> `);

    expect(el).to.exist;
  });
});
