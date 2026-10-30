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

  it('should render static text when the revealed value matches the initial', async () => {
    const el = await fixture<ZnReveal>(html`
      <zn-reveal initial="real" revealed="real"></zn-reveal>
    `);
    const container = el.shadowRoot!.querySelector<HTMLElement>('.reveal')!;

    expect(container.classList.contains('reveal--static')).to.be.true;

    container.click();
    await el.updateComplete;

    expect(container.classList.contains('reveal--revealed')).to.be.false;
  });

  it('should only show a pointer cursor when a click would toggle the value', async () => {
    const cursorOf = (el: ZnReveal) =>
      getComputedStyle(el.shadowRoot!.querySelector<HTMLElement>('.reveal')!).cursor;

    const toggleable = await fixture<ZnReveal>(html`
      <zn-reveal initial="****" revealed="real"></zn-reveal>
    `);
    // Inside a clickable row (an inline edit, say) the inherited pointer has to be shaken off
    const unmasked = (await fixture<HTMLDivElement>(html`
      <div style="cursor: pointer">
        <zn-reveal initial="real" revealed="real"></zn-reveal>
      </div>
    `)).querySelector<ZnReveal>('zn-reveal')!;
    const hoverOnly = await fixture<ZnReveal>(html`
      <zn-reveal initial="****" revealed="real" no-toggle></zn-reveal>
    `);

    expect(cursorOf(toggleable)).to.equal('pointer');
    expect(cursorOf(unmasked)).to.not.equal('pointer');
    expect(cursorOf(hoverOnly)).to.not.equal('pointer');
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
