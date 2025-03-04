import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-editor>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-editor></zn-editor> `);

    expect(el).to.exist;
  });
});
