import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-dropdown>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-dropdown></zn-dropdown> `);

    expect(el).to.exist;
  });

  it('draws a surface around slotted controls only with panel', async () => {
    const plain = await fixture<HTMLElement>(html`<zn-dropdown><button slot="trigger">Open</button><p>Body</p></zn-dropdown>`);
    const panel = await fixture<HTMLElement>(html`<zn-dropdown panel><button slot="trigger">Open</button><p>Body</p></zn-dropdown>`);
    const surface = (el: HTMLElement) => getComputedStyle(el.shadowRoot!.querySelector('[part="surface"]')!);

    // The test page loads no theme, so the colour-token border drops out; the width has its own fallback
    expect(surface(plain).width).to.not.equal('272px');
    expect(surface(panel).width).to.equal('272px');
  });

  it('keeps a panel open while its controls are used', async () => {
    const el = await fixture<HTMLElement & { open: boolean; show: () => Promise<void> }>(html`
      <zn-dropdown panel>
        <button slot="trigger">Open</button>
        <zn-toggle label="Hide empty" label-position="left"></zn-toggle>
      </zn-dropdown>
    `);
    await el.show();
    el.querySelector<HTMLElement>('zn-toggle')!.shadowRoot!.querySelector<HTMLElement>('input')!.click();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(el.open).to.be.true;
  });
});
