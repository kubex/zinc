import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-data-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-data-select></zn-data-select> `);

    expect(el).to.exist;
  });
});
