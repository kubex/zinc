import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-timer>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-timer></zn-timer> `);

    expect(el).to.exist;
  });
});
