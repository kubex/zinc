import ZnSlideout from './slideout.component';

export * from './slideout.component';
export default ZnSlideout;

ZnSlideout.define('zn-slideout');

declare global {
  interface HTMLElementTagNameMap {
    'zn-slideout': ZnSlideout;
  }
}
