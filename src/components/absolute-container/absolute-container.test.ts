import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-absolute-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-absolute-container></zn-absolute-container> `);

    expect(el).to.exist;
  });
});
