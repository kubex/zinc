import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import {centre, drop, dragTo, startDrag} from '../../internal/test-drag';
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

  it('should render the description', async () => {
    const el = await fixture<ZnNavItem>(html`<zn-nav-item description="Wrap-up and follow-up">Closing</zn-nav-item>`);
    expect(el.shadowRoot!.querySelector('[part="description"]')!.textContent).to.equal('Wrap-up and follow-up');
  });

  it('should mark its items when divided', async () => {
    const list = await fixture<ZnNavList>(html`
      <zn-nav-list divide>
        <zn-nav-item>General</zn-nav-item>
        <zn-nav-item>Closing</zn-nav-item>
      </zn-nav-list>
    `);
    await list.updateComplete;
    const items = [...list.querySelectorAll('zn-nav-item')];
    expect(items.every(item => item.hasAttribute('divide'))).to.be.true;

    list.divide = false;
    await list.updateComplete;
    expect(items.some(item => item.hasAttribute('divide'))).to.be.false;
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

    it('rounds a divided list placeholder into the card corner it moves into', async () => {
      const list = await fixture<ZnNavList>(html`
        <zn-nav-list divide sortable style="--zn-panel-border-radius: 12px">
          <zn-nav-item value="a">A</zn-nav-item>
          <zn-nav-item value="b">B</zn-nav-item>
          <zn-nav-item value="c">C</zn-nav-item>
        </zn-nav-list>
      `);
      await list.updateComplete;
      const items = [...list.querySelectorAll<ZnNavItem>('zn-nav-item')];
      const placeholderRadius = () => getComputedStyle(items[1].shadowRoot!.querySelector('.nav-item')!).borderRadius;

      startDrag(items[1]);
      await aTimeout(50);
      expect(placeholderRadius()).to.equal('0px');

      const last = items[2].getBoundingClientRect();
      dragTo(centre(items[2]).x, last.bottom - 1);
      await list.updateComplete;
      expect(placeholderRadius()).to.equal('0px 0px 12px 12px');
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      drop(0, 0);
    });

    it('submits the order with the form and marks the items as sortable', async () => {
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
      expect(items.every(item => item.hasAttribute('sortable'))).to.be.true;
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
      startDrag(a);
      dragTo(centre(b).x, rect.bottom - 1);
      drop(centre(b).x, rect.bottom - 1);

      expect([...list.querySelectorAll('zn-nav-item')].map(item => item.getAttribute('value'))).to.deep.equal(['b', 'a']);
      expect(reordered).to.equal(1);
    });

    it('restores the order when let go outside the list', async () => {
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
      startDrag(a);
      dragTo(centre(b).x, b.getBoundingClientRect().bottom - 1);
      expect([...list.querySelectorAll('zn-nav-item')].map(item => item.getAttribute('value'))).to.deep.equal(['b', 'a']);

      const outside = list.getBoundingClientRect();
      drop(outside.right + 50, outside.bottom + 50);
      expect([...list.querySelectorAll('zn-nav-item')].map(item => item.getAttribute('value'))).to.deep.equal(['a', 'b']);
      expect(reordered).to.equal(0);
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
