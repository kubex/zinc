import ZnStepper from './stepper.component';

export * from './stepper.component';
export default ZnStepper;

ZnStepper.define('zn-stepper');

declare global {
  interface HTMLElementTagNameMap {
    'zn-stepper': ZnStepper;
  }
}
