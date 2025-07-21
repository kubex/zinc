import ZnWell from './well.component';

export * from './well.component';
export default ZnWell;

ZnWell.define('zn-well');

declare global {
  interface HTMLElementTagNameMap {
    'zn-well': ZnWell;
  }
}
