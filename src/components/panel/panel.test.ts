import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-panel>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-panel></zn-panel> `);

    expect(el).to.exist;
  });

  it('underlines panel headers by default', async () => {
    const el = await fixture(html` <zn-panel caption="Example"></zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    expect(header.classList.contains('panel__header--underline')).to.be.true;
  });

  it('removes the header underline when header-borderless is set', async () => {
    const el = await fixture(html` <zn-panel caption="Example" header-borderless></zn-panel> `);
    const header = el.shadowRoot!.querySelector('.panel__header')!;

    expect(header.classList.contains('panel__header--underline')).to.be.false;
  });
});
