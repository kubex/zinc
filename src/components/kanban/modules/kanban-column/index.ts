import ZnKanbanColumn from './kanban-column.component';

export * from './kanban-column.component';
export default ZnKanbanColumn;

ZnKanbanColumn.define('zn-kanban-column');

declare global {
  interface HTMLElementTagNameMap {
    'zn-kanban-column': ZnKanbanColumn;
  }
}
