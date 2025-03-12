import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-stats-tile>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-stats-tile></zn-stats-tile> `);

    expect(el).to.exist;
  });
});
