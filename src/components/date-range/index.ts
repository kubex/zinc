import ZnDateRange from './date-range.component';

export * from './date-range.component';
export default ZnDateRange;

ZnDateRange.define('zn-date-range');

declare global {
  interface HTMLElementTagNameMap {
    'zn-date-range': ZnDateRange;
  }
}
