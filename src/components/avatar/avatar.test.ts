import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-avatar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-avatar></zn-avatar> `);

    expect(el).to.exist;
  });
});
