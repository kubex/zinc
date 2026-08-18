import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import {
  filterSlashItems,
  getSlashMenuPreset,
  parseSlashItems,
  registerSlashMenuPreset,
  unregisterSlashMenuPreset
} from './slash-menu-items';
import type ZnSlashMenu from './slash-menu.component';

describe('<zn-slash-menu>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-slash-menu></zn-slash-menu>`);

    expect(el).to.exist;
  });

  it('lists the items it is given and starts on the first one', async () => {
    const el = await fixture<ZnSlashMenu>(html`
      <zn-slash-menu></zn-slash-menu>`);
    el.items = [{label: 'Brand name', value: '{{BRAND_NAME}}'}, {label: 'Legal entity', value: '{{LEGAL_ENTITY}}'}];
    el.show();
    await el.updateComplete;

    const items = el.shadowRoot!.querySelectorAll('[data-slash-item]');
    expect(items.length).to.equal(2);
    expect(el.activeItem?.label).to.equal('Brand name');
  });

  it('wraps when moving past either end and skips disabled items', async () => {
    const el = await fixture<ZnSlashMenu>(html`
      <zn-slash-menu></zn-slash-menu>`);
    el.items = [
      {label: 'One', value: '1'},
      {label: 'Two', value: '2', disabled: true},
      {label: 'Three', value: '3'}
    ];
    await el.updateComplete;

    el.moveActive(1);
    expect(el.activeItem?.label, 'skips the disabled item').to.equal('Three');

    el.moveActive(1);
    expect(el.activeItem?.label, 'wraps to the start').to.equal('One');

    el.moveActive(-1);
    expect(el.activeItem?.label, 'wraps to the end').to.equal('Three');
  });

  it('emits zn-slash-item-select when an item is clicked, without stealing focus', async () => {
    const el = await fixture<ZnSlashMenu>(html`
      <zn-slash-menu></zn-slash-menu>`);
    el.items = [{label: 'Brand name', value: '{{BRAND_NAME}}'}];
    el.show();
    await el.updateComplete;

    const selected: string[] = [];
    el.addEventListener('zn-slash-item-select', (event: Event) => {
      selected.push((event as CustomEvent<{item: {label: string}}>).detail.item.label);
    });

    const item = el.shadowRoot!.querySelector<HTMLButtonElement>('[data-slash-item]')!;
    const event = new MouseEvent('mousedown', {bubbles: true, cancelable: true, composed: true});

    let reachedDocument = false;
    const documentListener = () => {
      reachedDocument = true;
    };
    document.addEventListener('mousedown', documentListener);
    try {
      item.dispatchEvent(event);
    } finally {
      document.removeEventListener('mousedown', documentListener);
    }

    expect(selected).to.deep.equal(['Brand name']);
    expect(event.defaultPrevented, 'mousedown is prevented so the field keeps focus').to.be.true;
    // A selection may open another overlay; the mousedown must not leak to its outside-click dismisser
    expect(reachedDocument, 'mousedown does not bubble to document').to.be.false;
  });

  it('shows the keyboard hints unless they are hidden', async () => {
    const el = await fixture<ZnSlashMenu>(html`
      <zn-slash-menu></zn-slash-menu>`);
    el.items = [{label: 'One'}];
    el.show();
    await el.updateComplete;

    const hints = el.shadowRoot!.querySelector('[part="hints"]')!;
    expect(hints).to.exist;
    expect(hints.textContent).to.contain('navigate');
    expect(hints.textContent).to.contain('select');
    expect(hints.textContent).to.contain('dismiss');
    expect(hints.querySelectorAll('kbd').length).to.equal(4);

    el.hideHints = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[part="hints"]')).to.not.exist;
  });

  describe('recently used', () => {
    const key = 'slash-menu-test';
    const labelsOf = (el: ZnSlashMenu) =>
      [...el.shadowRoot!.querySelectorAll('[data-slash-item] .slash-menu__label')].map(node => node.textContent);

    const choose = async (el: ZnSlashMenu, label: string) => {
      const buttons = [...el.shadowRoot!.querySelectorAll<HTMLElement>('[data-slash-item]')];
      const button = buttons.find(item => item.querySelector('.slash-menu__label')?.textContent === label);
      button!.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));
      await el.updateComplete;
    };

    const items = [
      {label: 'One', value: '1'},
      {label: 'Two', value: '2'},
      {label: 'Three', value: '3'}
    ];

    beforeEach(() => localStorage.removeItem('zn-slash-recent:' + key));

    it('lists the items chosen here first, newest first, and remembers them', async () => {
      const el = await fixture<ZnSlashMenu>(html`
        <zn-slash-menu recent-key=${key} max-recent="2"></zn-slash-menu>`);
      el.items = items;
      el.show();
      await el.updateComplete;

      expect(labelsOf(el), 'nothing has been chosen yet').to.eql(['One', 'Two', 'Three']);

      await choose(el, 'Three');
      await choose(el, 'Two');

      expect(labelsOf(el)).to.eql(['Two', 'Three', 'One', 'Two', 'Three']);
      expect(el.shadowRoot!.querySelector('[part="group-heading"]')!.textContent).to.contain('Recently used');
      expect(el.activeItem?.label, 'starts on the most recent item').to.equal('Two');

      const other = await fixture<ZnSlashMenu>(html`
        <zn-slash-menu recent-key=${key} max-recent="2" recent-heading="Your favourites"></zn-slash-menu>`);
      other.items = items;
      other.show();
      await other.updateComplete;

      expect(labelsOf(other), 'the list outlives the element').to.eql(['Two', 'Three', 'One', 'Two', 'Three']);
      expect(other.shadowRoot!.querySelector('[part="group-heading"]')!.textContent).to.contain('Your favourites');

      other.clearRecent();
      await other.updateComplete;
      expect(labelsOf(other)).to.eql(['One', 'Two', 'Three']);
    });

    it('closes the section with a rule only when the items below it have no heading', async () => {
      const el = await fixture<ZnSlashMenu>(html`
        <zn-slash-menu recent-key=${key}></zn-slash-menu>`);
      el.items = items;
      el.show();
      await el.updateComplete;

      await choose(el, 'Two');
      expect(el.shadowRoot!.querySelector('[part="divider"]'), 'ungrouped items get a rule').to.exist;

      el.items = items.map(item => ({...item, group: 'Basic blocks'}));
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector('[part="divider"]'), 'a group heading separates them already').to.not.exist;
      expect(el.shadowRoot!.querySelectorAll('[part="group-heading"]').length).to.equal(2);
    });

    it('stands aside while the user is searching, and stays off without a key', async () => {
      const el = await fixture<ZnSlashMenu>(html`
        <zn-slash-menu recent-key=${key}></zn-slash-menu>`);
      el.items = items;
      el.show();
      await el.updateComplete;

      await choose(el, 'Three');
      el.query = 'o';
      await el.updateComplete;

      expect(labelsOf(el), 'the ranked matches are the answer to a query').to.eql(['One', 'Two', 'Three']);

      el.recentKey = '';
      el.query = '';
      await el.updateComplete;

      expect(labelsOf(el)).to.eql(['One', 'Two', 'Three']);
    });
  });

  it('reports how many matches were not rendered', async () => {
    const el = await fixture<ZnSlashMenu>(html`
      <zn-slash-menu max-items="2"></zn-slash-menu>`);
    el.items = [{label: 'One'}, {label: 'Two'}, {label: 'Three'}];
    el.show();
    await el.updateComplete;

    expect(el.shadowRoot!.querySelectorAll('[data-slash-item]').length).to.equal(2);
    expect(el.shadowRoot!.querySelector('[part="footer"]')?.textContent).to.contain('1 more');
  });
});

