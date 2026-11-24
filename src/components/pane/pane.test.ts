import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-pane>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-pane></zn-pane> `);

    expect(el).to.exist;
  });

  it('only pulls direct child headers into the pane header area', async () => {
    const el = await fixture(html`
      <zn-pane>
        <zn-panel>
          <zn-tab caption="Overview">
            <zn-header caption="Nested Header"></zn-header>
          </zn-tab>
        </zn-panel>
      </zn-pane>
    `);

    const nestedHeader = el.querySelector('zn-header')!;

    expect(el.classList.contains('with-header')).to.equal(false);
    expect(nestedHeader.getAttribute('slot')).to.not.equal('top');
    expect(nestedHeader.parentElement?.tagName).to.equal('ZN-TAB');
  });

  it('pulls direct child headers into the pane header area', async () => {
    const el = await fixture(html`
      <zn-pane>
        <zn-header caption="Direct Header"></zn-header>
      </zn-pane>
    `);

    const directHeader = (el.querySelector('zn-header') ?? el.shadowRoot!.querySelector('zn-header'))!;

    expect(el.classList.contains('with-header')).to.equal(true);
    expect(directHeader.getAttribute('slot')).to.equal('top');
  });

  it('overlays its scrollbar so the content keeps the full width, and follows content that grows', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-pane style="height: 100px; width: 200px">
        <div style="height: 50px; flex-shrink: 0; width: 100%">Short</div>
      </zn-pane>
    `);
    const scroller = el.shadowRoot!.querySelector<HTMLElement>('.pane__content')!;
    const thumb = el.shadowRoot!.querySelector<HTMLElement>('.zn-overlay-scrollbar')!;
    const frames = async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    };
    await frames();
    expect(thumb.hidden).to.be.true;

    el.querySelector<HTMLElement>('div')!.style.height = '400px';
    await frames();
    expect(scroller.offsetWidth - scroller.clientWidth).to.equal(0);
    expect(thumb.hidden).to.be.false;
    expect(thumb.style.height).to.equal('25px');

    scroller.scrollTop = 300;
    scroller.dispatchEvent(new Event('scroll'));
    await frames();
    expect(Math.round(thumb.getBoundingClientRect().top - scroller.getBoundingClientRect().top)).to.equal(75);
  });
});
