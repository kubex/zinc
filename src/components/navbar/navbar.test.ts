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

  it('spaces a tab off its top edge by --zn-navbar-tab-padding-top', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar style="--zn-navbar-tab-padding-top: 13px"
                 navigation='[{"tab":"","title":"Charge","active":true},{"tab":"items","title":"Items"}]'></zn-navbar>
    `);
    await aTimeout(100);

    const tab = el.shadowRoot!.querySelector<HTMLElement>('ul.navbar > li')!;
    expect(getComputedStyle(tab).paddingTop).to.equal('13px');
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

  it('navigates once when a light DOM link item is clicked', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar>
        <li href="/one" data-target="stats">One</li>
      </zn-navbar>
    `);
    await aTimeout(20);

    const linkTargets: Element[] = [];
    const record = (e: Event) => {
      const link = e.composedPath().find(n => n instanceof Element && (n.hasAttribute('href') || n.hasAttribute('data-uri')));
      if (link) {
        linkTargets.push(link as Element);
      }
    };
    document.addEventListener('click', record);
    try {
      el.shadowRoot!.querySelector<HTMLElement>('ul.navbar > li')!.click();
    } finally {
      document.removeEventListener('click', record);
    }

    expect(linkTargets).to.deep.equal([el.querySelector('li')]);
  });

  it('moves the active pill when a light DOM item becomes active', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar pill>
        <li class="active">One</li>
        <li>Two</li>
      </zn-navbar>
    `);
    await aTimeout(20);

    const [one, two] = el.querySelectorAll('li');
    one.classList.remove('active');
    two.classList.add('active');
    await aTimeout(20);

    const drawn = Array.from(el.shadowRoot!.querySelectorAll('ul.navbar > li:not(.more)'));
    expect(drawn.map(li => li.classList.contains('active'))).to.deep.equal([false, true]);
  });

  it('relabels a drawn tab in place when its light DOM item is relabelled', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar pill>
        <li>One</li>
        <li class="active"><span>2–13 Nov</span></li>
      </zn-navbar>
    `);
    await aTimeout(20);
    const drawn = el.shadowRoot!.querySelectorAll('ul.navbar > li')[1];

    el.querySelector('span')!.textContent = 'Custom';
    await aTimeout(20);

    expect(el.shadowRoot!.querySelectorAll('ul.navbar > li')[1]).to.equal(drawn);
    expect(drawn.textContent!.trim()).to.equal('Custom');
  });

  it('shows no More item after the active tab shrinks as the pill leaves it', async () => {
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar pill slot="actions">
        <li>One</li>
        <li class="active"><span>20 Dec 2025 – 5 Jan 2026</span></li>
      </zn-navbar>
    `);
    await aTimeout(400);

    const [one, custom] = el.querySelectorAll('li');
    one.classList.add('active');
    custom.classList.remove('active');
    custom.querySelector('span')!.textContent = 'Custom';
    await aTimeout(600);

    const more = el.shadowRoot!.querySelector('.navbar__more')!;
    expect(more.classList.contains('navbar__more--shown')).to.be.false;
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

  it('collapses the tabs that do not fit into a More menu', async () => {
    const tabs = Array.from({length: 12}, (_, i) => ({tab: `t${i}`, title: `Tab number ${i}`}));
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar style="width: 400px" navigation="${JSON.stringify(tabs)}"></zn-navbar>
    `);
    await aTimeout(150);

    const strip = el.shadowRoot!.querySelector<HTMLElement>('.navbar__strip')!;
    const more = el.shadowRoot!.querySelector<HTMLElement>('.navbar__more')!;
    const collapsed = el.shadowRoot!.querySelectorAll('ul.navbar > li.navbar__item--overflow');
    expect(more.classList.contains('navbar__more--shown')).to.be.true;
    expect(collapsed.length).to.be.within(1, 11);
    expect(more.getBoundingClientRect().right).to.be.at.most(strip.getBoundingClientRect().right + 1);

    el.style.width = '2400px';
    await waitUntil(() => !more.classList.contains('navbar__more--shown'), 'More should hide once every tab fits');
    expect(el.shadowRoot!.querySelectorAll('ul.navbar > li.navbar__item--overflow').length).to.equal(0);
  });

  it('lists the collapsed tabs in the More menu and selects one from it', async () => {
    const tabs = Array.from({length: 12}, (_, i) => ({tab: `t${i}`, title: `Tab number ${i}`}));
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar style="width: 400px" navigation="${JSON.stringify(tabs)}"></zn-navbar>
    `);
    await aTimeout(150);

    const collapsed = el.shadowRoot!.querySelectorAll<HTMLElement>('ul.navbar > li.navbar__item--overflow');
    const dropdown = el.shadowRoot!.querySelector<HTMLElement & {show: () => Promise<void>}>('.navbar__more zn-dropdown')!;
    await dropdown.show();
    const entries = el.shadowRoot!.querySelectorAll<HTMLElement>('.navbar__more zn-menu-item');
    expect(entries.length).to.equal(collapsed.length);
    expect(entries[0].textContent).to.equal(collapsed[0].textContent!.trim());

    let selected: HTMLElement | null = null;
    el.addEventListener('zn-select', (e: Event) => { selected = (e as CustomEvent<{item: HTMLElement}>).detail.item; });
    entries[0].click();
    expect(selected).to.equal(collapsed[0]);
  });

  it('marks the More item active while the active tab is collapsed', async () => {
    const tabs = Array.from({length: 12}, (_, i) => ({tab: `t${i}`, title: `Tab number ${i}`}));
    const el = await fixture<ZnNavbar>(html`
      <zn-navbar style="width: 400px" navigation="${JSON.stringify(tabs)}"></zn-navbar>
    `);
    await aTimeout(150);

    const more = el.shadowRoot!.querySelector<HTMLElement>('.navbar__more')!;
    el.shadowRoot!.querySelectorAll<HTMLElement>('ul.navbar > li')[11].classList.add('active');
    await waitUntil(() => more.classList.contains('active'), 'More should take the active state');

    await more.querySelector<HTMLElement & {show: () => Promise<void>}>('zn-dropdown')!.show();
    const active = Array.from(more.querySelectorAll<HTMLElement>('zn-menu-item')).filter(entry => entry.hasAttribute('checked'));
    expect(active.map(entry => entry.textContent)).to.deep.equal(['Tab number 11']);
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

  it('colours and sizes an item icon and labels an icon-only item with a tooltip below', async () => {
    const navbar = await fixture<ZnNavbar>(html`
      <zn-navbar isolated
                 navigation='[{"tab":"","title":"All","active":true},{"tab":"sent","title":"","icon":"send@lu","iconColor":"success","iconSize":16,"label":"Sent"}]'></zn-navbar>
    `);
    const item = navbar.shadowRoot!.querySelector<HTMLElement>('li[data-tab="sent"]')!;

    expect(item.querySelector('zn-tooltip')!.getAttribute('content')).to.equal('Sent');
    expect(item.querySelector('zn-tooltip')!.getAttribute('placement')).to.equal('bottom');
    expect(item.querySelector('zn-icon')!.getAttribute('color')).to.equal('success');
    expect(item.querySelector('zn-icon')!.getAttribute('size')).to.equal('16');
    expect(navbar.shadowRoot!.querySelector('li[data-tab=""] zn-tooltip')).to.be.null;

    // The tooltip's anchor takes over the tab's padding, so it spans the whole tab
    const tip = item.querySelector<HTMLElement>('.navbar__tip')!;
    expect(getComputedStyle(item).paddingLeft).to.equal('0px');
    expect(tip.getBoundingClientRect().width).to.be.closeTo(item.getBoundingClientRect().width, 1);
    expect(item.querySelector('[part="navbar-item-body"] zn-icon')).to.exist;
  });

  it('shares the full width equally between tabs with full-width', async () => {
    const navbar = await fixture<ZnNavbar>(html`
      <div style="width: 400px">
        <zn-navbar full-width navigation='[{"tab":"","title":"All","active":true},{"tab":"a","title":"A much longer tab"}]'></zn-navbar>
      </div>
    `).then(wrapper => wrapper.querySelector<ZnNavbar>('zn-navbar')!);
    await navbar.updateComplete;
    const [first, second] = [...navbar.shadowRoot!.querySelectorAll<HTMLElement>('li[part="navbar-item"]')];

    expect(first.getBoundingClientRect().width).to.be.closeTo(second.getBoundingClientRect().width, 1);
    expect(first.getBoundingClientRect().width + second.getBoundingClientRect().width).to.be.closeTo(400, 2);
  });

  describe('count', () => {
    class CountShadowHost extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({mode: 'open'}).innerHTML = '<div class="item"></div><div class="item" read></div>';
      }
    }
    if (!customElements.get('count-shadow-host')) customElements.define('count-shadow-host', CountShadowHost);

    const badge = (navbar: Element) => navbar.shadowRoot!.querySelector('[part="count"]')?.textContent ?? '';
    const unread = `[{"tab":"","title":"All","active":true},{"tab":"read","title":"Unread","count":".item:not([read])"}]`;

    it('counts matching items, including filtered-out ones, and updates live', async () => {
      const container = await fixture(html`
        <zn-settings-container no-settings>
          <zn-navbar isolated navigation=${unread}></zn-navbar>
          <div class="item"></div>
          <div class="item"></div>
          <div class="item" hidden></div>
          <div class="item" read></div>
        </zn-settings-container>
      `);
      const navbar = container.querySelector('zn-navbar')!;
      await waitUntil(() => badge(navbar) === '3', 'counts the three unread items');

      container.querySelector('.item:not([read])')!.setAttribute('read', '');
      await waitUntil(() => badge(navbar) === '2', 'an item marked read leaves the count');

      container.querySelector('.item[hidden]')!.remove();
      await waitUntil(() => badge(navbar) === '1', 'a removed item leaves the count');

      container.querySelector('.item:not([read])')!.setAttribute('read', '');
      await waitUntil(() => badge(navbar) === '', 'no badge at zero');
    });

    it('shows a zero badge with show-zero-counts', async () => {
      const container = await fixture(html`
        <zn-settings-container no-settings>
          <zn-navbar isolated show-zero-counts navigation=${unread}></zn-navbar>
          <div class="item" read></div>
        </zn-settings-container>
      `);
      const navbar = container.querySelector('zn-navbar')!;
      await waitUntil(() => badge(navbar) === '0', 'zero badge shown');
      expect(navbar.shadowRoot!.querySelectorAll('[part="count"]').length).to.equal(1);
    });

    it('shows a numeric count as given, and follows a new navigation', async () => {
      const navbar = await fixture<HTMLElement & { navigation: object[] }>(html`
        <zn-navbar isolated navigation='[{"tab":"","title":"All","count":240},{"tab":"new","title":"New","count":12}]'></zn-navbar>
      `);
      const badges = () => [...navbar.shadowRoot!.querySelectorAll('[part="count"]')].map(el => el.textContent);
      await waitUntil(() => badges().length === 2, 'numeric badges shown');
      expect(badges()).to.deep.equal(['240', '12']);

      navbar.navigation = [{tab: '', title: 'All', count: 241}, {tab: 'new', title: 'New', count: 13}];
      await waitUntil(() => badges()[0] === '241', 'badges follow the navigation');
      expect(badges()).to.deep.equal(['241', '13']);
    });

    it('mutes a count of 0 and colours a count above 0 with its countColor', async () => {
      const navbar = await fixture<HTMLElement & { navigation: object[] }>(html`
        <zn-navbar isolated show-zero-counts
                   navigation='[{"tab":"","title":"All","count":0},{"tab":"late","title":"Late","count":3,"countColor":"error"},{"tab":"none","title":"None","count":0,"countColor":"error"}]'></zn-navbar>
      `);
      const badges = () => [...navbar.shadowRoot!.querySelectorAll<HTMLElement>('[part="count"]')];
      await waitUntil(() => badges().length === 3, 'badges shown');
      const [all, late, none] = badges();

      expect(all.classList.contains('navbar__count--zero')).to.be.true;
      expect(late.classList.contains('navbar__count--error')).to.be.true;
      expect(none.classList.contains('navbar__count--zero')).to.be.true;
      expect(none.classList.contains('navbar__count--error')).to.be.false;
    });

    it('counts and watches items inside open shadow roots', async () => {
      const container = await fixture(html`
        <zn-settings-container no-settings>
          <zn-navbar isolated navigation=${unread}></zn-navbar>
          <count-shadow-host></count-shadow-host>
        </zn-settings-container>
      `);
      const navbar = container.querySelector('zn-navbar')!;
      await waitUntil(() => badge(navbar) === '1', 'counts the unread item in the shadow root');

      const shadow = container.querySelector('count-shadow-host')!.shadowRoot!;
      const added = document.createElement('div');
      added.className = 'item';
      shadow.append(added);
      await waitUntil(() => badge(navbar) === '2', 'sees an item added inside the shadow root');

      shadow.querySelector('.item[read]')!.removeAttribute('read');
      await waitUntil(() => badge(navbar) === '3', 'sees an attribute change inside the shadow root');
    });

    it('finds its settings container from inside another shadow root', async () => {
      const container = await fixture(html`
        <zn-settings-container no-settings>
          <div class="nav-host"></div>
          <div class="item"></div>
          <div class="item"></div>
        </zn-settings-container>
      `);
      const shadow = container.querySelector('.nav-host')!.attachShadow({mode: 'open'});
      const navbar = document.createElement('zn-navbar') as ZnNavbar;
      navbar.setAttribute('navigation', unread);
      shadow.append(navbar);
      await waitUntil(() => badge(navbar) === '2', 'counts the container items across the shadow boundary');
    });

    it('shows the count inline after a separator with count-style="inline"', async () => {
      const container = await fixture(html`
        <zn-settings-container no-settings>
          <zn-navbar isolated count-style="inline" navigation=${unread}></zn-navbar>
          <div class="item"></div>
        </zn-settings-container>
      `);
      const navbar = container.querySelector('zn-navbar')!;
      await waitUntil(() => badge(navbar) === '1', 'counts the unread item');
      const count = navbar.shadowRoot!.querySelector<HTMLElement>('[part="count"]')!;
      const tab = count.closest('li')!;
      expect(getComputedStyle(count).backgroundColor).to.equal('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(count).color).to.equal(getComputedStyle(tab).color);
      expect(getComputedStyle(count, '::before').content).to.contain('·');
    });

    it('never counts its own shadow DOM and ignores invalid selectors', async () => {
      const el = await fixture<ZnNavbar>(html`
        <div>
          <zn-navbar navigation='[{"tab":"a","title":"Own","count":"li"},{"tab":"b","title":"Bad","count":"::nope("}]'></zn-navbar>
          <ul><li>Outside</li></ul>
        </div>
      `);
      const navbar = el.querySelector('zn-navbar')!;
      await waitUntil(() => navbar.shadowRoot!.querySelectorAll('[part="count"]').length === 1, 'renders one badge');
      expect(badge(navbar)).to.equal('1');
    });
  });

  it('keeps a compact icon tab\'s count beside its icon', async () => {
    const navbar = await fixture<HTMLElement>(html`
      <zn-navbar compact full-width isolated style="width: 360px"
                 navigation='[{"tab":"","title":"","icon":"inbox@lu","label":"New","count":12}]'></zn-navbar>
    `);
    await waitUntil(() => navbar.shadowRoot!.querySelector('[part="count"]'), 'count shown');
    const body = navbar.shadowRoot!.querySelector<HTMLElement>('[part="navbar-item-body"]')!;
    const icon = body.querySelector('zn-icon')!;
    const count = body.querySelector<HTMLElement>('[part="count"]')!;

    expect(getComputedStyle(icon).flexGrow).to.equal('0');
    expect(count.getBoundingClientRect().left - icon.getBoundingClientRect().right).to.be.below(12);
  });
});
