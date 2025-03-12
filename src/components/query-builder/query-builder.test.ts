import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-query-builder>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-query-builder></zn-query-builder> `);

    expect(el).to.exist;
  });
});
