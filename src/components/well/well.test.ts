import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-well>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-well></zn-well> `);
    expect(el).to.exist;
  });
});
