import ZnFlowCanvas from './flow-canvas.component';

export * from './flow-canvas.component';
export default ZnFlowCanvas;

ZnFlowCanvas.define('zn-flow-canvas');

declare global {
  interface HTMLElementTagNameMap {
    'zn-flow-canvas': ZnFlowCanvas;
  }
}
