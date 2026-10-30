import ZnFlowNode from './flow-node.component';

export * from './flow-node.component';
export default ZnFlowNode;

ZnFlowNode.define('zn-flow-node');

declare global {
  interface HTMLElementTagNameMap {
    'zn-flow-node': ZnFlowNode;
  }
}
