import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-expanding-action>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-expanding-action></zn-expanding-action> `);

    expect(el).to.exist;
  });
});
