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

  it('gives overlaid content the full width and moves its thumb with the scroll', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-scroll-container style="height: 100px; width: 200px">
        <div style="height: 400px; flex-shrink: 0">Tall</div>
      </zn-scroll-container>
    `);
    const scroller = el.shadowRoot!.querySelector<HTMLElement>('.scroll-container')!;
    const thumb = el.shadowRoot!.querySelector<HTMLElement>('[part="scrollbar"]')!;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    expect(scroller.offsetWidth - scroller.clientWidth).to.equal(0);
    expect(thumb.hidden).to.be.false;
    expect(thumb.style.height).to.equal('25px');

    scroller.scrollTop = 300;
    scroller.dispatchEvent(new Event('scroll'));
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    expect(Math.round(thumb.getBoundingClientRect().top - scroller.getBoundingClientRect().top)).to.equal(75);
  });

  it('draws a horizontal thumb along the bottom for content that scrolls sideways', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-scroll-container style="height: 100px; width: 200px">
        <div style="width: 800px; height: 20px; flex-shrink: 0">Wide</div>
      </zn-scroll-container>
    `);
    const scroller = el.shadowRoot!.querySelector<HTMLElement>('.scroll-container')!;
    const thumbY = el.shadowRoot!.querySelector<HTMLElement>('.zn-overlay-scrollbar--y')!;
    const thumbX = el.shadowRoot!.querySelector<HTMLElement>('.zn-overlay-scrollbar--x')!;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    expect(scroller.offsetHeight - scroller.clientHeight).to.equal(0);
    expect(thumbY.hidden).to.be.true;
    expect(thumbX.hidden).to.be.false;
    expect(thumbX.style.width).to.equal('50px');
    const bottomGap = scroller.getBoundingClientRect().bottom - thumbX.getBoundingClientRect().bottom;
    expect(Math.round(bottomGap)).to.equal(2);
  });
});
