import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-color-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-color-select></zn-color-select> `);

    expect(el).to.exist;
  });
});
