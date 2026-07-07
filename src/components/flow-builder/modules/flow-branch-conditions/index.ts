import ZnFlowBranchConditions from './flow-branch-conditions.component';

export * from './flow-branch-conditions.component';
export default ZnFlowBranchConditions;

ZnFlowBranchConditions.define('zn-flow-branch-conditions');

declare global {
  interface HTMLElementTagNameMap {
    'zn-flow-branch-conditions': ZnFlowBranchConditions;
  }
}
