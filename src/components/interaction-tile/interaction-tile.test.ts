import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-interaction-tile>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-interaction-tile></zn-interaction-tile> `);

    expect(el).to.exist;
  });
});
