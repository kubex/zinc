import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnTranslations from './translations.component';

describe('<zn-translations>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-translations></zn-translations> `);
    expect(el).to.exist;
  });

  it('should have default language en', async () => {
    const el = await fixture<ZnTranslations>(html` <zn-translations></zn-translations> `);
    expect(el.languages).to.have.property('en');
    // We expect values to default to en: '' if strictly following requirements,
    // or at least the UI should show it.
    // Based on my plan, I will implement auto-population of 'en'.
    expect(el.values).to.have.property('en');
  });

  it('should update value when input changes', async () => {
    const el = await fixture<ZnTranslations>(html` <zn-translations></zn-translations> `);
    // Mock languages to ensure we have something to edit
    el.languages = { 'en': 'English', 'fr': 'French' };
    el.values = { 'en': 'Hello' };
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('zn-inline-edit');
    expect(input).to.exist;
    await expect(input!.getAttribute('value')).to.equal('Hello');

    // Simulate change
    input!.value = 'Hello World';
    input!.dispatchEvent(new CustomEvent('zn-change'));

    await el.updateComplete;
    await expect(el.values['en']).to.equal('Hello World');
    await expect(JSON.parse(el.value)).to.deep.equal({'en': 'Hello World'});
  });
});
