import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-select></zn-select> `);

    expect(el).to.exist;
  });
});
