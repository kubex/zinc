import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-status-indicator>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-status-indicator></zn-status-indicator> `);

    expect(el).to.exist;
  });
});
