import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnIcon from './icon.component';

describe('<zn-icon>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-icon></zn-icon> `);

    expect(el).to.exist;
  });

  it('should build Gravatar URLs with a normalized SHA-256 hash', async () => {
    const el = await fixture<ZnIcon>(html`
      <zn-icon src="MyEmailAddress@example.com " library="gravatar" size="48"></zn-icon>
    `);

    const image = el.shadowRoot?.querySelector('img');
    expect(image?.getAttribute('src')).to.equal(
      'https://www.gravatar.com/avatar/84059b07d4be67b806386c0aad8070a23f18836bbaae342275dc0a83414c32ee?s=48'
    );
  });

  it('should pass fallback options through to Libravatar', async () => {
    const el = await fixture<ZnIcon>(html`
      <zn-icon src="nonexistent@example.com#identicon" library="libravatar" size="48"></zn-icon>
    `);

    const image = el.shadowRoot?.querySelector('img');
    expect(image?.getAttribute('src')).to.equal(
      'https://seccdn.libravatar.org/avatar/04e8703fcfb60849fb5c596abc8f3d7547c7e0099c3806a3ffec77a95dc02e25?s=48&d=identicon'
    );
  });

  it('should render Lucide icons as inline SVGs', async () => {
    const el = await fixture<ZnIcon>(html`
      <zn-icon src="cloud-upload" library="lucide" size="48"></zn-icon>
    `);

    const svg = el.shadowRoot?.querySelector('svg.lucide');

    expect(svg).to.exist;
    expect(svg?.getAttribute('part')).to.equal('icon');
    expect(svg?.querySelectorAll('path').length).to.be.greaterThan(0);
  });

  it('should support Lucide shorthand notation', async () => {
    const el = await fixture<ZnIcon>(html`
      <zn-icon src="circle-alert@lu" size="48"></zn-icon>
    `);

    const svg = el.shadowRoot?.querySelector('svg.lucide');

    expect(el.library).to.equal('lucide');
    expect(el.src).to.equal('circle-alert');
    expect(svg).to.exist;
  });

  it('should remove a matching library indicator from the icon src', async () => {
    const el = await fixture<ZnIcon>(html`
      <zn-icon src="home@lu" library="lucide" size="48"></zn-icon>
    `);

    const svg = el.shadowRoot?.querySelector('svg.lucide');

    expect(el.library).to.equal('lucide');
    expect(el.src).to.equal('home');
    expect(svg).to.exist;
  });

  it('should keep a mismatched library indicator in the icon src', async () => {
    const el = await fixture<ZnIcon>(html`
      <zn-icon src="home@lu" library="material-symbols-outlined" size="48"></zn-icon>
    `);

    expect(el.library).to.equal('material-symbols-outlined');
    expect(el.src).to.equal('home@lu');
  });

  it('should accept the named avatar sizes', async () => {
    const el = await fixture<ZnIcon>(html`<zn-icon src="Fiona Hart" library="avatar" size="lg"></zn-icon>`);
    expect(el.size).to.equal(40);
    expect(el.shadowRoot!.querySelector<HTMLElement>('.icon')!.getBoundingClientRect().width).to.equal(40);
  });

  it('should still accept a size in pixels', async () => {
    const el = await fixture<ZnIcon>(html`<zn-icon src="home" size="18"></zn-icon>`);
    expect(el.size).to.equal(18);
  });

  it('should show a presence dot only when presence is set', async () => {
    const el = await fixture<ZnIcon>(html`<zn-icon src="Ben Brooks" library="avatar" round></zn-icon>`);
    expect(el.shadowRoot!.querySelector('[part="presence"]')).to.be.null;

    el.presence = 'online';
    await el.updateComplete;
    const dot = el.shadowRoot!.querySelector('[part="presence"]')!;
    expect(dot.classList.contains('presence--online')).to.be.true;
    expect(dot.getAttribute('aria-label')).to.equal('online');
  });

  it('should name an avatar for assistive technology', async () => {
    const el = await fixture<ZnIcon>(html`<zn-icon src="BB" alt="Ben Brooks" library="avatar"></zn-icon>`);
    const text = el.shadowRoot!.querySelector('.avatar__text')!;
    expect(text.getAttribute('role')).to.equal('img');
    expect(text.getAttribute('aria-label')).to.equal('Ben Brooks');
  });
});
