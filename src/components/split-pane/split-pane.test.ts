import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-split-pane>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-split-pane></zn-split-pane> `);

    expect(el).to.exist;
  });
});
