import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-scroll-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-scroll-container></zn-scroll-container> `);

    expect(el).to.exist;
  });

  it('should render as a block-level container', async () => {
    const el = await fixture(html` <zn-scroll-container></zn-scroll-container> `);

    expect(getComputedStyle(el).display).to.equal('block');
  });

  it('should apply height as the height and maximum height', async () => {
    const el = await fixture(html` <zn-scroll-container height="240px"></zn-scroll-container> `);

    expect(getComputedStyle(el).height).to.equal('240px');
    expect(getComputedStyle(el).maxHeight).to.equal('240px');
  });
});
