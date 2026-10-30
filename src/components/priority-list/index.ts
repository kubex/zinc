import ZnPriorityList from './priority-list.component';

export * from './priority-list.component';
export default ZnPriorityList;

ZnPriorityList.define('zn-priority-list');

declare global {
  interface HTMLElementTagNameMap {
    'zn-priority-list': ZnPriorityList;
  }
}
