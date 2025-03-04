import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-list-tile-property>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-list-tile-property></zn-list-tile-property> `);

    expect(el).to.exist;
  });
});
