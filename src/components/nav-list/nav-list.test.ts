import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import type ZnNavItem from '../nav-item';
import type ZnNavList from './nav-list.component';

const search = async (list: ZnNavList, value: string) => {
  const input = list.shadowRoot!.querySelector('zn-input')!;
  input.value = value;
  input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
  await list.updateComplete;
};

describe('<zn-nav-list>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`<zn-nav-list></zn-nav-list>`);
    expect(el).to.exist;
  });

  it('should switch zn-tabs panels and mark the selected item', async () => {
    const tabs = await fixture(html`
      <zn-tabs gap>
        <zn-nav-list slot="left">
          <zn-nav-item tab="" count="4">Monthly plans</zn-nav-item>
          <zn-nav-item tab="annual">Annual plans</zn-nav-item>
        </zn-nav-list>
        <div id="">Monthly contents</div>
        <div id="annual">Annual contents</div>
      </zn-tabs>
    `);
    await aTimeout(50);

    const items = [...tabs.querySelectorAll<ZnNavItem>('zn-nav-item')];
    expect(items.map(item => item.getAttribute('aria-selected'))).to.deep.equal(['true', 'false']);

    items[1].click();
    await aTimeout(50);

    expect(items.map(item => item.getAttribute('aria-selected'))).to.deep.equal(['false', 'true']);
    expect(items.map(item => item.tabIndex)).to.deep.equal([-1, 0]);
    expect(tabs.querySelector('#annual')!.hasAttribute('selected')).to.be.true;
  });

  it('should render the count', async () => {
    const el = await fixture<ZnNavItem>(html`<zn-nav-item count="12">Leads</zn-nav-item>`);
    expect(el.shadowRoot!.querySelector('[part="count"]')!.textContent).to.equal('12');
  });

  it('should filter items by label and show the empty message', async () => {
    const list = await fixture<ZnNavList>(html`
      <zn-nav-list searchable>
        <zn-nav-item>Monthly plans</zn-nav-item>
        <zn-nav-item>Annual plans</zn-nav-item>
        <zn-nav-item>Billing</zn-nav-item>
      </zn-nav-list>
    `);
    const items = [...list.querySelectorAll<ZnNavItem>('zn-nav-item')];

    await search(list, 'plans');
    expect(items.map(item => item.hidden)).to.deep.equal([false, false, true]);
    expect(items.map(item => item.tabIndex)).to.deep.equal([0, -1, -1]);

    await search(list, 'nothing');
    expect(list.shadowRoot!.querySelector('[part="empty"]')).to.exist;

    await search(list, '');
    expect(items.map(item => item.hidden)).to.deep.equal([false, false, false]);
  });

  it('should move focus with the arrow keys', async () => {
    const list = await fixture<ZnNavList>(html`
      <zn-nav-list>
        <zn-nav-item>One</zn-nav-item>
        <zn-nav-item>Two</zn-nav-item>
      </zn-nav-list>
    `);
    const items = [...list.querySelectorAll<ZnNavItem>('zn-nav-item')];

    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true, composed: true}));

    expect(document.activeElement).to.equal(items[1]);
    expect(items.map(item => item.tabIndex)).to.deep.equal([-1, 0]);
  });

  describe('sortable', () => {
    const order = (form: HTMLFormElement) =>
      (JSON.parse(String(new FormData(form).get('order'))) as {key: string; priority: number}[])
        .map(({key, priority}) => `${key}=${priority}`);

    it('shows a caption and header actions', async () => {
      const list = await fixture<ZnNavList>(html`
        <zn-nav-list caption="Sections"><button slot="actions">Add</button></zn-nav-list>
      `);
      await list.updateComplete;

      expect(list.shadowRoot!.querySelector('.nav-list__caption')!.textContent).to.equal('Sections');
      expect(list.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="actions"]')!.assignedElements()).to.have.length(1);
    });

    it('submits the order with the form and marks the items as draggable', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <zn-nav-list sortable name="order">
            <zn-nav-item tab="a" value="a">A</zn-nav-item>
            <zn-nav-item tab="b" value="b">B</zn-nav-item>
          </zn-nav-list>
        </form>
      `);
      const list = form.querySelector<ZnNavList>('zn-nav-list')!;
      await list.updateComplete;

      const items = [...list.querySelectorAll<ZnNavItem>('zn-nav-item')];
      expect(items.every(item => item.hasAttribute('sortable') && item.draggable)).to.be.true;
      expect(order(form)).to.deep.equal(['a=1', 'b=2']);
      expect(list.querySelector('input')).to.not.exist;
    });

    it('moves an item with Alt+Arrow keys and submits the new order', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <zn-nav-list sortable name="order" formaction="/reorder">
            <zn-nav-item tab="a" value="a">A</zn-nav-item>
            <zn-nav-item tab="b" value="b">B</zn-nav-item>
          </zn-nav-list>
        </form>
      `);
      const list = form.querySelector<ZnNavList>('zn-nav-list')!;
      await list.updateComplete;

      let submittedTo = '';
      let submitted: string[] = [];
      form.addEventListener('submit', (e: SubmitEvent) => {
        e.preventDefault();
        submittedTo = e.submitter?.getAttribute('formaction') ?? '';
        submitted = order(form);
      });

      const first = list.querySelector<ZnNavItem>('zn-nav-item[value="a"]')!;
      first.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', altKey: true, bubbles: true, composed: true}));

      expect([...list.querySelectorAll('zn-nav-item')].map(item => item.getAttribute('value'))).to.deep.equal(['b', 'a']);
      expect(submittedTo).to.equal('/reorder');
      expect(submitted).to.deep.equal(['b=1', 'a=2']);
    });

    it('reorders by drag and drop', async () => {
      const list = await fixture<ZnNavList>(html`
        <zn-nav-list sortable name="order">
          <zn-nav-item value="a">A</zn-nav-item>
          <zn-nav-item value="b">B</zn-nav-item>
        </zn-nav-list>
      `);
      await list.updateComplete;
      let reordered = 0;
      list.addEventListener('zn-reorder', () => reordered++);

      const [a, b] = [...list.querySelectorAll<ZnNavItem>('zn-nav-item')];
      const rect = b.getBoundingClientRect();
      a.dispatchEvent(new DragEvent('dragstart', {bubbles: true, composed: true, dataTransfer: new DataTransfer()}));
      b.dispatchEvent(new DragEvent('dragover', {bubbles: true, composed: true, cancelable: true, clientY: rect.bottom - 1}));
      a.dispatchEvent(new DragEvent('dragend', {bubbles: true, composed: true}));

      expect([...list.querySelectorAll('zn-nav-item')].map(item => item.getAttribute('value'))).to.deep.equal(['b', 'a']);
      expect(reordered).to.equal(1);
    });

    it('accepts a drop in the space between items, so letting go there keeps the new order', async () => {
      const list = await fixture<ZnNavList>(html`
        <zn-nav-list sortable name="order">
          <zn-nav-item value="a">A</zn-nav-item>
          <zn-nav-item value="b">B</zn-nav-item>
        </zn-nav-list>
      `);
      await list.updateComplete;

      const a = list.querySelector<ZnNavItem>('zn-nav-item')!;
      a.dispatchEvent(new DragEvent('dragstart', {bubbles: true, composed: true, dataTransfer: new DataTransfer()}));
      const gap = new DragEvent('dragover', {bubbles: true, composed: true, cancelable: true});
      list.shadowRoot!.querySelector('.nav-list__list')!.dispatchEvent(gap);

      expect(gap.defaultPrevented).to.be.true;
    });

    it('leaves the order alone when not sortable', async () => {
      const list = await fixture<ZnNavList>(html`
        <zn-nav-list name="order">
          <zn-nav-item value="a">A</zn-nav-item>
          <zn-nav-item value="b">B</zn-nav-item>
        </zn-nav-list>
      `);
      await list.updateComplete;
      const first = list.querySelector<ZnNavItem>('zn-nav-item')!;
      first.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', altKey: true, bubbles: true, composed: true}));

      expect([...list.querySelectorAll('zn-nav-item')].map(item => item.getAttribute('value'))).to.deep.equal(['a', 'b']);
      expect(list.querySelector('input')).to.not.exist;
    });
  });
});
