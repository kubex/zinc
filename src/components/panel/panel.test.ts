import '../../../dist/zn.min.js';
import { aTimeout, expect, fixture, html, waitUntil } from '@open-wc/testing';

describe('<zn-panel>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-panel></zn-panel> `);

    expect(el).to.exist;
  });

  it('underlines panel headers by default', async () => {
    const el = await fixture(html` <zn-panel caption="Example"><p>Content</p></zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    expect(header.classList.contains('panel__header--underline')).to.be.true;
  });

  it('removes the header underline when header-borderless is set', async () => {
    const el = await fixture(html` <zn-panel caption="Example" header-borderless><p>Content</p></zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    expect(header.classList.contains('panel__header--underline')).to.be.false;
  });

  it('removes the header underline and body padding when there is no content', async () => {
    const el = await fixture(html` <zn-panel caption="Example"></zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    expect(header.classList.contains('panel__header--underline')).to.be.false;
    expect(el.shadowRoot!.querySelector('.panel')!.classList.contains('panel--empty')).to.be.true;
  });

  it('removes the header underline when slotted content renders nothing', async () => {
    const el = await fixture(html` <zn-panel caption="Example">
      <div id="wrapper"></div>
    </zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    await waitUntil(() => !header.classList.contains('panel__header--underline'));

    expect(el.shadowRoot!.querySelector('.panel')!.classList.contains('panel--empty')).to.be.true;
  });

  it('keeps the padded body when slotted content has no box of its own', async () => {
    const el = await fixture(html` <zn-panel caption="Example">
      <div style="display: contents">
        <div style="height: 20px"></div>
      </div>
    </zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    await aTimeout(50);

    expect(header.classList.contains('panel__header--underline')).to.be.true;
    expect(el.shadowRoot!.querySelector('.panel')!.classList.contains('panel--empty')).to.be.false;
  });

  it('restores the header underline when slotted content gains height', async () => {
    const el = await fixture(html` <zn-panel caption="Example">
      <div id="wrapper"></div>
    </zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    await waitUntil(() => !header.classList.contains('panel__header--underline'));

    const child = document.createElement('div');
    child.style.height = '20px';
    el.querySelector('#wrapper')!.append(child);

    await waitUntil(() => header.classList.contains('panel__header--underline'));

    expect(el.shadowRoot!.querySelector('.panel')!.classList.contains('panel--empty')).to.be.false;
  });

  it('shows a description under the caption in the header', async () => {
    const el = await fixture<HTMLElement>(html`<zn-panel caption="Identity" description="Shown to assessors">Body</zn-panel>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const header = el.shadowRoot!.querySelector('zn-header')!;
    await (header as unknown as {updateComplete: Promise<unknown>}).updateComplete;

    expect(header.shadowRoot!.querySelector('.header__description')!.textContent).to.equal('Shown to assessors');
  });

  it('renders no description element without one', async () => {
    const el = await fixture<HTMLElement>(html`<zn-panel caption="Identity">Body</zn-panel>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const header = el.shadowRoot!.querySelector('zn-header')!;
    await (header as unknown as {updateComplete: Promise<unknown>}).updateComplete;

    expect(header.shadowRoot!.querySelector('.header__description')).to.not.exist;
  });

  describe('transparent', () => {
    it('leaves room outside the content for the focus ring of a flush control', async () => {
      const el = await fixture(html`
        <zn-panel transparent flush style="--zn-focus-ring-outset: 4px"><input></zn-panel> `);
      const contentEl = el.shadowRoot!.querySelector('.panel__content')!;
      const content = contentEl.getBoundingClientRect();
      const input = el.querySelector('input')!.getBoundingClientRect();
      const style = getComputedStyle(contentEl);

      expect(input.left).to.equal(content.left);
      expect(input.top).to.equal(content.top);
      // Safari has no overflow-clip-margin, so its clip area is widened with clip-path instead
      if (CSS.supports('overflow-clip-margin: 0px')) {
        expect(style.overflowClipMargin).to.equal('4px');
      } else {
        expect(style.clipPath).to.equal('inset(-4px)');
      }
    });

    it('keeps the bottom edge of the header clickable', async () => {
      const el = await fixture(html`
        <zn-panel transparent caption="Example" style="--zn-focus-ring-outset: 4px"><input></zn-panel> `);
      const header = el.shadowRoot!.querySelector('.panel__header')!;
      const rect = header.getBoundingClientRect();
      const hit = el.shadowRoot!.elementFromPoint(rect.left + 10, rect.bottom - 2);

      expect(header.contains(hit)).to.be.true;
    });
  });
});
