import ZnKanbanItem from './kanban-item.component';

export * from './kanban-item.component';
export default ZnKanbanItem;

ZnKanbanItem.define('zn-kanban-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-kanban-item': ZnKanbanItem;
  }
}
