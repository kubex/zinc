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
});
