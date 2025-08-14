import ZnContentBlock from './content-block.component';

export * from './content-block.component';
export default ZnContentBlock;

ZnContentBlock.define('zn-content-block');

declare global {
  interface HTMLElementTagNameMap {
    'zn-content-block': ZnContentBlock;
  }
}
