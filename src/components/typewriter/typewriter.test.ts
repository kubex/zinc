import '../../../dist/zn.min.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type ZnTypewriter from './typewriter.component';

const typed = (el: ZnTypewriter) => el.shadowRoot!.querySelector('[aria-hidden="true"]')!.textContent;
const afterSlot = (el: ZnTypewriter) => el.shadowRoot!.querySelector<HTMLElement>('.typewriter__after')!;

describe('<zn-typewriter>', () => {
  it('types the text out, then finishes and shows the after slot', async () => {
    const el = await fixture<ZnTypewriter>(html`
      <zn-typewriter speed="5" max-duration="100">Hello world<span slot="after">Next</span></zn-typewriter>
    `);
    await el.updateComplete;
    expect(el.done).to.be.false;
    expect(afterSlot(el).hidden).to.be.true;

    await oneEvent(el, 'zn-finish');
    await el.updateComplete;

    expect(typed(el)).to.equal('Hello world');
    expect(afterSlot(el).hidden).to.be.false;
  });

  it('gives assistive technology the full text straight away', async () => {
    const el = await fixture<ZnTypewriter>(html`<zn-typewriter speed="1000">Full sentence</zn-typewriter>`);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.typewriter__label')!.textContent).to.equal('Full sentence');
  });

  it('finishes at once when there is no text', async () => {
    const el = await fixture<ZnTypewriter>(html`<zn-typewriter><span slot="after">Only this</span></zn-typewriter>`);
    await el.updateComplete;

    expect(el.done).to.be.true;
    expect(afterSlot(el).hidden).to.be.false;
  });

  // A slow speed after the first text keeps the next text mid-typing while it is checked.
  const retyped = async (el: ZnTypewriter, text: string) => {
    await oneEvent(el, 'zn-finish');
    el.speed = 1000;
    el.textContent = text;
    await new Promise(resolve => setTimeout(resolve));
    await el.updateComplete;
  };

  it('carries on from where it had reached when the text grows', async () => {
    const el = await fixture<ZnTypewriter>(html`<zn-typewriter speed="5" max-duration="50">Hello</zn-typewriter>`);
    await retyped(el, 'Hello world');

    expect(el.done).to.be.false;
    expect(typed(el)).to.equal('Hello');
  });

  it('starts again when the text is replaced', async () => {
    const el = await fixture<ZnTypewriter>(html`<zn-typewriter speed="5" max-duration="50">Hello</zn-typewriter>`);
    await retyped(el, 'Goodbye');

    expect(el.done).to.be.false;
    expect(typed(el)).to.equal('');
  });

  it('keeps typing while text arrives faster than one character a tick', async () => {
    const el = await fixture<ZnTypewriter>(html`<zn-typewriter speed="20" max-duration="10000">a</zn-typewriter>`);
    let text = 'a';
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
      text += ' b';
      el.textContent = text;
    }
    await el.updateComplete;

    expect(typed(el)!.length).to.be.greaterThan(1);
  });
});
