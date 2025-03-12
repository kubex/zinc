import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-bulk-actions>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-bulk-actions></zn-bulk-actions> `);

    expect(el).to.exist;
  });
});
