import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnReveal from './reveal.component';

describe('<zn-reveal>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-reveal></zn-reveal> `);

    expect(el).to.exist;
  });

  it('should toggle the revealed state on click by default', async () => {
    const el = await fixture<ZnReveal>(html`
      <zn-reveal initial="****" revealed="real"></zn-reveal>
    `);
    const container = el.shadowRoot!.querySelector<HTMLElement>('.reveal')!;

    container.click();
    await el.updateComplete;

    expect(container.classList.contains('reveal--revealed')).to.be.true;
  });

  it('should not toggle on click when no-toggle is set', async () => {
    const el = await fixture<ZnReveal>(html`
      <zn-reveal initial="****" revealed="real" no-toggle></zn-reveal>
    `);
    const container = el.shadowRoot!.querySelector<HTMLElement>('.reveal')!;

    container.click();
    await el.updateComplete;

    expect(container.classList.contains('reveal--revealed')).to.be.false;
  });
});
