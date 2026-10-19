import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';

describe('<zn-priority-list>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`<zn-priority-list></zn-priority-list>`);
    expect(el).to.exist;
  });

  it('should initialize order from slotted children', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <div value="alpha">Alpha</div>
        <div value="beta">Beta</div>
        <div value="gamma">Gamma</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    expect(el.value).to.deep.equal(['alpha', 'beta', 'gamma']);
  });

  it('should assign slot names to children based on value attribute', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <div value="first">First</div>
        <div value="second">Second</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const firstChild = el.querySelector('[value="first"]');
    const secondChild = el.querySelector('[value="second"]');
    expect(firstChild.getAttribute('slot')).to.equal('_item-first');
    expect(secondChild.getAttribute('slot')).to.equal('_item-second');
  });

  it('should render priority numbers starting from priorityStart', async () => {
    const el = await fixture(html`
      <zn-priority-list priority-start="10">
        <div value="a">A</div>
        <div value="b">B</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const priorities = el.shadowRoot.querySelectorAll('.priority-list__priority');
    expect(priorities[0].textContent.trim()).to.equal('10');
    expect(priorities[1].textContent.trim()).to.equal('11');
  });

  it('should return correct priority map', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <div value="x">X</div>
        <div value="y">Y</div>
        <div value="z">Z</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const map = el.getPriorityMap();
    expect(map).to.deep.equal([
      {key: 'x', priority: 1},
      {key: 'y', priority: 2},
      {key: 'z', priority: 3},
    ]);
  });

  it('should generate hidden inputs for form submission', async () => {
    const el = await fixture(html`
      <zn-priority-list name="priority">
        <div value="item1">Item 1</div>
        <div value="item2">Item 2</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const hiddenInputs = el.shadowRoot.querySelectorAll('.priority-list__hidden-inputs input[type="hidden"]');
    expect(hiddenInputs.length).to.equal(2);
    expect(hiddenInputs[0].name).to.equal('priority[item1]');
    expect(hiddenInputs[0].value).to.equal('1');
    expect(hiddenInputs[1].name).to.equal('priority[item2]');
    expect(hiddenInputs[1].value).to.equal('2');
  });

  it('should restore the original order when its form is reset', async () => {
    const form = await fixture(html`
      <form>
        <zn-priority-list name="order">
          <div value="alpha">Alpha</div>
          <div value="beta">Beta</div>
          <div value="gamma">Gamma</div>
        </zn-priority-list>
      </form>
    `) as HTMLFormElement;

    const el = form.querySelector('zn-priority-list') as any;
    await el.updateComplete;
    expect(el.value).to.deep.equal(['alpha', 'beta', 'gamma']);

    el.value = ['gamma', 'alpha', 'beta'];
    await el.updateComplete;
    expect(el.value).to.deep.equal(['gamma', 'alpha', 'beta']);

    form.reset();
    await el.updateComplete;
    expect(el.value).to.deep.equal(['alpha', 'beta', 'gamma']);
  });

  it('should not empty a populated list on reset', async () => {
    const form = await fixture(html`
      <form>
        <zn-priority-list name="order">
          <div value="alpha">Alpha</div>
          <div value="beta">Beta</div>
        </zn-priority-list>
      </form>
    `) as HTMLFormElement;

    const el = form.querySelector('zn-priority-list') as any;
    await el.updateComplete;

    el.defaultValue = [];
    form.reset();
    await el.updateComplete;
    expect(el.value).to.deep.equal(['alpha', 'beta']);
  });

  it('should have listbox role on the list container', async () => {
    const el = await fixture(html`
      <zn-priority-list label="My List">
        <div value="a">A</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const list = el.shadowRoot.querySelector('.priority-list');
    expect(list.getAttribute('role')).to.equal('listbox');
    expect(list.getAttribute('aria-orientation')).to.equal('vertical');
  });

  it('should have option role on each item', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <div value="a">A</div>
        <div value="b">B</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const items = el.shadowRoot.querySelectorAll('.priority-list__item');
    items.forEach((item: Element) => {
      expect(item.getAttribute('role')).to.equal('option');
    });
  });

  it('should render drag handles', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <div value="a">A</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const handles = el.shadowRoot.querySelectorAll('.priority-list__handle');
    expect(handles.length).to.equal(1);
  });

  it('should disable dragging when disabled', async () => {
    const el = await fixture(html`
      <zn-priority-list disabled>
        <div value="a">A</div>
      </zn-priority-list>
    `) as any;

    await el.updateComplete;
    const item = el.shadowRoot.querySelector('.priority-list__item');
    expect(item.getAttribute('draggable')).to.equal('false');
    expect(item.getAttribute('tabindex')).to.equal('-1');
  });

  it('should announce its form before submitting a reorder, so a host can intercept it', async () => {
    const form = await fixture(html`
      <form action="/save" method="post">
        <zn-priority-list name="sections" formaction="/save">
          <div value="a">A</div>
          <div value="b">B</div>
        </zn-priority-list>
      </form>
    `) as HTMLFormElement;

    const el = form.querySelector('zn-priority-list') as any;
    await el.updateComplete;

    const announced: Element[] = [];
    const onRegister = (e: Event) => announced.push((e as CustomEvent).detail.element);
    document.addEventListener('zn-register-element', onRegister);

    let submitter: HTMLElement | null = null;
    form.addEventListener('submit', (e: SubmitEvent) => {
      submitter = e.submitter;
      e.preventDefault();
    });

    const item = el.shadowRoot.querySelector('.priority-list__item');
    item.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    document.removeEventListener('zn-register-element', onRegister);

    expect(announced).to.include(form);
    expect(submitter).to.exist;
    expect(submitter!.getAttribute('formaction')).to.equal('/save');
  });

  it('draws flush rows divided edge to edge without priority numbers', async () => {
    const el = await fixture(html`
      <zn-priority-list label="Order" flush hide-priority style="--zn-border-color: 1, 2, 3">
        <div value="a">A</div>
        <div value="b">B</div>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;

    const [first, last] = el.shadowRoot.querySelectorAll('.priority-list__item');
    expect(getComputedStyle(first).borderTopWidth).to.equal('0px');
    expect(getComputedStyle(first).borderRadius).to.equal('0px');
    expect(getComputedStyle(first).borderBottomWidth).to.equal('1px');
    expect(getComputedStyle(last).borderBottomWidth).to.equal('0px');
    expect(getComputedStyle(el.shadowRoot.querySelector('.priority-list__priority')).display).to.equal('none');
    expect(getComputedStyle(el.shadowRoot.querySelector('.form-control__label')).position).to.equal('absolute');
    expect(getComputedStyle(el.shadowRoot.querySelector('.form-control-input')).margin).to.equal('0px');
  });

  it('keeps actions inside tile items clickable', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <zn-tile value="a" caption="Second chance">
          <zn-button slot="actions" label="Edit"></zn-button>
        </zn-tile>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;
    const tile = el.querySelector('zn-tile');
    await tile.updateComplete;

    expect(getComputedStyle(tile).pointerEvents).to.equal('none');
    expect(getComputedStyle(tile.shadowRoot.querySelector('.tile__right')).pointerEvents).to.equal('auto');
    expect(el.shadowRoot.querySelector('.priority-list__item').getAttribute('aria-label')).to.equal('Second chance - priority 1');
  });

  it('re-renders when an item locks after first render', async () => {
    const el = await fixture(html`
      <zn-priority-list move-buttons>
        <div value="a">A</div>
        <div value="b">B</div>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;

    el.querySelector('[value=b]').setAttribute('locked', '');
    await new Promise(r => setTimeout(r));
    await el.updateComplete;

    expect(el.shadowRoot.querySelectorAll('.priority-list__item--locked')).to.have.length(1);
  });

  it('keeps a locked item in place', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <div value="a">A</div>
        <div value="b">B</div>
        <div value="c" locked>C</div>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;

    const items = el.shadowRoot.querySelectorAll('.priority-list__item');
    items[2].dispatchEvent(new KeyboardEvent('keydown', {key: 'Home', bubbles: true}));
    items[1].dispatchEvent(new KeyboardEvent('keydown', {key: 'End', bubbles: true}));
    await el.updateComplete;

    expect(el.value).to.deep.equal(['a', 'b', 'c']);
    expect(items[2].getAttribute('draggable')).to.equal('false');
  });

  it('moves items with the move buttons', async () => {
    const el = await fixture(html`
      <zn-priority-list move-buttons>
        <div value="a">A</div>
        <div value="b">B</div>
        <div value="c" locked>C</div>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;

    const rows = () => [...el.shadowRoot.querySelectorAll('.priority-list__item')] as HTMLElement[];
    const [first, second, locked] = rows();
    expect(first.querySelector('zn-button[label="Move up"]')!.hasAttribute('disabled')).to.be.true;
    expect(second.querySelector('zn-button[label="Move down"]')!.hasAttribute('disabled')).to.be.true;
    expect(locked.querySelector('zn-button')).to.not.exist;

    const down = first.querySelector('zn-button[label="Move down"]') as any;
    await down.updateComplete;
    down.shadowRoot.querySelector('button').click();
    await el.updateComplete;
    expect(el.value).to.deep.equal(['b', 'a', 'c']);
  });

  describe('dragging', () => {
    const drag = (target: HTMLElement, type: string, dataTransfer: DataTransfer, edge?: 'top' | 'bottom') => {
      const rect = target.getBoundingClientRect();
      const clientY = edge === 'top' ? rect.top + 1 : rect.bottom - 1;
      target.dispatchEvent(new DragEvent(type, {dataTransfer, clientY, bubbles: true, cancelable: true}));
    };

    // A constructed DataTransfer ignores writes to dropEffect, which the browser sets as a drag ends
    const end = (target: HTMLElement, dropEffect: DataTransfer['dropEffect']) => {
      const event = new DragEvent('dragend', {bubbles: true});
      Object.defineProperty(event, 'dataTransfer', {value: {dropEffect}});
      target.dispatchEvent(event);
    };

    const setup = async () => {
      const el = await fixture(html`
        <zn-priority-list>
          <div value="a">A</div>
          <div value="b">B</div>
          <div value="c">C</div>
        </zn-priority-list>
      `) as any;
      await el.updateComplete;
      const reorders: string[][] = [];
      el.addEventListener('zn-reorder', () => reorders.push([...el.value]));
      const rows = () => [...el.shadowRoot.querySelectorAll('.priority-list__item')] as HTMLElement[];
      return {el, reorders, rows};
    };

    it('swaps only once the pointer crosses the target midpoint', async () => {
      const {el, reorders, rows} = await setup();
      const dt = new DataTransfer();

      drag(rows()[0], 'dragstart', dt);
      drag(rows()[1], 'dragover', dt, 'top');
      expect(el.value).to.deep.equal(['a', 'b', 'c']);

      drag(rows()[1], 'dragover', dt, 'bottom');
      expect(el.value).to.deep.equal(['b', 'a', 'c']);
      await el.updateComplete;

      end(rows()[1], 'move');
      expect(reorders).to.deep.equal([['b', 'a', 'c']]);
    });

    it('restores the order and stays silent when the drag is cancelled', async () => {
      const {el, reorders, rows} = await setup();
      const dt = new DataTransfer();

      drag(rows()[0], 'dragstart', dt);
      drag(rows()[2], 'dragover', dt, 'bottom');
      expect(el.value).to.deep.equal(['b', 'c', 'a']);
      await el.updateComplete;

      end(rows()[2], 'none');
      expect(el.value).to.deep.equal(['a', 'b', 'c']);
      expect(reorders).to.be.empty;
    });
  });

  it('puts the move buttons ahead of the item actions, with tooltips', async () => {
    const el = await fixture(html`
      <zn-priority-list move-buttons>
        <div value="a">A</div>
        <zn-button slot="action-a" tooltip="Edit"></zn-button>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;

    const actions = el.shadowRoot.querySelector('.priority-list__actions');
    expect(actions.firstElementChild.classList.contains('priority-list__move')).to.be.true;
    expect(actions.lastElementChild.getAttribute('name')).to.equal('action-a');
    expect(actions.querySelector('zn-button[label="Move up"]').getAttribute('tooltip')).to.equal('Move up');
  });

  it('keeps a linked tile clickable without letting its link take the drag', async () => {
    const el = await fixture(html`
      <zn-priority-list>
        <zn-tile value="a" caption="Second chance" href="/steps/a"></zn-tile>
        <zn-tile value="b" caption="Confirmation"></zn-tile>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;
    const [linked, plain] = el.querySelectorAll('zn-tile');
    await linked.updateComplete;

    expect(getComputedStyle(linked).pointerEvents).to.equal('auto');
    expect(getComputedStyle(plain).pointerEvents).to.equal('none');
    expect(linked.shadowRoot.querySelector('a.tile__link').getAttribute('draggable')).to.equal('false');
  });

  it('selects an item on click and passes the click on to it', async () => {
    const el = await fixture(html`
      <zn-priority-list label="Sections" selectable selected="a">
        <div value="a">A</div>
        <div value="b">B</div>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;

    const clicked: string[] = [];
    el.querySelector('[value="b"]').addEventListener('click', () => clicked.push('b'));
    const selected: string[] = [];
    el.addEventListener('zn-select', (e: CustomEvent) => selected.push(e.detail.item.getAttribute('value')));

    const items = el.shadowRoot.querySelectorAll('.priority-list__item');
    expect(items[0].getAttribute('aria-selected')).to.equal('true');
    items[1].click();
    await el.updateComplete;

    expect(el.selected).to.equal('b');
    expect(clicked).to.deep.equal(['b']);
    expect(selected).to.deep.equal(['b']);
    expect(el.shadowRoot.querySelectorAll('.priority-list__item')[1].getAttribute('aria-selected')).to.equal('true');
  });

  it('follows the item zn-tabs marks active', async () => {
    const el = await fixture(html`
      <zn-priority-list label="Sections" selectable selected="a">
        <div value="a">A</div>
        <div value="b">B</div>
      </zn-priority-list>
    `) as any;
    await el.updateComplete;

    el.querySelector('[value="b"]').classList.add('zn-tb-active');
    await new Promise(resolve => setTimeout(resolve));
    await el.updateComplete;

    expect(el.shadowRoot.querySelectorAll('.priority-list__item')[1].getAttribute('aria-selected')).to.equal('true');
  });

  it('should round the placeholder to the panel corner it moves into while dragging', async () => {
    const panel = await fixture(html`
      <zn-panel flush style="--zn-panel-border-radius: 12px">
        <zn-priority-list flush>
          <div value="a">A</div>
          <div value="b">B</div>
          <div value="c">C</div>
        </zn-priority-list>
      </zn-panel>
    `);
    const el = panel.querySelector('zn-priority-list')!;
    await el.updateComplete;
    const rows = () => [...el.shadowRoot!.querySelectorAll<HTMLElement>('.priority-list__item')];
    const placeholderRadius = () => getComputedStyle(el.shadowRoot!.querySelector('.priority-list__item--dragging')!).borderRadius;

    rows()[1].dispatchEvent(new DragEvent('dragstart', {bubbles: true, composed: true, dataTransfer: new DataTransfer()}));
    await aTimeout(50);
    expect(placeholderRadius()).to.equal('0px');

    const top = rows()[0].getBoundingClientRect();
    rows()[0].dispatchEvent(new DragEvent('dragover', {bubbles: true, composed: true, cancelable: true, clientY: top.top + 1}));
    await el.updateComplete;
    expect(placeholderRadius()).to.equal('12px 12px 0px 0px');
  });
});
