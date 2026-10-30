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
});
