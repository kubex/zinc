import ZnKanban from './kanban.component';

export * from './kanban.component';
export default ZnKanban;

ZnKanban.define('zn-kanban');

declare global {
  interface HTMLElementTagNameMap {
    'zn-kanban': ZnKanban;
  }
}
