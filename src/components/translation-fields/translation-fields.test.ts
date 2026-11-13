import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnTranslationFields from './translation-fields.component';

describe('<zn-translation-fields>', () => {
  it('hides every source from its toggle', async () => {
    const el = await fixture<ZnTranslationFields>(html`
      <zn-translation-fields store-key="" source-label="English">
        <zn-translation-field label="Content" source-code="en"><span slot="source">Hi</span><input></zn-translation-field>
      </zn-translation-fields>`);
    const toggle = el.shadowRoot!.querySelector<HTMLElement>('.translation-fields__toggle')!;
    expect(toggle.textContent).to.contain('Hide English');
    toggle.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    expect(el.hasAttribute('hide-source')).to.be.true;
    expect(toggle.textContent).to.contain('Show English');
    const field = el.querySelector('zn-translation-field')!;
    await (field as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const source = field.shadowRoot!.querySelector('.translation-field__source')!;
    expect(getComputedStyle(source).display).to.equal('none');
  });

  it('switches layout from its pill tabs', async () => {
    const el = await fixture<ZnTranslationFields>(html`<zn-translation-fields store-key=""></zn-translation-fields>`);
    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    await (navbar as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const stacked = navbar.shadowRoot!.querySelector<HTMLElement>('li[data-tab="stacked"]')!;
    stacked.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
    await el.updateComplete;
    await (navbar as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    expect(el.layout).to.equal('stacked');
    expect(stacked.classList.contains('active')).to.be.true;
  });

  it('puts the translation above the source when stacked', async () => {
    const el = await fixture<ZnTranslationFields>(html`
      <zn-translation-fields store-key="" layout="stacked">
        <zn-translation-field label="Content" source-code="en"><span slot="source">Hi</span><input></zn-translation-field>
      </zn-translation-fields>`);
    const field = el.querySelector('zn-translation-field')!;
    await (field as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const source = field.shadowRoot!.querySelector('.translation-field__source')!.getBoundingClientRect();
    const target = field.shadowRoot!.querySelector('.translation-field__target')!.getBoundingClientRect();
    expect(target.top).to.be.below(source.top);
  });
});
