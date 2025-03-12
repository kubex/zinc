import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-pane>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-pane></zn-pane> `);

    expect(el).to.exist;
  });
});
