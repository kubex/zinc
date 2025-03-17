import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-list-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-list-container></zn-list-container> `);

    expect(el).to.exist;
  });
});