describe('slash menu items', () => {
  describe('parseSlashItems', () => {
    it('parses a JSON array', () => {
      const items = parseSlashItems('[{"label":"Brand name","value":"{{BRAND_NAME}}"}]');

      expect(items).to.deep.equal([{label: 'Brand name', value: '{{BRAND_NAME}}'}]);
    });

    it('parses the label=value shorthand', () => {
      const items = parseSlashItems('Brand name={{BRAND_NAME}}, {{SUPPORT_EMAIL}}');

      expect(items).to.deep.equal([
        {label: 'Brand name', value: '{{BRAND_NAME}}'},
        {label: '{{SUPPORT_EMAIL}}', value: '{{SUPPORT_EMAIL}}'}
      ]);
    });

    it('returns nothing for empty or unparsable input', () => {
      expect(parseSlashItems('')).to.deep.equal([]);
      expect(parseSlashItems(null)).to.deep.equal([]);
      expect(parseSlashItems('[{"nope":true}')).to.deep.equal([]);
    });
  });

  describe('filterSlashItems', () => {
    const items = [
      {label: 'Support email', value: '{{SUPPORT_EMAIL}}', keywords: 'contact'},
      {label: 'Brand name', value: '{{BRAND_NAME}}', description: 'Trading name'},
      {label: 'Jurisdiction', value: '{{BRAND_JURISDICTION}}'}
    ];

    it('keeps declaration order for an empty query', () => {
      expect(filterSlashItems(items, '').map(item => item.label))
        .to.deep.equal(['Support email', 'Brand name', 'Jurisdiction']);
    });

    it('ranks label matches above value and keyword matches', () => {
      expect(filterSlashItems(items, 'brand').map(item => item.label))
        .to.deep.equal(['Brand name', 'Jurisdiction']);
    });

    it('matches keywords and descriptions', () => {
      expect(filterSlashItems(items, 'contact').map(item => item.label)).to.deep.equal(['Support email']);
      expect(filterSlashItems(items, 'trading').map(item => item.label)).to.deep.equal(['Brand name']);
    });

    it('honours order over declaration order', () => {
      const ordered = filterSlashItems([{label: 'Second', order: 2}, {label: 'First', order: 1}], '');

      expect(ordered.map(item => item.label)).to.deep.equal(['First', 'Second']);
    });

    it('drops items that match nothing', () => {
      expect(filterSlashItems(items, 'nothing here')).to.deep.equal([]);
    });
  });

  describe('presets', () => {
    it('resolves registered presets by name', () => {
      registerSlashMenuPreset('test-legal', [{label: 'Brand name', value: '{{BRAND_NAME}}'}]);
      registerSlashMenuPreset('test-support', [{label: 'Support email', value: '{{SUPPORT_EMAIL}}'}]);

      expect(getSlashMenuPreset('test-legal, test-support').map(item => item.label))
        .to.deep.equal(['Brand name', 'Support email']);

      unregisterSlashMenuPreset('test-legal');
      unregisterSlashMenuPreset('test-support');
      expect(getSlashMenuPreset('test-legal')).to.deep.equal([]);
    });
  });
});
