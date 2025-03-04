import ZnStat from './stat.component';

export * from './stat.component';
export default ZnStat;

ZnStat.define('zn-stat');

declare global {
  interface HTMLElementTagNameMap {
    'zn-stat': ZnStat;
  }
}
