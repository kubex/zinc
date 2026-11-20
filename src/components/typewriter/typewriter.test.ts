import '../../../dist/zn.min.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type ZnTypewriter from './typewriter.component';

const typed = (el: ZnTypewriter) => el.shadowRoot!.querySelector('[aria-hidden="true"]')!.textContent;
const afterSlot = (el: ZnTypewriter) => el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="after"]')!;

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
});
