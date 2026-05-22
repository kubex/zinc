import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnNavbar from './navbar.component';

describe('<zn-navbar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-navbar></zn-navbar> `);

    expect(el).to.exist;
  });

  it('reserves at least 200px for visible nav items when expandables need space', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
        <li>Four</li>
        <zn-expanding-action></zn-expanding-action>
      </zn-navbar>
    `);
    await aTimeout(150);

    const nav = el.shadowRoot!.querySelector<HTMLElement>('ul.navbar')!;
    const expandable = el.shadowRoot!.querySelector<HTMLElement>('.expandables')!;
    const items = Array.from(nav.querySelectorAll<HTMLElement>(':scope > li:not(.more)'));

    Object.defineProperty(el, 'offsetWidth', {configurable: true, get: () => 500});
    Object.defineProperty(expandable, 'offsetWidth', {configurable: true, get: () => 400});
    Object.defineProperty(expandable, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({width: 400})
    });
    items.forEach(item => {
      Object.defineProperty(item, 'offsetWidth', {configurable: true, get: () => 120});
      Object.defineProperty(item, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({width: 120})
      });
    });

    el.handleResize();

    expect(getComputedStyle(nav).minWidth).to.equal('200px');
    expect(items[0].classList.contains('hidden')).to.equal(false);
    expect(items[1].classList.contains('hidden')).to.equal(true);
  });

  it('accounts for open fill expandables when collapsing nav items', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
        <li>Four</li>
        <zn-expanding-action method="fill" open></zn-expanding-action>
      </zn-navbar>
    `);
    await aTimeout(150);

    const nav = el.shadowRoot!.querySelector<HTMLElement>('ul.navbar')!;
    const expandable = el.shadowRoot!.querySelector<HTMLElement>('.expandables')!;
    const items = Array.from(nav.querySelectorAll<HTMLElement>(':scope > li:not(.more)'));

    Object.defineProperty(el, 'offsetWidth', {configurable: true, get: () => 1000});
    Object.defineProperty(expandable, 'offsetWidth', {configurable: true, get: () => 40});
    Object.defineProperty(expandable, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({width: 40})
    });
    items.forEach(item => {
      Object.defineProperty(item, 'offsetWidth', {configurable: true, get: () => 120});
      Object.defineProperty(item, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({width: 120})
      });
    });

    el.handleResize();

    expect(items[0].classList.contains('hidden')).to.equal(false);
    expect(items[1].classList.contains('hidden')).to.equal(true);
  });

  it('reserves nav padding and the more button before leaving items visible', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </zn-navbar>
    `);
    await aTimeout(150);

    const nav = el.shadowRoot!.querySelector<HTMLElement>('ul.navbar')!;
    const more = nav.querySelector<HTMLElement>(':scope > li.more')!;
    const items = Array.from(nav.querySelectorAll<HTMLElement>(':scope > li:not(.more)'));
    nav.style.paddingLeft = '20px';
    nav.style.paddingRight = '20px';

    Object.defineProperty(el, 'offsetWidth', {configurable: true, get: () => 290});
    Object.defineProperty(more, 'offsetWidth', {configurable: true, get: () => 60});
    Object.defineProperty(more, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({width: 60})
    });
    items.forEach(item => {
      Object.defineProperty(item, 'offsetWidth', {configurable: true, get: () => 120});
      Object.defineProperty(item, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({width: 120})
      });
    });

    el.handleResize();

    expect(items[0].classList.contains('hidden')).to.equal(false);
    expect(items[1].classList.contains('hidden')).to.equal(true);
    expect(nav.classList.contains('has-hidden')).to.equal(true);
  });

  describe('hide-one', () => {
    it('hides when only one item is present', async () => {
      const el = await fixture<ZnNavbar>(html`
        <zn-navbar hide-one>
          <li>Only</li>
        </zn-navbar>
      `);
      await aTimeout(0);

      expect(getComputedStyle(el).display).to.equal('none');
    });

    it('reveals when a second item is added dynamically', async () => {
      const el = await fixture<ZnNavbar>(html`
        <zn-navbar hide-one>
          <li>First</li>
        </zn-navbar>
      `);
      await aTimeout(0);
      expect(getComputedStyle(el).display).to.equal('none');

      const li = document.createElement('li');
      li.setAttribute('tab-uri', '/two');
      li.textContent = 'Second';
      el.addItem(li, false);
      await waitUntil(() => getComputedStyle(el).display !== 'none', 'navbar should become visible after second item added');
    });

    it('hides again when items drop back to one', async () => {
      const el = await fixture<ZnNavbar>(html`
        <zn-navbar hide-one>
          <li>First</li>
        </zn-navbar>
      `);
      const second = document.createElement('li');
      second.setAttribute('tab-uri', '/two');
      second.textContent = 'Second';
      el.addItem(second, false);
      await waitUntil(() => getComputedStyle(el).display !== 'none', 'navbar should become visible after second item added');

      second.remove();
      await waitUntil(() => getComputedStyle(el).display === 'none', 'navbar should hide after dropping back to one item');
    });
  });
});
