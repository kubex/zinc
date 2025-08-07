import ZnSkeleton from './skeleton.component';

export * from './skeleton.component';
export default ZnSkeleton;

ZnSkeleton.define('zn-skeleton');

declare global {
  interface HTMLElementTagNameMap {
    'zn-skeleton': ZnSkeleton;
  }
}
