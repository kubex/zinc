import ZnFlowStep from './flow-step.component';

export * from './flow-step.component';
export default ZnFlowStep;

ZnFlowStep.define('zn-flow-step');

declare global {
  interface HTMLElementTagNameMap {
    'zn-flow-step': ZnFlowStep;
  }
}
