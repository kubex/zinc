import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-tile>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-tile></zn-tile> `);

    expect(el).to.exist;
  });
});
