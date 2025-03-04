import ZnTextarea from './textarea.component';

export * from './textarea.component';
export default ZnTextarea;

ZnTextarea.define('zn-textarea');

declare global {
  interface HTMLElementTagNameMap {
    'zn-textarea': ZnTextarea;
  }
}
