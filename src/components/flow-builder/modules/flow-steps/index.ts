import ZnFlowSteps from './flow-steps.component';

export * from './flow-steps.component';
export default ZnFlowSteps;

ZnFlowSteps.define('zn-flow-steps');

declare global {
  interface HTMLElementTagNameMap {
    'zn-flow-steps': ZnFlowSteps;
  }
}
