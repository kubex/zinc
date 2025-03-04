import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-progress-tile>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-progress-tile></zn-progress-tile> `);

    expect(el).to.exist;
  });
});
