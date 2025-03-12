import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-linked-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-linked-select></zn-linked-select> `);

    expect(el).to.exist;
  });
});
