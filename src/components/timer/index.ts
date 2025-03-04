import ZnTimer from './timer.component';

export * from './timer.component';
export default ZnTimer;

ZnTimer.define('zn-timer');

declare global {
  interface HTMLElementTagNameMap {
    'zn-timer': ZnTimer;
  }
}
