import ZnChip from './chip.component';

export * from './chip.component';
export default ZnChip;

ZnChip.define('zn-chip');

declare global {
  interface HTMLElementTagNameMap {
    'zn-chip': ZnChip;
  }
}
