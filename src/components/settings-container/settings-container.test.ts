import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-settings-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-settings-container></zn-settings-container> `);

    expect(el).to.exist;
  });
});
