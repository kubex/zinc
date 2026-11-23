import '../../../dist/zn.min.js';
import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import { centre, dragTo, drop, startDrag } from '../../internal/test-drag';
import type ZnKanban from './kanban.component';
import type ZnKanbanColumn from './modules/kanban-column';
import type ZnKanbanItem from './modules/kanban-item';

const board = () => fixture<ZnKanban>(html`
  <zn-kanban>
    <zn-kanban-column value="todo" caption="To do">
      <zn-kanban-item value="a">A</zn-kanban-item>
      <zn-kanban-item value="b">B</zn-kanban-item>
    </zn-kanban-column>
    <zn-kanban-column value="done" caption="Done"></zn-kanban-column>
  </zn-kanban>
`);

const dragInto = (item: ZnKanbanItem, column: ZnKanbanColumn) => {
  const {x, y} = centre(column);
  startDrag(item);
  dragTo(x, y);
  drop(x, y);
};

const count = (column: ZnKanbanColumn) => column.shadowRoot!.querySelector('[part="count"]')!.textContent;

describe('<zn-kanban>', () => {
  it('counts each column and shows the empty state when it has no items', async () => {
    const el = await board();
    const [todo, done] = el.columns;
    await todo.updateComplete;

    expect(count(todo)).to.equal('2');
    expect(done.shadowRoot!.querySelector<HTMLElement>('.kanban-column__empty')!.hidden).to.be.false;
  });

  it('moves a dropped item into the column and emits zn-move', async () => {
    const el = await board();
    const [todo, done] = el.columns;
    const item = todo.items[0] as ZnKanbanItem;
    let detail: {from: Element; to: Element; index: number} | undefined;
    el.addEventListener('zn-move', e => (detail = e.detail));

    dragInto(item, done);
    await aTimeout(0);
    await done.updateComplete;

    expect(item.parentElement).to.equal(done);
    expect(item.dragging).to.be.false;
    expect(detail).to.include({from: todo, to: done, index: 0});
    expect(count(done)).to.equal('1');
  });

  it('puts the item back when zn-move is cancelled', async () => {
    const el = await board();
    const [todo, done] = el.columns;
    const item = todo.items[0] as ZnKanbanItem;
    el.addEventListener('zn-move', e => e.preventDefault());

    dragInto(item, done);

    expect(todo.items[0]).to.equal(item);
  });

  it('puts the item back on Escape', async () => {
    const el = await board();
    const [todo, done] = el.columns;
    const item = todo.items[0] as ZnKanbanItem;
    let moves = 0;
    el.addEventListener('zn-move', () => moves++);

    startDrag(item);
    dragTo(centre(done).x, centre(done).y);
    expect(item.parentElement).to.equal(done);
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));

    expect(todo.items[0]).to.equal(item);
    expect(moves).to.equal(0);
  });

  it('drags cards held in a column\'s zn-infinite-scroll', async () => {
    const el = await fixture<ZnKanban>(html`
      <zn-kanban>
        <zn-kanban-column value="todo" caption="To do">
          <zn-infinite-scroll finished>
            <zn-kanban-item value="a">A</zn-kanban-item>
          </zn-infinite-scroll>
        </zn-kanban-column>
        <zn-kanban-column value="done" caption="Done">
          <zn-infinite-scroll finished></zn-infinite-scroll>
        </zn-kanban-column>
      </zn-kanban>
    `);
    const [todo, done] = el.columns;
    const item = todo.items[0] as ZnKanbanItem;
    let detail: {from: Element; to: Element; index: number} | undefined;
    el.addEventListener('zn-move', e => (detail = e.detail));

    dragInto(item, done);
    await aTimeout(0);
    await done.updateComplete;

    expect(item.parentElement).to.equal(done.container);
    expect(detail).to.include({from: todo, to: done, index: 0});
    expect(count(done)).to.equal('1');
    expect(count(todo)).to.equal('0');
  });

  it('links a card with href without making it natively draggable', async () => {
    const item = await fixture<ZnKanbanItem>(html`<zn-kanban-item href="/ticket/1" data-target="slide">A</zn-kanban-item>`);
    const link = item.shadowRoot!.querySelector('a')!;

    expect(link.getAttribute('href')).to.equal('/ticket/1');
    expect(link.dataset.target).to.equal('slide');
    expect(link.getAttribute('draggable')).to.equal('false');
  });

  describe('move-uri', () => {
    // Stands in for the console: holds the submitted form instead of navigating
    const submitted: HTMLFormElement[] = [];
    const hold = (e: SubmitEvent) => {
      e.preventDefault();
      submitted.push(e.target as HTMLFormElement);
    };
    beforeEach(() => {
      submitted.length = 0;
      document.addEventListener('submit', hold);
    });
    afterEach(() => document.removeEventListener('submit', hold));

    const fields = (form: HTMLFormElement) => Object.fromEntries(new FormData(form));

    it('submits the move as a form', async () => {
      const el = await board();
      el.setAttribute('move-uri', '/move');
      const [todo, done] = el.columns;
      const item = todo.items[0] as ZnKanbanItem;

      dragInto(item, done);
      await aTimeout(0);

      expect(submitted).to.have.length(1);
      expect(submitted[0].getAttribute('action')).to.equal('/move');
      expect(submitted[0].dataset.fetchStyle).to.equal('part');
      expect(fields(submitted[0])).to.deep.equal({item: 'a', from: 'todo', to: 'done', index: '0'});
      submitted[0].dispatchEvent(new CustomEvent('complete', {detail: {response: {status: 200, actions: []}}}));
      expect(item.parentElement).to.equal(done);
      expect(submitted[0].isConnected).to.be.false;
    });

    it('puts the card back and emits zn-error when the move is refused', async () => {
      const el = await board();
      el.setAttribute('move-uri', '/move');
      const [todo, done] = el.columns;
      const item = todo.items[0] as ZnKanbanItem;
      let errors = 0;
      el.addEventListener('zn-error', () => errors++);

      dragInto(item, done);
      await aTimeout(0);
      submitted[0].dispatchEvent(new CustomEvent('complete', {
        detail: {response: {status: 200, actions: [{action: 'alert', style: 'error'}]}}
      }));

      expect(todo.items[0]).to.equal(item);
      expect(errors).to.equal(1);
    });
  });

  it('neither counts nor drags a zn-infinite-scroll loader placeholder', async () => {
    const el = await fixture<ZnKanban>(html`
      <zn-kanban>
        <zn-kanban-column value="todo" caption="To do">
          <zn-infinite-scroll finished>
            <zn-kanban-item value="a">A</zn-kanban-item>
            <zn-kanban-item slot="loader">Loading</zn-kanban-item>
          </zn-infinite-scroll>
        </zn-kanban-column>
      </zn-kanban>
    `);
    const [todo] = el.columns;
    await todo.updateComplete;

    expect(todo.items.map(item => (item as ZnKanbanItem).value)).to.deep.equal(['a']);
    expect(count(todo)).to.equal('1');
  });
});
