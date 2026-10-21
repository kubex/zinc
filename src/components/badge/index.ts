import ZnBadge from './badge.component';

export * from './badge.component';
export default ZnBadge;

ZnBadge.define('zn-badge');

declare global {
  interface HTMLElementTagNameMap {
    'zn-badge': ZnBadge;
  }
}
