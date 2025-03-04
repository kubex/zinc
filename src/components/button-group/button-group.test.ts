import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-button-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-button-group></zn-button-group> `);

    expect(el).to.exist;
  });
});
