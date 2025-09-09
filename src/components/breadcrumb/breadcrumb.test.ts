import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-breadcrumb>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-breadcrumb></zn-breadcrumb> `);

    expect(el).to.exist;
  });
});
