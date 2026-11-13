import ZnInfiniteScroll from './infinite-scroll.component';

export * from './infinite-scroll.component';
export default ZnInfiniteScroll;

ZnInfiniteScroll.define('zn-infinite-scroll');

declare global {
  interface HTMLElementTagNameMap {
    'zn-infinite-scroll': ZnInfiniteScroll;
  }
}
