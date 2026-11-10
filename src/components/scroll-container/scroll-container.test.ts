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

  it('keeps content in its own box whether or not it scrolls with stable-gutter', async () => {
    const el = await fixture<HTMLElement>(html`
      <div style="width: 300px; --zn-scrollbar-size: 5px;">
        <zn-scroll-container height="100px" stable-gutter><div id="item" style="height: 20px"></div></zn-scroll-container>
      </div>`);
    const container = el.querySelector('zn-scroll-container')!;
    const item = el.querySelector<HTMLElement>('#item')!;
    await (container as unknown as {updateComplete: Promise<void>}).updateComplete;
    const short = item.getBoundingClientRect().width;

    item.style.height = '400px';
    await new Promise(requestAnimationFrame);
    expect(item.getBoundingClientRect().width).to.equal(short);
    expect(Math.round(item.getBoundingClientRect().right)).to.equal(Math.round(el.getBoundingClientRect().right));
  });
});
