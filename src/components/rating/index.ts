import ZnRating from './rating.component';

export * from './rating.component';
export default ZnRating;

ZnRating.define('zn-rating');

declare global {
  interface HTMLElementTagNameMap {
    'zn-rating': ZnRating;
  }
}
