import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-columns>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-columns></zn-columns> `);

    expect(el).to.exist;
  });
});
