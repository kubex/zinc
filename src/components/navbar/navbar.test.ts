import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html, waitUntil} from '@open-wc/testing';
import {render} from 'lit';
import type ZnNavbar from './navbar.component';

describe('<zn-navbar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-navbar></zn-navbar> `);

    expect(el).to.exist;
  });

  it('fills the active tab with the sliding indicator when drawn as pills', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar pill navigation='[{"tab":"","title":"All","active":true},{"tab":"draft","title":"Draft"}]'></zn-navbar>
    `);
    await aTimeout(100);

    const indicator = el.shadowRoot!.querySelector<HTMLElement>('[part="indicator"]')!;
    const tab = el.shadowRoot!.querySelector<HTMLElement>('ul.navbar > li')!;
    expect(getComputedStyle(indicator).opacity).to.equal('1');
    expect(indicator.getBoundingClientRect().height).to.be.closeTo(tab.getBoundingClientRect().height, 1);
  });

  it('does not move Lit-owned light DOM items when the parent rerenders', async () => {
    const host = document.createElement('div');
    document.body.append(host);

    try {
      render(html`
        <zn-navbar>
          <li tab="one">One</li>
        </zn-navbar>
      `, host);
      await aTimeout(20);

      render(html`
        <zn-navbar>
          <li tab="one">One</li>
          <li tab="two">Two</li>
        </zn-navbar>
      `, host);
      await aTimeout(20);

      const navbar = host.querySelector<ZnNavbar>('zn-navbar')!;
      const shadowItems = navbar.shadowRoot!.querySelectorAll('li[tab]');
      const lightItems = navbar.querySelectorAll('li[tab]');

      expect(lightItems.length).to.equal(2);
      expect(shadowItems.length).to.equal(2);
      expect(shadowItems[0]).to.not.equal(lightItems[0]);
      expect(shadowItems[1].textContent?.trim()).to.equal('Two');
    } finally {
      render(html``, host);
      host.remove();
    }
  });

  it('keeps at least 200px for the tabs beside expandables', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar>
        <li>One</li>
        <li>Two</li>
        <zn-expanding-action></zn-expanding-action>
      </zn-navbar>
    `);
    await aTimeout(150);

    const strip = el.shadowRoot!.querySelector<HTMLElement>('.navbar__strip')!;
    expect(getComputedStyle(strip).minWidth).to.equal('200px');
    expect(strip.style.maxWidth).to.equal('');
  });

  it('gives an open fill expandable room by narrowing the tabs', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar>
        <li>One</li>
        <li>Two</li>
        <zn-expanding-action method="fill" open></zn-expanding-action>
      </zn-navbar>
    `);
    await aTimeout(150);

    const strip = el.shadowRoot!.querySelector<HTMLElement>('.navbar__strip')!;
    Object.defineProperty(el, 'offsetWidth', {configurable: true, get: () => 1100});

    el.handleResize();

    expect(strip.style.maxWidth).to.equal('300px');
  });

  it('shows a scroll arrow at each edge with tabs beyond it', async () => {
    const tabs = Array.from({length: 12}, (_, i) => ({tab: `t${i}`, title: `Tab number ${i}`}));
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar style="width: 400px" navigation="${JSON.stringify(tabs)}"></zn-navbar>
    `);
    await aTimeout(150);

    const strip = el.shadowRoot!.querySelector<HTMLElement>('.navbar__strip')!;
    const end = el.shadowRoot!.querySelector<HTMLElement>('.navbar__scroll--end')!;
    expect(strip.classList.contains('navbar__strip--scroll-start')).to.equal(false);
    expect(strip.classList.contains('navbar__strip--scroll-end')).to.equal(true);
    await waitUntil(() => getComputedStyle(end).opacity === '1', 'end arrow should show');

    strip.scrollLeft = strip.scrollWidth;
    strip.dispatchEvent(new Event('scroll'));

    expect(strip.classList.contains('navbar__strip--scroll-start')).to.equal(true);
    expect(strip.classList.contains('navbar__strip--scroll-end')).to.equal(false);
  });

  it('scrolls a newly active tab clear of the arrows', async () => {
    const tabs = Array.from({length: 12}, (_, i) => ({tab: `t${i}`, title: `Tab number ${i}`}));
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar style="width: 400px" navigation="${JSON.stringify(tabs)}"></zn-navbar>
    `);
    await aTimeout(150);

    const strip = el.shadowRoot!.querySelector<HTMLElement>('.navbar__strip')!;
    const tab = strip.querySelectorAll<HTMLElement>('ul.navbar > li')[6];
    tab.classList.add('active');
    await waitUntil(() => strip.scrollLeft > 0, 'strip should scroll to the active tab');
    await aTimeout(600);

    expect(tab.offsetLeft + tab.offsetWidth).to.be.at.most(strip.scrollLeft + strip.clientWidth - 55);
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

  it('paints tabs from the tab tokens', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar style="--zn-navbar-tab-background: rgb(1, 2, 3); --zn-navbar-tab-radius: 0px"
                 navigation='[{"path":"#a","title":"A"},{"path":"#b","title":"B"}]'></zn-navbar>`);
    await el.updateComplete;
    const tab = el.shadowRoot!.querySelector<HTMLElement>('ul.navbar > li:not(.active)')!;

    expect(getComputedStyle(tab).backgroundColor).to.equal('rgb(1, 2, 3)');
    expect(getComputedStyle(el.shadowRoot!.querySelector('ul.navbar > li')!).borderTopLeftRadius).to.equal('0px');
  });
});
