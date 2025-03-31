import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-list-tile>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-list-tile></zn-list-tile> `);

    expect(el).to.exist;
  });
});
