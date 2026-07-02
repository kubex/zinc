import ZnFlowBuilder from './flow-builder.component';

export * from './flow-builder.component';
export * from './flow.types';
export * from './flow-registry';
export default ZnFlowBuilder;

ZnFlowBuilder.define('zn-flow-builder');

declare global {
  interface HTMLElementTagNameMap {
    'zn-flow-builder': ZnFlowBuilder;
  }
}
