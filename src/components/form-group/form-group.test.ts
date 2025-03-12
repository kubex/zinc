import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-form-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-form-group></zn-form-group> `);

    expect(el).to.exist;
  });
});
