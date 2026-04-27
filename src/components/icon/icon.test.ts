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
});
