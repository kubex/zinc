import ZnVerticalStepper from './vertical-stepper.component';

export * from './vertical-stepper.component';
export default ZnVerticalStepper;

ZnVerticalStepper.define('zn-vertical-stepper');

declare global {
  interface HTMLElementTagNameMap {
    'zn-vertical-stepper': ZnVerticalStepper;
  }
}
