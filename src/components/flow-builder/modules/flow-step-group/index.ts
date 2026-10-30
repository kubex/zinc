import ZnFlowStepGroup from './flow-step-group.component';

export * from './flow-step-group.component';
export default ZnFlowStepGroup;

ZnFlowStepGroup.define('zn-flow-step-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-flow-step-group': ZnFlowStepGroup;
  }
}
