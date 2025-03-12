import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-radio-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-radio-group></zn-radio-group> `);

    expect(el).to.exist;
  });
});
