import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

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
});
